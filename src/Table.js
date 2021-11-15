import PubChem from "./PubChem.js";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import html2canvas from "html2canvas";

/**
 * Adds a Validator to the Table that checks if the value is positive or
 * (intentionally) emyty
 */
Handsontable.validators.registerValidator("positive", (value, cb) =>
  cb(value > 0 || value === null || value === "N/A")
);

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
  "linkRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (value !== undefined && value !== null) {
      td.innerHTML = '<a href="' + td.innerHTML + '">PubChem</a>';
    }
  }
);

function sigFigRenderHelper(td, value, unit, precision) {
  if (value > 0) {
    td.innerHTML = Number(value).toPrecision(precision) + " " + unit;
  }
}

function roundedRenderHelper(td, value, unit, precision) {
  if (value > 0) {
    td.innerHTML = Number(value).toFixed(precision) + " " + unit;
  }
}

Handsontable.renderers.registerRenderer(
  "eqRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // fracUnitRenderHelper(td, value, "");
    roundedRenderHelper(td, value, "", 2);
  }
);

Handsontable.renderers.registerRenderer(
  "amountRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    roundedRenderHelper(td, value, "mol", 2);
  }
);

Handsontable.renderers.registerRenderer(
  "mwRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // fracUnitRenderHelper(td, value, "g/mol");
    roundedRenderHelper(td, value, "g/mol", 3);
  }
);

Handsontable.renderers.registerRenderer(
  "densityRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // fracUnitRenderHelper(td, value, "g/cm³");
    roundedRenderHelper(td, value, "g/cm", 4);
  }
);

Handsontable.renderers.registerRenderer(
  "massRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // fracUnitRenderHelper(td, value, "g");
    sigFigRenderHelper(td, value, "g", 3);
  }
);

Handsontable.renderers.registerRenderer(
  "volumeRender",
  function (hot, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    // fracUnitRenderHelper(td, value, "mL");
    sigFigRenderHelper(td, value, "mL", 3);
  }
);

const col = {
  Status: {
    prop: "status",
    name: "",
    settings: { width: 25, readOnly: true, renderer: "statusRender" },
  },
  Type: {
    prop: "type",
    defaultValue: "[auto]",
    name: "Type",
    settings: {
      type: "dropdown",
      source: [
        "[auto]",
        "[locked]",
        "CAS",
        "Name",
        "CID",
        "SMILES",
        "InChIKey",
        "InChI",
      ],
      width: 100,
    },
  },
  Search: { prop: "search", name: "Search", settings: {} },
  Amount: {
    prop: "amount",
    name: "Amount",
    settings: { validator: "positive", renderer: "amountRender" },
  }, //Stoffmenge, format: x mol
  EQ: {
    prop: "eq.val",
    name: "Eq",
    settings: { validator: "positive", renderer: "eqRender" },
  }, //Äquivalente / Equivalents
  EQRef: {
    prop: "eq.ref",
    defaultValue: false,
    name: "EqRef",
    settings: { type: "checkbox" },
  },

  CAS: { prop: "id.CAS", name: "CAS", settings: {} },
  Name: { prop: "id.Name", name: "Name", settings: {} },
  CID: { prop: "id.CID", name: "CID", settings: {} },
  SMILES: { prop: "id.SMILES", name: "SMILES", settings: {} },
  InChIKey: { prop: "id.InChIKey", name: "InChIKey", settings: {} },
  InChI: { prop: "id.InChI", name: "InChI", settings: {} },

  MW: {
    prop: "prop.mw",
    name: "MW",
    settings: { validator: "positive", renderer: "mwRender" },
  }, //molecular weight, format: x g/mol
  Density: {
    prop: "prop.density",
    name: "Density",
    settings: { validator: "positive", renderer: "densityRender" },
  },
  Mass: {
    prop: "prop.mass",
    name: "Mass",
    settings: { validator: "positive", renderer: "massRender" },
  },
  Volume: {
    prop: "prop.volume",
    name: "Volume",
    settings: { validator: "positive", renderer: "volumeRender" },
  },
  Notes: { prop: "notes", name: "Notes", settings: { width: 250 } },
  Source: {
    prop: "source",
    name: "Source",
    settings: { readOnly: true, renderer: "linkRender" },
  },
  Highlight: { prop: "highlight", name: "", settings: { readOnly: true } },
};
Object.keys(col).forEach((key) => (col[key].settings.data = col[key].prop));
Object.keys(col).forEach((key, i) => (col[key].idx = i));
Object.freeze(col);

