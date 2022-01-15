import { viewArr } from "./constants.js";
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
  // ronud the number to a specified precision of significant figures
  function sigFigRenderHelper(td, value, precision, unit) {
    if (value > 0) {
      let val_scaled, unit_str;
      [val_scaled, unit_str] = ((value, unit) => {
        if (typeof unit === "string") {
          // if only one (or no) unit is given, just return as is
          return [value, " " + unit];
        } else if (Array.isArray(unit) && unit.length === 3) {
          /* if multiple (=3) units are given, scale to the correct order of
           * magnitude, so that the number shows between 1 and 1000 if possible
           * The middle unit (unit[1]) is the base unit, with which the value
           * has to be entered
           */
          if (value < 1) return [value * 1000, unit[0]];
          else if (value < 1000) return [value, unit[1]];
          else return [value / 1000, unit[2]];
        } else return [value, ""]; // no units or wrong format -> just get value
      })(value, unit);

      td.innerHTML = Number(val_scaled).toPrecision(precision) + unit_str;
      // If rounding instead of significant figures is desired, replace whith this:
      // td.innerHTML = Number(value).toFixed(precision) + unit_str;
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
      sigFigRenderHelper(td, value, 4);
    }
  );

  Handsontable.renderers.registerRenderer(
    "amountRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      sigFigRenderHelper(td, value, 4, ["μmol", "mmol", "mol"]);
    }
  );

  Handsontable.renderers.registerRenderer(
    "mwRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      sigFigRenderHelper(td, value, 4, "g/mol");
    }
  );

  Handsontable.renderers.registerRenderer(
    "densityRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      sigFigRenderHelper(td, value, 4, "g/cm³");
    }
  );

  Handsontable.renderers.registerRenderer(
    "massRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      sigFigRenderHelper(td, value, 4, ["mg", "g", "kg"]);
    }
  );

  Handsontable.renderers.registerRenderer(
    "volumeRender",
    function (hot, td, row, col, prop, value) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      sigFigRenderHelper(td, value, 4, ["μL", "mL", "L"]);
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

export function hooks(Handsontable, hot, db) {
  Handsontable.hooks.add("afterChange", afterChange(hot, db), hot);
  Handsontable.hooks.add("afterRemoveRow", afterRemoveRow(hot), hot);
}
