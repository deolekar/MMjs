/* eslint-disable no-undef */
/**
 * control layers outside the map
 */

// config map
let config = {
  minZoom: 1,
  maxZoom: 12,
};
// magnification with which the map will start
const zoom = 2;
// co-ordinates
const lat = 22.918904;
const lng = 75.1343786;

// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function onEachFeature(feature, layer) {
  layer.bindPopup(feature.properties.nazwa);
}

// adding geojson by fetch
// of course you can use jquery, axios etc.
fetch("../data/india.geojson")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // use geoJSON
    L.geoJSON(data, {
      onEachFeature: onEachFeature,
    }).addTo(map);
  });

// ------------------------------------------------------------

// async function to load geojson
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// fetching data from geojson
const poiLayers = L.layerGroup().addTo(map);

// center map on the clicked marker
function clickZoom(e) {
  map.setView(e.target.getLatLng());
}

let geojsonOpts = {
  pointToLayer: function (feature, latlng) {
    if (feature.properties.image === undefined) {
      feature.properties.image =
        "images/no_img.png";
    }

    if (feature.properties.instagram === undefined) {
      tooltipIG = "<a> </a>"
    } else {
      tooltipIG = "<a href=" + feature.properties.instagram + " target='_blank'>Instagram </a>"
      console.log(tooltipIG)
    }

    if (feature.properties.facebook === undefined) {
      tooltipFB = "<a> </a>"
    } else {
      tooltipFB = "<a href=" + feature.properties.facebook + " target='_blank'>Facebook </a>"
      console.log(tooltipFB)
    }

    if (feature.properties.website === undefined) {
      tooltipWEB = "<a> </a>"
    } else {
      tooltipWEB = "<a href=" + feature.properties.website + " target='_blank'>Website </a>"
      console.log(tooltipWEB)
    }

    return L.marker(latlng, {
      icon: L.icon({
        className: "image-icon",
        iconSize: [50, 30],
        iconUrl: feature.properties.image,
        popupAnchor: [0, -40],
      }),
    })
      .bindPopup(
        "<b>" +
        feature.properties.name +
        "</b>" + "<br>" +
        feature.properties.amenity +
        "<br>" +
        "<br>" + tooltipIG +
        "<br>" + tooltipFB +
        "<br>" + tooltipWEB
      )
      .on("click", clickZoom);
  },
};

const layersContainer = document.querySelector(".layers");

const layersButton = "all";

function generateButton(name) {
  const id = name === layersButton ? "all-layers" : name;

  const templateLayer = `
    <li class="layer-element">
      <label for="${id}">
        <input type="checkbox" id="${id}" name="item" class="item" value="${name}" checked>
        <span>${name}</span>
      </label>
    </li>
  `;

  layersContainer.insertAdjacentHTML("beforeend", templateLayer);
}

generateButton(layersButton);

// add data to geoJSON layer and add to LayerGroup
const arrayLayers = ["mandal", "business", "initiative"];

arrayLayers.map((json) => {
  generateButton(json);
  fetchData(`./data/${json}.json`).then((data) => {
    window["layer_" + json] = L.geoJSON(data, geojsonOpts).addTo(map);
  });
});

document.addEventListener("click", (e) => {
  const target = e.target;

  const itemInput = target.closest(".item");

  if (!itemInput) return;

  showHideLayer(target);

});

function showHideLayer(target) {
  if (target.id === "all-layers") {
    arrayLayers.map((json) => {
      checkedType(json, target.checked);
    });
  } else {
    checkedType(target.id, target.checked);
  }

  const checkedBoxes = document.querySelectorAll("input[name=item]:checked");

  document.querySelector("#all-layers").checked =
    checkedBoxes.length - (document.querySelector("#all-layers").checked === true ? 1 : 0) < 3 ? false : true;
}

function checkedType(id, type) {
  map[type ? "addLayer" : "removeLayer"](window["layer_" + id]);

  //map.fitBounds(window[["layer_" + id]].getBounds(), { padding: [50, 50] });

  document.querySelector(`#${id}`).checked = type;
}
