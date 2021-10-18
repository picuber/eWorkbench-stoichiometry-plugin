import Table from "./Table.js";

// get params from location
function parseLocation() {
  const params = location.href.split("?")[1].split("&");
  const locationData = {};

  for (let x in params) {
    const paramParts = params[x].split("=");
    const key = paramParts[0];
    const value = paramParts[1];
    locationData[key] = value;
  }

  return locationData;
}

function showTechInfo(auth) {
  const techInfo = document.getElementById("tech_info");
  techInfo.getElementsByClassName("jwt")[0].innerHTML = auth.jwt;
  techInfo.getElementsByClassName("pk")[0].innerHTML = auth.pk;
  techInfo.getElementsByClassName("apiBaseUrl")[0].innerHTML = auth.apiBaseUrl;
}

// load plugin details from backend (Called from onload)
function loadPluginInstanceDetailsFromBackend(auth, table) {
  const url = auth.apiBaseUrl + auth.pk + "/?jwt=" + auth.jwt;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (pluginInstanceDetailJSON) {
      loadTableDataFromBackend(
        pluginInstanceDetailJSON["download_rawdata"],
        table
      );
    });
}

// load app details from backend
function loadTableDataFromBackend(tableDataURL, table) {
  fetch(tableDataURL)
    .then(function (response) {
      return response.text();
    })
    .then(function (tableData) {
      if (tableData) {
        table.loadData(tableData);
      }
    });
}

function buildForm(file, picture) {
  const formData = new FormData();
  formData.append("picture", picture, "picture_representation.png");
  formData.append("rawdata", file, "rawdata");
  return formData;
}

function sendForm(formData, auth) {
  const headers = new Headers({
    Authorization: "JWT " + auth.jwt,
  });

  const options = {
    method: "PATCH",
    body: formData,
    credentials: "include",
    headers,
  };

  const url = auth.apiBaseUrl + auth.pk + "/";
  fetch(url, options)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error))
    .then((response) => console.log("Success:", JSON.stringify(response)));
}

export default class Plugin {
  constructor() {
    console.log("Hello Plugin");
    const locationData = parseLocation();
    this.auth = {
      apiBaseUrl: decodeURIComponent(locationData.apiBaseUrl),
      pk: locationData.pk,
      jwt: locationData.jwt,
    };

    this.table = new Table();
    document.getElementById("save-button").onclick = ((plugin) =>
      function () {
        plugin.save();
      })(this);
    document.getElementById("load-button").onclick = ((plugin) =>
      function () {
        plugin.load();
      })(this);

    showTechInfo(this.auth);
  }

  load() {
    loadPluginInstanceDetailsFromBackend(this.auth, this.table);
  }

  save() {
    const file = new Blob([this.table.getData()], { type: "application/json" });

    this.table.exportImage((picture) =>
      sendForm(buildForm(file, picture), this.auth)
    );
  }
}
