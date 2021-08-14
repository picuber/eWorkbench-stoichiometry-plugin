export default class PubChem {
  // TODO
  // return: listkey -> new call with compound/listkey/<listkey>/<output>
  constructor() {
    console.log("Hello PubChem");
    this.prolog_rest = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    this.prolog_view = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view";
  }

  ratelimit() {
    // TODO
    // https://pubchemdocs.ncbi.nlm.nih.gov/programmatic-access$_RequestVolumeLimitations
    // https://pubchemdocs.ncbi.nlm.nih.gov/dynamic-request-throttling
    // Not possible with fetch API??
  }

  get(prolog, input, op, callback, query = null) {
    this.ratelimit();
    const URL = prolog + input + op + "/JSON";
    return fetch(URL + (query === null ? "" : query))
      .then((response) => response.json())
      .then((json_data) => callback(json_data));
  }

  get_from_rest(input, cb, query = null) {
    return this.get(
      this.prolog_rest,
      "/compound" + input,
      "/property/MolecularWeight,CanonicalSMILES,InChI,InChIKey",
      (raw) => {
        const data = raw.PropertyTable.Properties[0];
        this.get_from_view(data.CID, data, cb);
      },
      query
    );
  }

  get_from_view(CID, data, cb) {
    return this.get(this.prolog_view, "/data/compound/" + CID, "", (raw) => {
      data.name = raw.Record.RecordTitle;
      data.link = "https://pubchem.ncbi.nlm.nih.gov/compound/" + data.CID;

      data.CAS = raw.Record.Section.find(
        (elem) => elem.TOCHeading === "Names and Identifiers"
      )
        ?.Section.find((elem) => elem.TOCHeading === "Other Identifiers")
        ?.Section.find(
          (elem) => elem.TOCHeading === "CAS"
        )?.Information[0].Value.StringWithMarkup[0].String;

      data.Density = Number(
        raw.Record.Section.find(
          (elem) => elem.TOCHeading === "Chemical and Physical Properties"
        )
          ?.Section.find(
            (elem) => elem.TOCHeading === "Experimental Properties"
          )
          ?.Section.find((elem) => elem.TOCHeading === "Density")
          ?.Information[0].Value.StringWithMarkup[0].String.split(" ")[0]
      );

      cb(data);
    });
  }

  byCAS(CAS, cb) {
    this.get_from_rest("/name/" + CAS, cb);
  }
  byInChI(InChI, cb) {
    this.get_from_rest("/inchi", cb, "?inchi=" + InChI);
  }
  byInChIKey(InChIKey, cb) {
    this.get_from_rest("/inchikey/" + InChIKey, cb);
  }
  byName(name, cb) {
    this.get_from_rest("/name/" + name, cb);
  }
  byCID(CID, cb) {
    this.get_from_rest("/cid/" + CID, cb);
  }
  bySMILES(SMILES, cb) {
    this.get_from_rest("/smiles/" + SMILES, cb);
  }
}
