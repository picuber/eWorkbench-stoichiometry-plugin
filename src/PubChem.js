function fetchPubChem(db, prolog, input, op, cb, cb_fail, query = null) {
  const URL = prolog + input + op + "/JSON";
  db.ratelimit.schedule(() =>
    fetch(URL + (query === null ? "" : query))
      .then((response) => response.json())
      .then((json_data) => cb(json_data))
      .catch((err) => cb_fail(err))
  );
}

function askPugREST(db, input, cb, cb_fail, query = null) {
  fetchPubChem(
    db,
    db.prolog_rest,
    "/compound" + input,
    "/property/MolecularWeight,CanonicalSMILES,InChI,InChIKey",
    (raw) => {
      if ("PropertyTable" in raw) {
        const data = raw.PropertyTable.Properties[0];
        askPugView(db, data.CID, data, cb, cb_fail);
      } else {
        cb_fail(new Error("Compound could not be found"));
      }
    },
    cb_fail,
    query
  );
}

// assumes valid CID as input
function askPugView(db, CID, data, cb, cb_fail) {
  fetchPubChem(
    db,
    db.prolog_view,
    "/data/compound/" + CID,
    "",
    (raw) => {
      data.Name = raw.Record.RecordTitle;
      data.Source = "https://pubchem.ncbi.nlm.nih.gov/compound/" + data.CID;

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
    },
    cb_fail
  );
}

/**
 *  Represets the connection to the PubChem Database, and proxies the requests
 *
 * @todo repeat a call via compound/listkey/<listkey>/<output> if a listkey is returned
 */
export default class PubChem {
  /**
   * Creates a new PubChem instance with its own RateLimiter and Parser
   */
  constructor() {
    this.prolog_rest = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    this.prolog_view = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view";
    this.ratelimit = new RateLimit(200); // 5 times every second in ms
    this.parse = new Parser();
  }

  /**
   *  Searches the Database by the given type
   *
   *  @param {string} type - The type of chemical identifier
   *  @param {string} value - The search string
   *  @param {function} cb - The callback function for a successful search
   *  @param {function} cb_fail - The callback function for a failed search
   */
  by(type, value, cb, cb_fail) {
    switch (type) {
      case "CAS":
        askPugREST(this, "/name/" + value, cb, cb_fail);
        break;
      case "InChI":
        askPugREST(this, "/inchi", cb, cb_fail, "?inchi=" + value);
        break;
      case "InChIKey":
        askPugREST(this, "/inchikey/" + value, cb, cb_fail);
        break;
      case "Name":
        askPugREST(this, "/name/" + value, cb, cb_fail);
        break;
      case "CID":
        askPugREST(this, "/cid/" + value, cb, cb_fail);
        break;
      case "SMILES":
        askPugREST(this, "/smiles/" + encodeURIComponent(value), cb, cb_fail);
        break;
    }
  }

  /**
   *  Searches the Database with an automatically determined type
   *
   *  @param {string} value - The search string
   *  @param {function} cb - The callback function for a successful search
   *  @param {function} cb_fail - The callback function for a failed search
   */
  byAuto(value, cb, cb_fail) {
    this.by(this.parse.auto(value), value, cb, cb_fail);
  }
}

/**
 * Holds the different validatiors for the chemical Identifiers and an automatic
 * parser that determines the type. The Validators have no guarantee for correctness
 */
class Parser {
  constructor() {}

  /**
   * Validator for CAS
   *
   * @param {string} input - the identifier to be validated
   * @return {boolean} Whether the input is of type CAS
   */
  isCAS(input) {
    return /^\d{1,7}-\d{1,2}-\d$/.test(input.trim());
  }

  /**
   * Validator for InChI
   *
   * @param {string} input - the identifier to be validated
   * @return {boolean} Whether the input is of type InChI
   */
  isInChI(input) {
    return /^InChI=1S?\/[^\s]+(\s|$)/.test(input.trim());
  }

  /**
   * Validator for InChiKey
   *
   * @param {string} input - the identifier to be validated
   * @return {boolean} Whether the input is of type InChIKey
   */
  isInChIKey(input) {
    return /^(InChIKey=)?[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(input.trim());
  }

  /**
   * Validator for PubChem CID (compound ID)
   *
   * @param {string} input - the identifier to be validated
   * @return {boolean} Whether the input is of type CID
   */
  isCID(input) {
    return /^[0-9]+$/.test(input.trim());
  }

  /**
   * Validator for SMILES. Might result in false negatives
   *
   * @param {string} input - the identifier to be validated
   * @return {boolean} Whether the input is of type SMILES
   */
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

  /**
   * Automatic Parser. Runs all validators and returns the type of the first
   * matching type
   *
   * @param {string} value - the identifier to be parsed
   * @return {string} The type of the identifier for the value
   */
  auto(value) {
    if (this.isCAS(value)) return "CAS";
    else if (this.isInChI(value)) return "InChI";
    else if (this.isInChIKey(value)) return "InChIKey";
    else if (this.isCID(value)) return "CID";
    else if (this.isSMILES(value)) return "SMILES";
    else return "Name";
  }
}

/**
 * All requests done via this rate limiter make run at an given maximum rate
 * to keep below the database requirements
 */
class RateLimit {
  /**
   * Creates a new RateLimit instance
   *
   * @param {number} interval - How often a request can be made (in ms)
   */
  constructor(interval) {
    this.interval = interval;
    this.queue = [];
    this.last = new Date().getTime();
  }

  /**
   * Adds a call to the rate limiter queue, and runs it when the time comes
   *
   * @param {function} func - The function to run
   */
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
