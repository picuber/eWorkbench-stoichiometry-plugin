import "./style.css";
import Plugin from "./eWorkbenchPlugin.js";
import Table from "./Table.js";
import PubChem from "./PubChem.js";

console.log("Hello World from your main file!");

const db = new PubChem();
console.log(db);
const table = new Table();
console.log(table);

const plugin = new Plugin(table);
console.log(plugin);
window.onload = plugin.load();

const butt = document.getElementById("butt");
var a = 1;
butt.onclick = function () {
  console.log(db.test2());
  console.log(`JS test button: ${a}`);
  a += 1;
};
