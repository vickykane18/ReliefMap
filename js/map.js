/* ===========================================================
   ReliefMap
   Map Controller
=========================================================== */

"use strict";

let reliefMap = null;
let markerGroup = null;

/* ===========================================================
   INITIALIZE MAP
=========================================================== */

function initializeMap() {

    const container = document.getElementById("mapContainer");

    if (!container) return;

    // Already initialized
    if (reliefMap instanceof L.Map) {
        return reliefMap;
    }

    // Remove any previous Leaflet instance
    if (container._leaflet_id != null) {

        try {

            container._leaflet_id = null;

        } catch (e) {}

    }

    reliefMap = L.map("mapContainer", {
        zoomControl: true
    });

    reliefMap.setView(
        [
            MAP_CONFIG.DEFAULT_LOCATION.lat,
            MAP_CONFIG.DEFAULT_LOCATION.lng
        ],
        MAP_CONFIG.DEFAULT_LOCATION.zoom
    );

    L.tileLayer(
        MAP_CONFIG.TILE_LAYER,
        {
            attribution: MAP_CONFIG.ATTRIBUTION,
            maxZoom: 19
        }
    ).addTo(reliefMap);

    markerGroup = L.layerGroup().addTo(reliefMap);

    return reliefMap;
}

/* ===========================================================
   CREATE MARKER
=========================================================== */

function createMarker(center) {

    let icon = hospitalIcon;

    switch (center.type) {

        case "Hospital":
            icon = hospitalIcon;
            break;

        case "Shelter":
            icon = shelterIcon;
            break;

        case "Food Center":
            icon = foodIcon;
            break;

        case "Volunteer":
            icon = volunteerIcon;
            break;
    }

    return L.marker([center.lat, center.lon], {
        icon: icon
    }).bindPopup(`
        <div style="min-width:220px">
            <h3>${center.name}</h3>
            <hr>
            <p><b>📍 Location:</b> ${center.location}</p>
            <p><b>🏷 Type:</b> ${center.type}</p>
            <p><b>🟢 Status:</b> ${center.status}</p>
        </div>
    `);
}

/* ===========================================================
   LOAD MAP
=========================================================== */

async function loadMap() {

    if (!reliefMap) return;

    try {

        const response = await API.getMapData();

        if (!response.success) return;

        markerGroup.clearLayers();

        const bounds = [];

        response.data.forEach(center => {

            let color = "#2563eb";
            let icon = "🏠";

            switch(center.type){

                case "Hospital":
                    color = "#ef4444";
                    icon = "🏥";
                    break;

                case "Shelter":
                    color = "#3b82f6";
                    icon = "🏠";
                    break;

                case "Food Center":
                    color = "#f59e0b";
                    icon = "🍱";
                    break;

                case "Volunteer":
                    color = "#10b981";
                    icon = "🙋";
                    break;

            }

            const marker = L.circleMarker(
                [center.lat, center.lon],
                {
                    radius:12,
                    color:"#ffffff",
                    weight:3,
                    fillColor:color,
                    fillOpacity:0.95
                }
            );

            marker.bindPopup(`
                <div style="min-width:220px">
                    <h3>${icon} ${center.name}</h3>
                    <hr>
                    <p><b>Type:</b> ${center.type}</p>
                    <p><b>Location:</b> ${center.location}</p>
                    <p><b>Status:</b>
                        <span style="color:green">
                            ${center.status}
                        </span>
                    </p>
                </div>
            `);

            marker.addTo(markerGroup);

            bounds.push([center.lat, center.lon]);

        });

        if(bounds.length){

            reliefMap.fitBounds(bounds,{
                padding:[60,60]
            });

        }

    }

    catch(error){

        console.error(error);

    }

}
/* ===========================================================
   USER LOCATION
=========================================================== */

function locateUser() {

    if (!navigator.geolocation) {

        showToast(
            "Geolocation not supported",
            "warning"
        );

        return;

    }

    navigator.geolocation.getCurrentPosition(

        position => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            L.marker([lat, lng])
                .addTo(reliefMap)
                .bindPopup("📍 You are here")
                .openPopup();

            reliefMap.setView([lat, lng], 14);

        },

        () => {

            showToast(
                "Unable to get your location",
                "warning"
            );

        }

    );

}

/* ===========================================================
   ENABLE MAP CLICK
=========================================================== */

function enableMapClick() {

    if (!reliefMap) return;

    reliefMap.off("click");

    reliefMap.on("click", function (event) {

        L.popup()
            .setLatLng(event.latlng)
            .setContent(
                `
                Latitude : ${event.latlng.lat.toFixed(5)}
                <br>
                Longitude : ${event.latlng.lng.toFixed(5)}
                `
            )
            .openOn(reliefMap);

    });

}

/* ===========================================================
   RESIZE
=========================================================== */

function resizeMap() {

    if (reliefMap) {

        setTimeout(() => {

            reliefMap.invalidateSize();

        }, 200);

    }

}

/* ===========================================================
   BUTTONS
=========================================================== */

const refreshButton = document.getElementById("refreshMap");

if (refreshButton) {

    refreshButton.addEventListener("click", loadMap);

}

const locateButton = document.getElementById("locateMe");

if (locateButton) {

    locateButton.addEventListener("click", locateUser);

}

/* ===========================================================
   WINDOW
=========================================================== */

window.addEventListener(
    "resize",
    resizeMap
);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Map Module Loaded");