const schema = {};
Object.keys(col).forEach((key) => {
  const [fst, snd] = col[key].prop.split(".");
  const val = "defaultValue" in col[key] ? col[key].defaultValue : null;
  if (snd === undefined) schema[fst] = val;
  else {
    if (!(fst in schema)) schema[fst] = {};
    schema[fst][snd] = val;
  }
});

const settings = {
  data: [{}],
  dataSchema: schema,

  // rows
  rowHeaders: () => "",
  rowHeaderWidth: 15,
  minRows: 1,
  minSpareRows: 1,
  manualRowMove: true,

  // columns
  colHeaders: Object.values(col).map((val) => val.name),
  columns: Object.values(col).map((val) => val.settings),
  hiddenColumns: {
    columns: [
      col.Name.idx,
      col.CID.idx,
      col.SMILES.idx,
      col.InChIKey.idx,
      col.InChI.idx,
      col.Highlight.idx,
    ],
    copyPasteEnabled: false,
  },

  // general
  contextMenu: [
    "row_above",
    "row_below",
    "remove_row",
    // "hidden_columns_hide",
    // "hidden_columns_show",
  ],
  persistentState: true,
  licenseKey: "non-commercial-and-evaluation",
};

function getEQRefRow(hot) {
  return hot.getDataAtProp(col.EQRef.prop).indexOf(true);
}

function redrawSearchState(hot, row) {
  const cells = hot.getDataAtRowProp(row, col.Highlight.prop).split(",");
  cells.forEach((cell) => {
    if (cell >= 0) hot.setCellMeta(row, Number(cell), "className", "search-bg");
  });
}

function toggleSearchState(hot, row, cells, state) {
  if (typeof cells === "number") {
    cells = [cells];
  }

  let highlighted = hot.getDataAtRowProp(row, col.Highlight.prop) || "";

  cells.forEach((cell) => {
    if (state) {
      hot.setCellMeta(row, cell, "className", "search-bg");
      highlighted += "," + cell;
    } else {
      hot.setCellMeta(row, cell, "className", "");
      highlighted = highlighted.replaceAll("," + cell, "");
    }
  });

  hot.setDataAtRowProp(row, col.Highlight.prop, highlighted, "updateHighlight");
}

function updateProperties(hot, row) {
  const source = "updateProperties";

  const amount = hot.getDataAtRowProp(row, col.Amount.prop);
  const mw = hot.getDataAtRowProp(row, col.MW.prop);
  const density = hot.getDataAtRowProp(row, col.Density.prop);

  if (amount > 0 && mw > 0) {
    hot.setDataAtRowProp(row, col.Mass.prop, amount * mw, source);
  }

  if (amount > 0 && mw > 0 && density > 0) {
    hot.setDataAtRowProp(row, col.Volume.prop, (amount * mw) / density, source);
  }
}

function updateAmount(hot, row, prop, val) {
  const source = "updateAmount";

  const mw = hot.getDataAtRowProp(row, col.MW.prop);
  const density = hot.getDataAtRowProp(row, col.Density.prop);
  if (prop === col.Mass.prop && val > 0 && mw > 0) {
    hot.setDataAtRowProp(row, col.Amount.prop, val / mw, source);
  }
  if (prop === col.Volume.prop && density > 0 && val > 0 && mw > 0) {
    hot.setDataAtRowProp(row, col.Amount.prop, (density * val) / mw, source);
  }
  if (prop === col.Volume.prop && density <= 0) {
    hot.setDataAtRowProp(row, col.Volume.prop, "N/A");
  }
}

