import PubChem from "./PubChem.js";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import html2canvas from "html2canvas";

import { col, schema, settings } from "./table/constants.js";
import { resetHighlight } from "./table/hooks.js";
import * as init from "./table/init.js";

init.validators(Handsontable);
init.renderers(Handsontable);

export default class Table {
  constructor() {
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

    init.hooks(Handsontable, this.hot, this.db);
    init.views(this);
    init.precision(this);
    this.hot.setDataAtRowProp([
      [0, col.EQRef.prop, true],
      [0, col.Type.prop, "[auto]"],
    ]);
    this.hot.selectCell(0, col.Search.prop);
  }

  getData() {
    return JSON.stringify([
      this.hot.getSourceData(),
      this._viewState,
      this._precision,
    ]);
  }

  loadData(tableData) {
    try {
      const data = JSON.parse(tableData);
      this.hot.loadData(data[0]);
      for (let i = 0; i < this.hot.countSourceRows() - 1; i++) {
        resetHighlight(this.hot, i);
      }
      this.setView(data[1]);
      this.setPrecision(data[2]);
    } catch (e) {
      if (e instanceof SyntaxError) {
        //JSON.parse() failed
        console.error("Could not load save data: Invalid format");
      } else {
        //dunno what else went wrong, just throw it back
        throw e;
      }
    }
  }

  exportImage(callback) {
    return html2canvas(document.getElementById("table"), {
      width: document.getElementsByClassName("ht_clone_top")[0].clientWidth,
    }).then((canvas) => canvas.toBlob(callback));
  }
}
