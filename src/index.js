import "./style.css";
import Plugin from "./eWorkbenchPlugin.js";

const plugin = new Plugin();
window.onload = ((plugin) =>
  function () {
    plugin.load();
  })(plugin);

/* uncomment to enable Test buttons: */
// import addTests from "./tests.js";
// addTests(plugin);
