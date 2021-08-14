import "./style.css";
import Plugin from "./eWorkbenchPlugin.js";
import Table from "./Table.js";
import PubChem from "./PubChem.js";

console.log("Hello World from your main file!");

const db = new PubChem();
const table = new Table();
const plugin = new Plugin(table);
window.onload = plugin.load();

const test = document.getElementById("test");
test.onclick = function () {
  const print = (info) => (data) => {
    console.log(info);
    console.log(data);
  };
  db.byCAS("64-17-5", print("CAS"));
  db.byInChI("InChI=1S/H2O/h1H2", print("InChI Water"));
  db.byInChIKey("BSYNRYMUTXBXSQ-UHFFFAOYSA-N", print("InChIKey"));
  db.byName("Water", print("Name"));
  db.byCID("2244", print("CID"));
  db.bySMILES("CC(=O)OC1=CC=CC=C1C(=O)O", print("SMILES"));
  db.byCID("1234", print("No Density"));
};
