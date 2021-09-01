export default class PubChem {
  // TODO
  // return: listkey -> new call with compound/listkey/<listkey>/<output>
  constructor() {
    console.log("Hello PubChem");
    this.prolog_rest = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    this.prolog_view = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view";
    this.rl = new RateLimit(200); // 5 times every second in ms
    this.parse = new Parser();
  }

  get(prolog, input, op, callback, query = null) {
    const URL = prolog + input + op + "/JSON";
    this.rl.schedule(() =>
      fetch(URL + (query === null ? "" : query))
        .then((response) => response.json())
        .then((json_data) => callback(json_data))
    );
  }

  get_from_rest(input, cb, query = null) {
    this.get(
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
    this.get(this.prolog_view, "/data/compound/" + CID, "", (raw) => {
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
    this.get_from_rest("/smiles/" + encodeURIComponent(SMILES), cb);
  }

  by(type, value, cb) {
    switch (type) {
      case "CAS":
        this.byCAS(value, cb);
        break;
      case "InChI":
        this.byInChI(value, cb);
        break;
      case "InChIKey":
        this.byInChIKey(value, cb);
        break;
      case "Name":
        this.byName(value, cb);
        break;
      case "CID":
        this.byCID(value, cb);
        break;
      case "SMILES":
        this.bySMILES(value, cb);
        break;
    }
  }

  by_auto_parse(value, cb) {
    if (this.parse.isCAS(value)) this.byCAS(value, cb);
    else if (this.parse.isInChI(value)) this.byInChI(value, cb);
    else if (this.parse.isInChIKey(value)) this.byInChIKey(value, cb);
    else if (this.parse.isCID(value)) this.byCID(value, cb);
    else if (this.parse.isSMILES(value)) this.bySMILES(value, cb);
    else this.byName(value, cb);
  }
}

class Parser {
  constructor() {}
  isCAS(input) {
    return /^\d{1,7}-\d{1,2}-\d$/.test(input.trim());
  }
  isInChI(input) {
    return /^InChI=1S?\/[^\s]+(\s|$)/.test(input.trim());
  }
  isInChIKey(input) {
    return /^(InChIKey=)?[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(input.trim());
  }
  isCID(input) {
    return /^[0-9]+$/.test(input.trim());
  }
  isSMILES(input) {
    const elements =
      "(H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|" +
      "K|Ca|Sc|Ti|V|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|" +
      "Rb|Sr|Y|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|I|Xe|" +
      "Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|" +
      "Hf|Ta|W|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|" +
      "Fr|Ra|Ac|Th|Pa|U|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|" +
      "Rf|Db|Sg|Bh|Hs|Mt|Ds|Rg|Cn|Nh|Fl|Mc|Lv|Ts|Og)";
    const rest =
      "[bcnops]|[0-9]|TH|AL|SP|TB|OH|se|as|[+-=#$/:\\\\@\\[\\]\\(\\)%\\*]";
    return new RegExp("^(" + elements + "|" + rest + ")+$").test(input.trim());
  }
}

class RateLimit {
  constructor(interval) {
    this.interval = interval;
    this.queue = [];
    this.last = new Date().getTime();
  }

  schedule(func) {
    if (func) this.queue.push(func);

    if (new Date().getTime() - this.last > this.interval) {
      const fn = this.queue.shift();
      if (fn) {
        fn();
        this.last = new Date().getTime();
      }
    } else setTimeout(() => this.schedule(), this.interval);
  }
}
