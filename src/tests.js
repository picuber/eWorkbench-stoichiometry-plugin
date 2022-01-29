export default function addTests(plugin) {
  const tests = document.createElement("div");
  tests.id = "tests";
  document.body.appendChild(tests);

  function newTest(testName, testID, testFunc) {
    const button = document.createElement("button");
    button.innerHTML = "Test: " + testName;
    button.id = testID;
    button.onclick = testFunc;
    tests.appendChild(button);
  }

  /**
   *  Tests the Connection to the PubChem Database and the different methods of
   *  querying it.
   */
  newTest("DB", "test_db", function () {
    const print = (info) => (data) => {
      console.log(info);
      console.log(data);
    };
    plugin.table.db.by("CAS", "64-17-5", print("CAS"));
    plugin.table.db.by("InChI", "InChI=1S/H2O/h1H2", print("InChI Water"));
    plugin.table.db.by(
      "InChIKey",
      "BSYNRYMUTXBXSQ-UHFFFAOYSA-N",
      print("InChIKey")
    );
    plugin.table.db.by("Name", "Water", print("Name"));
    plugin.table.db.by("PubChem CID", "2244", print("CID"));
    plugin.table.db.by("SMILES", "CC(=O)OC1=CC=CC=C1C(=O)O", print("SMILES"));
    plugin.table.db.by("SMILES", "C1C[CH+]1", print("SMILES escape"));
    plugin.table.db.by("PubChem CID", "1234", print("No Density"));
  });

  /**
   * Tests the Parsers for the different search methods ([auto] mode )
   */
  newTest("Parser", "test_parser", function () {
    const test = (name, fn, arg, shouldPass = true) =>
      console.log(name + ": " + (fn(arg) === shouldPass ? "pass" : "fail"));

    test("CAS positive", plugin.table.db.parse.isCAS, "64-17-5");
    test("CAS negative", plugin.table.db.parse.isCAS, "foobar", false);
    test(
      "SMILES braces plus positive",
      plugin.table.db.parse.isSMILES,
      "C1C[CH+]1"
    );
    test(
      "SMILES at positive",
      plugin.table.db.parse.isSMILES,
      "N[C@@H](C)C(=O)O"
    );
    test("SMILES slash positive", plugin.table.db.parse.isSMILES, "F/C=C\\F");
  });

  /**
   * Tests the Export and Display of the preview image
   */
  newTest("Image", "test_image", function () {
    plugin.table.exportImage((blob) => {
      const div = document.createElement("div");
      const img = document.createElement("img");

      img.src = URL.createObjectURL(blob);

      div.appendChild(img);
      document.body.appendChild(div);
    });
  });
}
