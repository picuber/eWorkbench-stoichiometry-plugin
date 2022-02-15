/**
 *  configuration for the order, structure and settings of the columns in the
 *  table. Each entry has the following properties
 *  - prop {string} (required) - the key for the data objects to fill the cell with, also used with some HoT functions
 *  - defaultValue {any} (optional) - the default value for new/empty rows
 *  - name {string} (required) - the header name for the column
 *  - settings {object} (required) - configuration optinos for the column according to Handsontable
 */
export const col = {
  Status: {
    prop: "status",
    name: "",
    settings: { width: 25, readOnly: true, renderer: "statusRender" },
  },
  Type: {
    prop: "type",
    defaultValue: "[auto]",
    name: "Type",
    settings: {
      type: "dropdown",
      source: [
        "[auto]",
        "[locked]",
        "CAS",
        "Name",
        "CID",
        "SMILES",
        "InChIKey",
        "InChI",
      ],
      width: 100,
    },
  },
  Search: { prop: "search", name: "Search", settings: {} },
  Name: { prop: "id.Name", name: "Name", settings: {} },
  Amount: {
    prop: "amount",
    name: "Amount",
    settings: { validator: "positive", renderer: "amountRender" },
  }, //Stoffmenge, format: x mmol
  EQ: {
    prop: "eq.val",
    name: "Eq",
    settings: { validator: "positive", renderer: "eqRender" },
  }, //Äquivalente / Equivalents
  EQRef: {
    prop: "eq.ref",
    defaultValue: false,
    name: "EqRef",
    settings: { type: "checkbox" },
  },
  Molarity: {
    prop: "molarity",
    name: "Molarity",
    settings: { validator: "positive", renderer: "molarityRender" },
  },

  CAS: { prop: "id.CAS", name: "CAS", settings: {} },
  CID: { prop: "id.CID", name: "CID", settings: {} },
  SMILES: { prop: "id.SMILES", name: "SMILES", settings: {} },
  InChIKey: { prop: "id.InChIKey", name: "InChIKey", settings: {} },
  InChI: { prop: "id.InChI", name: "InChI", settings: {} },

  MW: {
    prop: "prop.mw",
    name: "MW",
    settings: { validator: "positive", renderer: "mwRender" },
  },
  Density: {
    prop: "prop.density",
    name: "Density",
    settings: { validator: "positive", renderer: "densityRender" },
  },
  Mass: {
    prop: "prop.mass",
    name: "Mass",
    settings: { validator: "positive", renderer: "massRender" },
  },
  Volume: {
    prop: "prop.volume",
    name: "Volume",
    settings: { validator: "positive", renderer: "volumeRender" },
  },
  Notes: { prop: "notes", name: "Notes", settings: {} },
  Source: {
    prop: "source",
    name: "Source",
    settings: { readOnly: true, renderer: "linkRender" },
  },
  Highlight: {
    prop: "highlight",
    name: "",
    settings: { readOnly: true },
  },
};
/* Copy the prop into the HoT settings object, add the column index for easier
 * reference and flexibility and make the object immutable
 */
Object.keys(col).forEach((key) => (col[key].settings.data = col[key].prop));
Object.keys(col).forEach((key, i) => (col[key].idx = i));
Object.freeze(col);

/* Construct the dataSchema for the HoT configuration from the col object.
 * They can either have the form "prop" or "prop.subprob"
 */
export const schema = {};
Object.keys(col).forEach((key) => {
  const [fst, snd] = col[key].prop.split(".");
  const val = "defaultValue" in col[key] ? col[key].defaultValue : null;
  if (snd === undefined) schema[fst] = val;
  else {
    if (!(fst in schema)) schema[fst] = {};
    schema[fst][snd] = val;
  }
});
Object.freeze(schema);

/* The Handsontable settings object. See their [Docs](https://handsontable.com/docs/)
 * for more information
 */
export const settings = {
  data: [{}],
  dataSchema: schema,

  // rows
  rowHeaders: () => "",
  rowHeaderWidth: 15,
  minRows: 1,
  minSpareRows: 1,
  manualRowMove: true,

  // columns
  colHeaders: Object.values(col).map((val) => val.name),
  columns: Object.values(col).map((val) => val.settings),
  hiddenColumns: {
    copyPasteEnabled: false,
  },

  // general
  contextMenu: ["row_above", "row_below", "remove_row"],
  persistentState: true,
  licenseKey: "non-commercial-and-evaluation",
};

export const props = {};
Object.keys(col).forEach((key) => (props[key] = col[key].prop));
Object.freeze(props);

export const propArr = {
  search: [
    props.CAS,
    props.Name,
    props.InChI,
    props.InChIKey,
    props.CID,
    props.SMILES,
    props.MW,
    props.Density,
    props.Source,
  ],
  AMMD: [props.Amount, props.Molarity, props.MW, props.Density],
  VM: [props.Mass, props.Volume],
  AEE: [props.Amount, props.EQ, props.EQRef],
};

const idxs = {};
Object.keys(col).forEach((key) => (idxs[key] = col[key].idx));
Object.freeze(idxs);

export const idxArr = {
  search: [
    idxs.CAS,
    idxs.Name,
    idxs.InChI,
    idxs.InChIKey,
    idxs.CID,
    idxs.SMILES,
    idxs.MW,
    idxs.Density,
    idxs.Source,
  ],
};

const view_minimal = [
  col.Name.idx,
  col.Amount.idx,
  col.EQ.idx,
  col.MW.idx,
  col.Mass.idx,
  col.Volume.idx,
];
const view_standard = view_minimal.concat([
  col.Status.idx,
  col.Type.idx,
  col.Search.idx,
  col.EQRef.idx,
  col.Molarity.idx,
  col.CAS.idx,
  col.Density.idx,
  col.Notes.idx,
  col.Source.idx,
]);
const view_extended = view_standard.concat([
  col.CID.idx,
  col.SMILES.idx,
  col.InChIKey.idx,
  col.InChI.idx,
]);

export const viewArr = {
  Minimal: view_minimal,
  Standard: view_standard,
  Extended: view_extended,
  All: Object.values(col).map((v) => v.idx),
};
