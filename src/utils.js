export function jsonp(src) {
  var cb_n = "cb_" + Math.round(1000000 * Math.random());
  window[cb_n] = function (data) {
    console.log(data);
  };
  var s = document.createElement("script");
  s.id = "script_" + cb_n;
  s.src = src + "?callback=" + cb_n;
  document.body.appendChild(s);
  document.getElementById(s.id).remove();
}

export function parse_CAS(names) {
  const cas_regex = /^\d{1,7}-\d{1,2}-\d$/;
  const filtered = names.filter((name) => cas_regex.test(name));
  return filtered.length >= 1 ? filtered[0] : null;
}

import frac from "fraction.js";
export function fracUnitRenderHelper(td, value, unit) {
  if (value > 0) {
    const f = new frac(value);
    td.innerHTML =
      '<div title="' +
      f.toFraction() +
      (f.d !== 1 && f > 1 ? " = " + f.toFraction(true) : "") +
      (f.d !== 1 ? " = " + f / 1 : "") +
      '">' +
      f.toString() +
      (unit ? " " + unit : "") +
      "</div>";
  } else td.innerHTML = value;
}

export function showTechInfo(auth) {
  const techInfo = document.getElementById("tech_info");
  techInfo.getElementsByClassName("jwt")[0].innerHTML = auth.jwt;
  techInfo.getElementsByClassName("pk")[0].innerHTML = auth.pk;
  techInfo.getElementsByClassName("apiBaseUrl")[0].innerHTML = auth.apiBaseUrl;
}

export function rerender(hot) {
  const col = {}; // dummy
  hot.setDataAtRowProp(
    0,
    col.Notes.prop,
    hot.getDataAtRowProp(0, col.Notes.prop)
  );
}