function updateEQs(hot, row, prop, val) {
  const source = "updateEQs";

  const refRow = getEQRefRow(hot);
  const refAmount = hot.getDataAtRowProp(refRow, col.Amount.prop);

  if (row === refRow && (prop === col.Amount.prop || prop === col.EQRef.prop)) {
    const amounts = hot.getDataAtProp(col.Amount.prop);
    const EQs = hot.getDataAtProp(col.EQ.prop);
    EQs[refRow] = 1;

    for (let i = 0; i < amounts.length - 1; i++) {
      if (amounts[i] > 0 && refAmount > 0) {
        EQs[i] = amounts[i] / refAmount;
      }
    }
    for (let i = 0; i < amounts.length - 1; i++) {
      if (EQs[i] > 0 && refAmount > 0) {
        amounts[i] = EQs[i] * refAmount;
      }
    }

    const len = { length: amounts.length - 1 };
    const idxToEntryEQ = (_, i) => [i, col.EQ.prop, EQs[i]];
    const idxToEntryAmount = (_, i) => [i, col.Amount.prop, amounts[i]];
    hot.setDataAtRowProp(Array.from(len, idxToEntryEQ), source);
    hot.setDataAtRowProp(Array.from(len, idxToEntryAmount), source);
  }

  if (row === refRow && prop === col.EQ.prop) {
    hot.setDataAtRowProp(row, col.EQ.prop, 1, source);
  }

  if (row !== refRow && prop === col.Amount.prop) {
    if (val > 0 && refAmount > 0) {
      hot.setDataAtRowProp(row, col.EQ.prop, val / refAmount, source);
    }
    if (val === undefined || val === null) {
      hot.setDataAtRowProp(row, col.EQ.prop, null, source);
    }
  }

  if (row !== refRow && prop === col.EQ.prop) {
    if (val > 0 && refAmount > 0) {
      hot.setDataAtRowProp(row, col.Amount.prop, val * refAmount, source);
    }
    if (val === undefined || val === null) {
      hot.setDataAtRowProp(row, col.Amount.prop, null, source);
    }
  }
}

function addHooks(hot, db) {
  const afterChange = (changes, source) => {
    changes?.forEach(([row, prop, oldValue, newValue]) => {
      // if it didn't actually change don't do anything
      if (oldValue === newValue) return;

      if (prop === col.Type.prop) {
        if (newValue === "[locked]")
          hot.setDataAtRowProp(
            row,
            col.Status.prop,
            "\u{1F512}Locked",
            "searchLock"
          );
        else hot.setDataAtRowProp(row, col.Status.prop, null, "searchLock");
      }

      if (
        (prop === col.CAS.prop ||
          prop === col.CAS.prop ||
          prop === col.Name.prop ||
          prop === col.InChI.prop ||
          prop === col.InChIKey.prop ||
          prop === col.CID.prop ||
          prop === col.SMILES.prop ||
          prop === col.MW.prop ||
          prop === col.Density.prop ||
          prop === col.Source.prop) &&
        source !== "searchFill"
      ) {
        toggleSearchState(hot, row, hot.propToCol(prop), false);
      }

      if (prop === col.Highlight.prop && source !== "updateHighlight") {
        redrawSearchState(hot, row);
      }

      if (prop === col.Search.prop) {
        if (newValue === "" || newValue === null || newValue === undefined)
          return;

        const type = hot.getDataAtRowProp(row, col.Type.prop);
        const cb = ((row) => (data) => {
          hot.setDataAtRowProp(row, col.Status.prop, "\u{2705}Compound found");
          if (isNaN(data.Density)) {
            data.Density = "N/A";
          }
          hot.batch(() => {
            toggleSearchState(
              hot,
              row,
              [
                col.CAS.idx,
                col.Name.idx,
                col.InChI.idx,
                col.InChIKey.idx,
                col.CID.idx,
                col.SMILES.idx,
                col.MW.idx,
                col.Density.idx,
                col.Source.idx,
              ],
              true
            );
            hot.setDataAtRowProp(
              [
                [row, col.CAS.prop, data.CAS],
                [row, col.Name.prop, data.Name],
                [row, col.InChI.prop, data.InChI],
                [row, col.InChIKey.prop, data.InChIKey],
                [row, col.CID.prop, data.CID],
                [row, col.SMILES.prop, data.CanonicalSMILES],
                [row, col.MW.prop, data.MolecularWeight],
                [row, col.Density.prop, data.Density],
                [row, col.Source.prop, data.Source],
              ],
              "searchFill"
            );
          });

          // updateProperties(hot, row);
        })(row);
        const cb_fail = (err) => {
          hot.setDataAtRowProp(row, col.Status.prop, "\u{274C}" + err.message);
          console.debug(err);
        };

        const resetMassVolume = () => {
          hot.setDataAtRowProp(row, col.Mass.prop, null, "searchFill");
          hot.setDataAtRowProp(row, col.Volume.prop, null, "searchFill");
        };

        const statusSearching = () => {
          hot.setDataAtRowProp(
            row,
            col.Status.prop,
            "\u{1F50D}Searching Compound",
            "searchFill"
          );
        };

        switch (type) {
          case "[auto]":
            statusSearching();
            resetMassVolume();
            db.byAuto(newValue, cb, cb_fail);
            break;
          case "[locked]":
            break;
          default:
            statusSearching();
            resetMassVolume();
            db.by(type, newValue, cb, cb_fail);
        }
      }

      if (
        (prop === col.Amount.prop ||
          prop === col.MW.prop ||
          (prop === col.Density.prop && source !== "searchFill")) &&
        source !== "updateProperties"
      ) {
        updateProperties(hot, row);
      }

      if (
        (prop === col.Mass.prop || prop === col.Volume.prop) &&
        source !== "updateAmount" &&
        source !== "updateProperties" &&
        source !== "searchFill"
      ) {
        updateAmount(hot, row, prop, newValue);
      }

      if (prop === col.EQRef.prop && source !== "EQRefUpdate") {
        // Don't touch last row to avoid creating a new one
        // should be false anyway
        const len = { length: hot.countRows() - 1 };
        const idxToEntry = (_, i) => [i, col.EQRef.prop, false];
        const updateEQRef = Array.from(len, idxToEntry)
          .filter((entry) => entry[0] !== row)
          .concat([[row, col.EQRef.prop, true]]);

        hot.setDataAtRowProp(updateEQRef, "EQRefUpdate");
      }

      if (
        (prop === col.Amount.prop ||
          prop === col.EQRef.prop ||
          prop === col.EQ.prop) &&
        source !== "updateEQs"
      ) {
        updateEQs(hot, row, prop, newValue);
      }
    });
    hot.render();
  };
  Handsontable.hooks.add("afterChange", afterChange, hot);

  const afterRemoveRow = () => {
    if (getEQRefRow(hot) === -1) {
      hot.setDataAtRowProp(0, col.EQRef.prop, true);
    }
  };
  Handsontable.hooks.add("afterRemoveRow", afterRemoveRow, hot);
}

