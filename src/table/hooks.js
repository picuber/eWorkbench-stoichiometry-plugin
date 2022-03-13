import { props, propArr, idxArr } from "./constants.js";

/* Gets the row index of the equivalent reference row.
 * If none are set, return -1
 */
const getEQRefRow = (hot) => hot.getDataAtProp(props.EQRef).indexOf(true);

function deleteOnlySource(hot, row, oldValue, newValue, triggerSource) {
  const source = "deleteOnly";
  if (triggerSource === "edit" && newValue !== null) {
    hot.setDataAtRowProp(row, props.Source, oldValue, source);
    return;
  }
  if (newValue === null) {
    // delete highlight here, since we immediately return in the main hook
    // to avoid deleting when we reset the Source
    delHighlight(hot, row, hot.propToCol(props.Source));
  }
}

function setTypeStatus(hot, row, newValue) {
  const source = "setTypeStatus";

  if ((newValue === null) | (newValue === undefined)) {
    hot.setDataAtRowProp(row, props.Type, "[auto]", source);
  }

  if (newValue === "[locked]")
    hot.setDataAtRowProp(row, props.Status, "\u{1F512}Locked", source);
  else hot.setDataAtRowProp(row, props.Status, null, source);
}

function search(hot, db, row, newValue) {
  if (newValue === "" || newValue === null || newValue === undefined) return;

  const source = "searchFill";
  const type = hot.getDataAtRowProp(row, props.Type);
  if (type === "[locked]") return;

  const cb = ((row) => (data) => {
    hot.setDataAtRowProp(row, props.Status, "\u{2705}Compound found");
    if (isNaN(data.Density)) data.Density = "N/A";

    hot.batch(() => {
      setHighlight(hot, row);
      hot.setDataAtRowProp(
        [
          [row, props.CAS, data.CAS],
          [row, props.Name, data.Name],
          [row, props.InChI, data.InChI],
          [row, props.InChIKey, data.InChIKey],
          [row, props.CID, data.CID],
          [row, props.SMILES, data.CanonicalSMILES],
          [row, props.MW, data.MolecularWeight],
          [row, props.Density, data.Density],
          [row, props.Source, data.Source],
        ],
        source
      );
    });
  })(row);

  const cb_fail = (err) => {
    hot.setDataAtRowProp(row, props.Status, "\u{274C}" + err.message);
    console.debug(err);
  };

  const statusStrSearching = "\u{1F50D}Searching Compound";
  hot.setDataAtRowProp(row, props.Status, statusStrSearching, source);
  hot.setDataAtRowProp(row, props.Mass, null, source);
  hot.setDataAtRowProp(row, props.Volume, null, source);

  if (type === "[auto]") db.byAuto(newValue, cb, cb_fail);
  else db.by(type, newValue, cb, cb_fail);
}

export function resetHighlight(hot, row) {
  const cells = hot.getDataAtRowProp(row, props.Highlight)?.split(",");
  cells?.forEach((cell) => {
    if (cell >= 0 && cell !== null && cell !== "")
      hot.setCellMeta(row, Number(cell), "className", "search-bg");
  });
}

function setHighlight(hot, row) {
  const source = "setHighlight";
  const val = idxArr.search.join();

  idxArr.search.forEach((cell) =>
    hot.setCellMeta(row, cell, "className", "search-bg")
  );

  hot.setDataAtRowProp(row, props.Highlight, val, source);
}

function delHighlight(hot, row, cell) {
  const source = "setHighlight";
  const val = hot.getDataAtRowProp(row, props.Highlight)?.replaceAll(cell, "");

  hot.setCellMeta(row, cell, "className", "");
  hot.setDataAtRowProp(row, props.Highlight, val, source);
}

/* (Re-)Calculate the mass and volume from the amount, molecular weight, and
 * density, if they are defined (mass needs amount and mw, volume needs all three)
 */
function updateProperties(hot, row) {
  const source = "updateProperties";

  const amount = hot.getDataAtRowProp(row, props.Amount);
  const molarity = hot.getDataAtRowProp(row, props.Molarity);
  const mw = hot.getDataAtRowProp(row, props.MW);
  const density = hot.getDataAtRowProp(row, props.Density);

  if (amount > 0 && mw > 0) {
    // Mass[g] = Amount[mmol] * MolecularWeight[g/mol] / 1000
    const mass = (amount * mw) / 1000;
    hot.setDataAtRowProp(row, props.Mass, mass, source);
  }

  if (amount > 0 && molarity > 0) {
    // Volume[mL] = Amount[mmol] / Molarity[mol/L]
    const volume = amount / molarity;
    hot.setDataAtRowProp(row, props.Volume, volume, source);
    return; // if molarity exists, ignore density
  }

  if (amount > 0 && mw > 0 && density > 0) {
    // Volume[mL = cm³] = (Amount[mmol] * MolecularWeight[g/mol]) / (Density[g/cm³] * 1000)
    const volume = (amount * mw) / (density * 1000);
    hot.setDataAtRowProp(row, props.Volume, volume, source);
  }

  if (density === "N/A") {
    hot.setDataAtRowProp(row, props.Volume, "N/A", source);
  }
}

/* (Re-)Calculate the Amount, when the mass or volume change.
 */
