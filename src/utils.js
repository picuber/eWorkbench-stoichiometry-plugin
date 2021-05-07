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
