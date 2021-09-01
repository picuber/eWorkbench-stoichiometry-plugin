import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import "html2canvas";

const settings = {
  data: [[]],

  // rows
  rowHeaders: () => "",
  rowHeaderWidth: 15,
  minRows: 1,
  minSpareRows: 1,
  manualRowMove: true,

  // columns
  colHeaders: [
    "Lock",
    "Type",
    "Search",
    //-----
    "CAS",
    "Name",
    "InChI",
    "InChIKey",
    "PubChem CID",
    "SMILES",
    //-----
    "MW", //molecular weight, format: x g/mol
    "Density",
    "Amount", //Stoffmenge, format: x mol
    "Mass",
    "Volume",
    "EQ", //Äquivalente / Equivalents
    "Notes",
    "Link",
  ],
  columns: [
    {
      type: "checkbox",
    }, // Lock
    {
      type: "dropdown",
      source: ["CAS", "InChI", "InChIKey", "Name", "PubChem CID", "SMILES"],
      width: 150,
    }, // Type
    {
      // ESCAPE string before use, SMILES uses '\'
    }, // Search
    {}, // CAS
    {}, // Name
    {}, // InChI
    {}, // InChIKey
    {}, // PubChem CID
    {}, // SMILES
    {}, // MW
    {}, // Density
    {}, // Amount
    {}, // Mass
    {}, // Volume
    {}, // EQ
    {}, // Notes
    {}, // Link
  ],
  hiddenColumns: { indicators: true },

  // general
  contextMenu: [
    "row_above",
    "row_below",
    "remove_row",
    "hidden_columns_hide",
    "hidden_columns_show",
  ],
  persistentState: true,
  licenseKey: "non-commercial-and-evaluation",

  // hooks
  afterChange: (changes) => {
    changes?.forEach(([row, prop, oldValue, newValue]) => {
      console.log(row, prop, oldValue, newValue);
    });
  },
};

export default class Table {
  constructor() {
    console.log("Hello Table");
    const table = document.getElementById("table");
    this.hot = new Handsontable(table, settings);

    this.show_ids = ((hot) =>
      function () {
        hot.getPlugin("hiddenColumns").showColumns([4, 5, 6, 7, 8]);
        hot.render();
      })(this.hot);
    this.hide_ids = ((hot) =>
      function () {
        hot.getPlugin("hiddenColumns").hideColumns([4, 5, 6, 7, 8]);
        hot.render();
      })(this.hot);

    document.getElementById("show-ids").onclick = this.show_ids;
    document.getElementById("hide-ids").onclick = this.hide_ids;

    this.hide_ids();
  }

  loadData(tableData) {
    this.hot.loadData(tableData);
  }

  exportCSVBlob() {
    return this.hot.getPlugin("exportFile").exportAsBlob("csv");
  }

  exportImage() {
    //TODO
  }
}
