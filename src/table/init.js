import { col, viewArr } from "./constants.js";
import { afterChange, afterRemoveRow } from "./hooks.js";

/**
 * Initialises and registers the custom cell validators for handsontable so
 * that they can be used in the configuration
 */
export function validators(Handsontable) {
  /* checks if the value is positive or (intentionally) emyty
   */
  Handsontable.validators.registerValidator("positive", (value, cb) =>
    cb(value > 0 || value === null || value === "N/A")
  );
}

/**
 * Initialises and registers the custom cell renderers for handsontable so
 * that they can be used in the configuration
 */
export function renderers(Handsontable) {
  /* Scale the Value according to the unit format:
   * - one given unit: don't scale
   * - three given unit: scale such that 1 <= value < 1000, if possible.
   *    the middle unit is the base (= "input") unit
   * - else: return without (with empty) unit
   */
  function scaleValue(value, unit) {
    // one unit
    if (typeof unit === "string") return { val: value, unit: " " + unit };

    // array of three units
    if (Array.isArray(unit) && unit.length === 3) {
      if (value < 1) return { val: value * 1000, unit: " " + unit[0] };
      else if (value < 1000) return { val: value, unit: " " + unit[1] };
      else return { val: value / 1000, unit: " " + unit[2] };
    }

    // no units or wrong format
    return { val: value, unit: "" };
  }

  // round the number to a specified precision of significant figures
  function toSigFig(td, value, precision, unit) {
    if (value > 0) {
      const scaled = scaleValue(value, unit);
      td.innerHTML = Number(scaled.val).toPrecision(precision) + scaled.unit;
    }
  }

  // round the number to a specified amount of digits after the decimal point
  function toRounded(td, value, precision, unit) {
    if (value > 0) {
      const scaled = scaleValue(value, unit);
      td.innerHTML = Number(scaled.val).toFixed(precision) + scaled.unit;
    }
  }

  /* Status shows only as one Emoji (=first character).
   * The rest of the Status is displayed as a tooltip when hovering over the cell
   */
  Handsontable.renderers.registerRenderer(
    "statusRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      if (value !== undefined && value !== null)
        td.innerHTML =
          '<div title="' +
          td.innerHTML +
          '">' +
          Array.from(td.innerHTML)[0] +
          "</div>";
    }
  );

  Handsontable.renderers.registerRenderer(
    "eqRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toSigFig(td, value, hot._$prescision);
    }
  );

  Handsontable.renderers.registerRenderer(
    "amountRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toSigFig(td, value, hot._$prescision, ["μmol", "mmol", "mol"]);
    }
  );

  Handsontable.renderers.registerRenderer(
    "mwRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toRounded(td, value, 2, "g/mol");
    }
  );

  Handsontable.renderers.registerRenderer(
    "densityRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toRounded(td, value, 3, "g/cm³");
    }
  );

  Handsontable.renderers.registerRenderer(
    "massRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toSigFig(td, value, hot._$prescision, ["mg", "g", "kg"]);
    }
  );

  Handsontable.renderers.registerRenderer(
    "volumeRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      toSigFig(td, value, hot._$prescision, ["μL", "mL", "L"]);
    }
  );

  /* Make link clickable and open in new Tab.
   * rel="..." is needed for security reasons
   */
  Handsontable.renderers.registerRenderer(
    "linkRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      if (value !== undefined && value !== null) {
        td.innerHTML =
          '<a href="' +
          td.innerHTML +
          '" target="_blank" rel="noreferrer noopener">PubChem</a>';
      }
    }
  );
}

/**
 * Initialises the View functionalities for the table, that can be toggled by
 * the corresponding button
 */
export function views(table) {
  const button = document.getElementById("viewState-button");
  table._viewState = "Standard";

  table.setView = ((table, viewArr) =>
    function (viewName) {
      table.hot.getPlugin("hiddenColumns").hideColumns(viewArr.All);
      table.hot.getPlugin("hiddenColumns").showColumns(viewArr[viewName]);
      table.hot.render();

      table._viewState = viewName;
      button.innerHTML = "View: " + viewName;
    })(table, viewArr);

  table.nextView = ((table) =>
    function () {
      if (table._viewState == "Standard") table.setView("Minimal");
      else if (table._viewState == "Minimal") table.setView("Extended");
      else if (table._viewState == "Extended") table.setView("Standard");
    })(table);

  table.setView("Standard");
  button.onclick = table.nextView;
}

// re-set a cell to fix a render bug for the table header
function rerender(hot) {
  const notes = hot.getDataAtRowProp(0, col.Notes.prop);
  hot.setDataAtRowProp(0, col.Notes.prop, notes);
}

export function prescision(table) {
  const button = document.getElementById("prescision-button");
  table._prescision = 3;

  table.setPrescision = ((table) =>
    function (prescision) {
      table._prescision = prescision;
      const precName = ((prec) => {
        if (prec === 3) return "Regular";
        if (prec === 4) return "High";
        return `${prec} digits`;
      })(prescision);

      // set prescision in hot instance so that the renderers have access to it
      table.hot._$prescision = prescision;
      rerender(table.hot);

      button.innerHTML = "Prescision: " + precName;
    })(table);

  table.nextPrescision = ((table) =>
    function () {
      if (table._prescision === 3) table.setPrescision(4);
      else if (table._prescision === 4) table.setPrescision(3);
    })(table);

  table.setPrescision(3);
  button.onclick = table.nextPrescision;
}

export function hooks(Handsontable, hot, db) {
  Handsontable.hooks.add("afterChange", afterChange(hot, db), hot);
  Handsontable.hooks.add("afterRemoveRow", afterRemoveRow(hot), hot);
}
