import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import "html2canvas";

const settings = {
  data: [[]],
  colHeaders: [
    "Lock",
    "Type",
    "Search",
    "Name",
    "MW", //molecular weight, format: x g/mol
    "Density",
    "Amount", //Stoffmenge, format: x mol
    "Mass",
    "Volume",
    "EQ", //Äquivalente / Equivalents
    "CAS",
    "Notes",
    "Link",
  ],
  columns: [
    {
      type: "checkbox",
    },
    {
      type: "dropdown",
      source: ["CAS", "InChI", "InChIKey", "Name", "PubChem CID", "SMILES"],
      width: 150,
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ],
  minRows: 1,
  minSpareRows: 1,
  contextMenu: ["row_above", "row_below", "remove_row"],
  manualRowMove: true,
  manualColumnMove: true,
  persistentState: true,
  licenseKey: "non-commercial-and-evaluation",
};

export default class Table {
  constructor() {
    console.log("Hello Table");
    const table = document.getElementById("table");
    this.hot = new Handsontable(table, settings);
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
