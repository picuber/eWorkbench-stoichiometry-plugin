import "./style.css";
import Plugin from "./eWorkbenchPlugin.js";
import Table from "./Table.js";
import PubChem from "./PubChem.js";

console.log("Hello World from your main file!");

const db = new PubChem();
const table = new Table();
console.log(table);
const plugin = new Plugin(table);
window.onload = plugin.load();

document.getElementById("test_db").onclick = function () {
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
  db.bySMILES("C1C[CH+]1", print("SMILES escape"));
  db.byCID("1234", print("No Density"));
};

document.getElementById("test_parser").onclick = function () {
  const test = (name, fn, arg, shouldPass = true) =>
    console.log(name + ": " + (fn(arg) === shouldPass ? "pass" : "fail"));

  test("CAS positive", db.parse.isCAS, "64-17-5");
  test("CAS negative", db.parse.isCAS, "foobar", false);
  test("SMILES braces plus positive", db.parse.isSMILES, "C1C[CH+]1");
  test("SMILES at positive", db.parse.isSMILES, "N[C@@H](C)C(=O)O");
  test("SMILES slash positive", db.parse.isSMILES, "F/C=C\\F");
};
