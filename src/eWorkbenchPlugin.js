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
function loadPluginInstanceDetailsFromBackend(plugin) {
  const url = plugin.apiBaseUrl + plugin.pk + "/?jwt=" + plugin.jwt;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (pluginInstanceDetailJSON) {
      loadTableDataFromBackend(pluginInstanceDetailJSON["download_rawdata"]);
    });
}

// load app details from backend
function loadTableDataFromBackend(tableDataURL) {
  fetch(tableDataURL)
    .then(function (response) {
      return response.text();
    })
    .then(function (tableData) {
      if (tableData) {
        //TODO
      }
    });
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURI.split(",")[1]);
  else byteString = unescape(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
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
  constructor(table) {
    console.log("Hello Plugin");
    const locationData = parseLocation();
    this.auth = {
      apiBaseUrl: decodeURIComponent(locationData.apiBaseUrl),
      pk: locationData.pk,
      jwt: locationData.jwt,
    };

    this.table = table;

    showTechInfo(this.auth);
  }

  load() {
    loadPluginInstanceDetailsFromBackend(this.auth);
  }

  save() {
    const file = this.table.exportCSVBlob();
    const img = this.table.exportImage();
    const picture = dataURItoBlob(img[0].src);

    sendForm(buildForm(file, picture), this.auth);
  }
}
