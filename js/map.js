/* ===========================================================
   ReliefMap
   Map Controller
=========================================================== */

"use strict";

let reliefMap = null;
let markerGroup = null;
let mapDataCache = [];
let activeFilter = "all";

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

    // Use marker clustering when available, otherwise fall back to layerGroup
    if (typeof L.markerClusterGroup === "function") {
        markerGroup = L.markerClusterGroup();
    } else {
        markerGroup = L.layerGroup();
    }
    markerGroup.addTo(reliefMap);

    return reliefMap;
}

/* ===========================================================
   LOAD MAP
=========================================================== */

async function loadMap() {

    if (!reliefMap) return;

    try {

        const response = await API.getMapData();

        if (!response.success) return;

        mapDataCache = response.data;

        renderMarkers();

    }

    catch(error){

        console.error(error);

    }

}

/* ===========================================================
   RENDER MARKERS (respects active filter)
=========================================================== */

function renderMarkers() {

    if (!reliefMap) return;

    markerGroup.clearLayers();

    const bounds = [];

    const filtered = activeFilter === "all"
        ? mapDataCache
        : mapDataCache.filter(c => c.type === activeFilter);

    filtered.forEach(center => {

        let color = "#0d9488";
        let icon = "🏠";

        switch(center.type){

            case "Hospital":
                color = "#ef4444";
                icon = "🏥";
                break;

            case "Shelter":
                color = "#0d9488";
                icon = "🏠";
                break;

            case "Food Center":
                color = "#f59e0b";
                icon = "🍱";
                break;

            case "Volunteer":
                color = "#7c3aed";
                icon = "🙋";
                break;

        }

        // If clustering is available, use a divIcon marker for nicer clusters
        let marker;

        if (typeof L.marker === "function" && typeof L.markerClusterGroup === "function") {

            const html = `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${color};color:#fff;font-size:16px;border:3px solid #fff">${icon}</div>`;

            marker = L.marker([center.lat, center.lon], {
                icon: L.divIcon({
                    className: 'rm-div-icon',
                    html: html,
                    iconSize: [34,34],
                    iconAnchor: [17,17]
                })
            });

        } else {

            marker = L.circleMarker(
                [center.lat, center.lon],
                {
                    radius:12,
                    color:"#ffffff",
                    weight:3,
                    fillColor:color,
                    fillOpacity:0.95
                }
            );

        }

        marker.bindPopup(`
            <div style="min-width:240px">
                <h3>${icon} ${center.name}</h3>
                <hr>
                <p><b>Type:</b> ${center.type}</p>
                <p><b>Location:</b> ${center.location}</p>
                <p><b>Status:</b>
                    <span style="color:green">
                        ${center.status}
                    </span>
                </p>

                <div class="popup-actions" style="margin-top:10px">
                    <button class="popup-btn popup-view" data-id="${center.id}">View</button>
                    <button class="popup-btn popup-nav" data-lat="${center.lat}" data-lon="${center.lon}">Navigate</button>
                    <button class="popup-btn popup-assign" data-id="${center.id}">Assign</button>
                </div>
            </div>
        `);

        marker.addTo(markerGroup);

        // Popup action handlers (attach on popupopen)
        marker.on('popupopen', function (e) {
            const popup = e.popup;
            const container = (typeof popup.getElement === 'function') ? popup.getElement() : popup._container;
            if (!container) return;

            const viewBtn = container.querySelector('.popup-view');
            const navBtn = container.querySelector('.popup-nav');
            const assignBtn = container.querySelector('.popup-assign');

            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    const id = viewBtn.dataset.id;
                    viewCenter(id);
                });
            }

            if (navBtn) {
                navBtn.addEventListener('click', () => {
                    const lat = parseFloat(navBtn.dataset.lat);
                    const lon = parseFloat(navBtn.dataset.lon);
                    navigateTo(lat, lon);
                });
            }

            if (assignBtn) {
                assignBtn.addEventListener('click', () => {
                    const id = assignBtn.dataset.id;
                    assignCenter(id);
                });
            }

        });

        bounds.push([center.lat, center.lon]);

    });

    if(bounds.length){

        reliefMap.fitBounds(bounds,{
            padding:[60,60]
        });

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
   MAP FILTER BUTTONS
=========================================================== */

document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        activeFilter = btn.dataset.filter || "all";

        renderMarkers();

    });

});

/* ===========================================================
   WINDOW
=========================================================== */

window.addEventListener(
    "resize",
    resizeMap
);

/* ===========================================================
   INITIALIZE MAP ON PAGE LOAD
=========================================================== */

function initMapPage() {

    initializeMap();

    if (reliefMap) {

        loadMap();

        enableMapClick();

    }

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initMapPage
    );

}

else {

    initMapPage();

}

/* ===========================================================
   END
=========================================================== */

console.log("✅ Map Module Loaded");

/* ===========================================================
   POPUP ACTION HELPERS
=========================================================== */

function viewCenter(id) {
    if (!id) return;
    // Navigate to the dashboard with the center id for context.
    // reports.html does not exist, so route to a valid page.
    location.href = `index.html?center=${id}`;
}

function navigateTo(lat, lon) {
    if (!reliefMap) return;
    reliefMap.setView([lat, lon], 15);
    showToast('Centered map to selected location', 'success');
}

function assignCenter(id) {
    // Lightweight demo assignment flow — replace with real workflow later
    showToast(`Assigning volunteer to center ${id} (demo)`, 'info');
}