function updateAmount(hot, row, prop, val) {
  const source = "updateAmount";

  const molarity = hot.getDataAtRowProp(row, props.Molarity);
  const mw = hot.getDataAtRowProp(row, props.MW);
  const density = hot.getDataAtRowProp(row, props.Density);

  if (prop === props.Mass && val > 0 && mw > 0) {
    //  Amount[mmol] = (Mass[g] * 1000) / MolecularWeight[g/mol]
    const amount = (val * 1000) / mw;
    hot.setDataAtRowProp(row, props.Amount, amount, source);
  }
  if (prop === props.Volume && molarity > 0 && val > 0) {
    // Amount[mmol] = Molarity[mol/L] * Volume[mL]
    const amount = molarity * val;
    hot.setDataAtRowProp(row, props.Amount, amount, source);
    return; // if molarity exists, ignore density
  }
  if (prop === props.Volume && density > 0 && val > 0 && mw > 0) {
    // Amount[mmol] = (Density[g/cm³] * Volume[mL = cm³] * 1000) / MolecularWeight[g/mol]
    const amount = (density * val * 1000) / mw;
    hot.setDataAtRowProp(row, props.Amount, amount, source);
  }
  if (prop === props.Volume && density === "N/A") {
    // If no density is known, volume is not applicable
    hot.setDataAtRowProp(row, props.Volume, "N/A");
  }
}

function updateEQs(hot, row, prop, val) {
  const source = "updateEQs";

  const refRow = getEQRefRow(hot);
  const refAmount = hot.getDataAtRowProp(refRow, props.Amount);

  if (row === refRow && (prop === props.Amount || prop === props.EQRef)) {
    const amounts = hot.getDataAtProp(props.Amount);
    const EQs = hot.getDataAtProp(props.EQ);
    EQs[refRow] = 1;

    for (let i = 0; i < amounts.length - 1; i++) {
      if (amounts[i] > 0 && refAmount > 0) {
        EQs[i] = amounts[i] / refAmount;
      }
    }
    for (let i = 0; i < amounts.length - 1; i++) {
      if (EQs[i] > 0 && refAmount > 0) {
        amounts[i] = EQs[i] * refAmount;
      }
    }

    const len = { length: amounts.length - 1 };
    const idxToEntryEQ = (_, i) => [i, props.EQ, EQs[i]];
    const idxToEntryAmount = (_, i) => [i, props.Amount, amounts[i]];
    hot.setDataAtRowProp(Array.from(len, idxToEntryEQ), source);
    hot.setDataAtRowProp(Array.from(len, idxToEntryAmount), source);
  }

  if (row === refRow && prop === props.EQ) {
    hot.setDataAtRowProp(row, props.EQ, 1, source);
  }

  if (row !== refRow && prop === props.Amount) {
    if (val > 0 && refAmount > 0) {
      hot.setDataAtRowProp(row, props.EQ, val / refAmount, source);
    }
    if (val === undefined || val === null) {
      hot.setDataAtRowProp(row, props.EQ, null, source);
    }
  }

  if (row !== refRow && prop === props.EQ) {
    if (val > 0 && refAmount > 0) {
      hot.setDataAtRowProp(row, props.Amount, val * refAmount, source);
    }
    if (val === undefined || val === null) {
      hot.setDataAtRowProp(row, props.Amount, null, source);
    }
  }
}

function updateEQRef(hot, row, oldValue, newValue) {
  const source = "EQRefUpdate";

  if (newValue === null) {
    hot.setDataAtRowProp(row, props.EQRef, oldValue, source);
    return;
  }

  // Don't touch last row to avoid creating a new one (should be false anyway)
  const len = { length: hot.countRows() - 1 };
  const idxToEntry = (_, i) => [i, props.EQRef, false];

  const updateArr = Array.from(len, idxToEntry) // set every row to false
    .filter((entry) => entry[0] !== row) // except for the current row
    .concat([[row, props.EQRef, true]]); // and set it to true instead

  hot.setDataAtRowProp(updateArr, source);
}

/* Soruces flow:
 *  setTypeStatus: {Type} => {Status}
 *  searchFill: {Search} => { <search_result> }
 *  setHighlight: { <search_result> } => {Highlight}
 *  updateProperties: {Amount, Molarity, MW, Density} => {Mass, Volume}
 *  updateAmount: {Mass, Volume} => Amount, {Volume} => Volume
 *  EQRefUpdate: {EQRef} => {EQRef}
 *  updateEQs: {Amount, EQRef, EQ} => {Amount, EQ}
 */

export const afterChange = (hot, db) => (changes, source) => {
  changes?.forEach(([row, prop, oldValue, newValue]) => {
    // If nothing changed don't do anything
    if (oldValue === newValue) return;

    if (prop === props.Source) {
      deleteOnlySource(hot, row, oldValue, newValue, source);
      return;
    }

    if (prop === props.Type && source != "setTypeStatus")
      setTypeStatus(hot, row, newValue);

    if (prop === props.Search) search(hot, db, row, newValue);

    if (propArr.search.includes(prop) && source !== "searchFill")
      delHighlight(hot, row, hot.propToCol(prop));

    if (prop === props.Highlight && source !== "setHighlight")
      resetHighlight(hot, row);

    if (prop == props.MW && source === "searchFill") updateProperties(hot, row);
    if (propArr.AMMD.includes(prop))
      if (source !== "searchFill" && source !== "updateAmount")
        updateProperties(hot, row);

    if (propArr.VM.includes(prop))
      if (source !== "searchFill" && source !== "updateProperties")
        updateAmount(hot, row, prop, newValue);

    if (prop === props.EQRef && source !== "EQRefUpdate")
      updateEQRef(hot, row, oldValue, newValue);

    if (propArr.AEE.includes(prop) && source !== "updateEQs")
      updateEQs(hot, row, prop, newValue);
  });
  hot.render();
};

export const afterRemoveRow = (hot) => () => {
  if (getEQRefRow(hot) === -1) {
    hot.setDataAtRowProp(0, props.EQRef, true);
  }
};