function setupViews(table) {
  const button = document.getElementById("viewState-button");
  const cols = [
    col.Name.idx,
    col.CID.idx,
    col.SMILES.idx,
    col.InChIKey.idx,
    col.InChI.idx,
  ];
  table._viewState = true;

  table.setViewState = ((table) =>
    function (state) {
      if (state) {
        table.hot.getPlugin("hiddenColumns").hideColumns(cols);
        button.innerHTML = "View: CAS only";
      } else {
        table.hot.getPlugin("hiddenColumns").showColumns(cols);
        button.innerHTML = "View: All IDs";
      }
      table.hot.render();
      table._viewState = state;
    })(table);

  table.toggleViewState = ((table) =>
    function () {
      table.setViewState(!table._viewState);
    })(table);

  button.onclick = table.toggleViewState;
}

function rerender(hot) {
  hot.setDataAtRowProp(
    0,
    col.Notes.prop,
    hot.getDataAtRowProp(0, col.Notes.prop)
  );
}

export default class Table {
  constructor() {
    console.log("Hello Table");
    const table = document.getElementById("table");
    this.hot = new Handsontable(table, settings);
    this.db = new PubChem();

    // override isEmptyRow to work with the dataSchema
    this.hot.updateSettings({
      isEmptyRow: (rowIdx) => {
        const row_str = JSON.stringify(this.hot.getSourceDataAtRow(rowIdx));
        const schema_str = JSON.stringify(schema);
        return row_str === schema_str;
      },
    });

    addHooks(this.hot, this.db);
    setupViews(this);
    this.hot.setDataAtRowProp([
      [0, col.EQRef.prop, true],
      [0, col.Type.prop, "[auto]"],
    ]);
    this.hot.selectCell(0, col.Search.prop);
  }

  getData() {
    return JSON.stringify([this.hot.getSourceData(), this._viewState]);
  }

  loadData(tableData) {
    try {
      const data = JSON.parse(tableData);
      this.hot.loadData(data[0]);
      this.setViewState(data[1]);
      for (let i = 0; i < this.hot.countSourceRows(); i++) {
        redrawSearchState(this.hot, i);
      }
      rerender(this.hot);
    } catch {
      () => {};
    }
  }

  exportImage(callback) {
    rerender(this.hot);
    return html2canvas(document.getElementById("table"), {
      width: document.getElementsByClassName("ht_clone_top")[0].clientWidth,
    }).then((canvas) => canvas.toBlob(callback));
  }
}
