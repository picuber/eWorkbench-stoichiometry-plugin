import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import "html2canvas";

const settings = {
  data: [[]],
  colHeaders: [
    "Lock",
    "Type",
    "Bezeichnung",
    "Molekulargewicht",
    "Stoffmenge",
    "Masse",
    "Volumen",
    "Dichte",
    "CAS",
  ],
  columns: [
    {
      type: "checkbox",
    },
    {
      type: "dropdown",
      source: ["Name", "InChI", "InChIKey", "PubChem CID", "SMILES", "Formula"],
      width: 150,
    },
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
