import { Compound } from "pubchem";

export default class PubChem {
  constructor() {
    this.prolog = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    console.log(Compound);
  }

  call(input, op) {
    return fetch(this.prolog + input + op + "/json").then((x) => x.json());
  }
  // async call(input, op) {
  //   let response = await fetch(this.prolog + input + op + "/json");
  //   let json;
  //   if (response.ok) {
  //     json = await response.json();
  //   }
  //   return json;
  // }

  // return: listkey -> new call with compound/listkey/<listkey>/<output>
  byName() {}
  byInChI() {}
  byInChIKey() {}
  byPubChemCID() {}
  bySMILES() {}
  byFormula() {}

  test2() {
    console.log("test2");
    return fetch(
      "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/H2O/synonyms/JSON"
    ).then((x) => x.json());
  }
  test3() {
    console.log("test3");
    Compound.fromSmiles("CCCCCBr").then((x) => console.log(x.getData()));
  }
}
