import "./style.css";
import Plugin from "./eWorkbenchPlugin.js";

const plugin = new Plugin();
window.onload = plugin.load();

/* uncomment to enable Test buttons: */
// import addTests from "./tests.js";
// addTests(plugin);
