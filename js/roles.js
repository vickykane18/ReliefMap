    /* ===========================================================
   ReliefMap
   Multi-Role System (Citizen / NGO / Volunteer)
   Author : Vigneshan S
   Year : 2026

   Role configuration, role guard, demo data store and
   workflow helpers. Works fully in the browser (localStorage)
   so every button is functional without a backend.
=========================================================== */

"use strict";

/* ===========================================================
   ROLE CONFIG
=========================================================== */

const ROLES = {

    CITIZEN: {
        key: "Citizen",
        label: "Citizen",
        theme: "role-citizen",
        icon: "fa-user-group",
        defaultPage: "index.html"
    },

    NGO: {
        key: "NGO",
        label: "NGO",
        theme: "role-ngo",
        icon: "fa-truck-medical",
        defaultPage: "index.html"
    },

    VOLUNTEER: {
        key: "Volunteer",
        label: "Volunteer",
        theme: "role-volunteer",
        icon: "fa-handshake-angle",
        defaultPage: "index.html"
    },

    ADMIN: {
        key: "Administrator",
        label: "Administrator",
        theme: "role-ngo",
        icon: "fa-user-shield",
        defaultPage: "index.html"
    }
};

/* ===========================================================
   ROLE-GATED NAVIGATION (filters NAV_ITEMS in layout.js)
   Each role only sees its own modules.
=========================================================== */

const ROLE_NAV = {

    Citizen: [
        { page: "dashboard", href: "index.html", icon: "fa-house", label: "Home" },
        { page: "requests", href: "index.html#citizen-requests", icon: "fa-list-check", label: "My Requests" },
        { page: "offers", href: "index.html#citizen-offers", icon: "fa-hand-holding-heart", label: "Offer Help" },
        { page: "donate", href: "index.html#citizen-donate", icon: "fa-hand-holding-dollar", label: "Donate" },
        { page: "centers", href: "map.html", icon: "fa-map-location-dot", label: "Nearby Relief" },
        { page: "map", href: "map.html", icon: "fa-map", label: "Live Map" },
        { page: "profile", href: "profile.html", icon: "fa-user", label: "Profile" },
        { page: "settings", href: "settings.html", icon: "fa-gear", label: "Settings" }
    ],

    NGO: [
        { page: "dashboard", href: "index.html", icon: "fa-gauge-high", label: "Dashboard" },
        { page: "requests", href: "index.html#ngo-requests", icon: "fa-inbox", label: "Incoming Requests" },
        { page: "map", href: "map.html", icon: "fa-map", label: "Live Relief Map" },
        { page: "hospitals", href: "map.html#hospitals", icon: "fa-hospital", label: "Hospitals" },
        { page: "shelters", href: "map.html#shelters", icon: "fa-house", label: "Shelters" },
        { page: "resources", href: "index.html#ngo-resources", icon: "fa-boxes-stacked", label: "Resources" },
        { page: "volunteers", href: "index.html#ngo-volunteers", icon: "fa-users", label: "Volunteers" },
        { page: "analytics", href: "analytics.html", icon: "fa-chart-column", label: "Analytics" },
        { page: "profile", href: "profile.html", icon: "fa-user", label: "Profile" },
        { page: "settings", href: "settings.html", icon: "fa-gear", label: "Settings" }
    ],

    Volunteer: [
        { page: "dashboard", href: "index.html", icon: "fa-house", label: "Dashboard" },
        { page: "missions", href: "index.html#volunteer-missions", icon: "fa-bullseye", label: "Assigned Missions" },
        { page: "nearby", href: "map.html", icon: "fa-location-crosshairs", label: "Nearby Requests" },
        { page: "navigation", href: "map.html", icon: "fa-map", label: "Navigation" },
        { page: "history", href: "index.html#volunteer-history", icon: "fa-clock-rotate-left", label: "Mission History" },
        { page: "profile", href: "profile.html", icon: "fa-user", label: "Profile" },
        { page: "settings", href: "settings.html", icon: "fa-gear", label: "Settings" }
    ],

    Administrator: [
        { page: "dashboard", href: "index.html", icon: "fa-gauge-high", label: "Dashboard" },
        { page: "map", href: "map.html", icon: "fa-map", label: "Live Map" },
        { page: "analytics", href: "analytics.html", icon: "fa-chart-column", label: "Analytics" },
        { page: "ai", href: "ai.html", icon: "fa-brain", label: "AI Center" },
        { page: "news", href: "news.html", icon: "fa-newspaper", label: "News" },
        { page: "profile", href: "profile.html", icon: "fa-user", label: "Profile" },
        { page: "settings", href: "settings.html", icon: "fa-gear", label: "Settings" },
        { page: "contact", href: "contact.html", icon: "fa-envelope", label: "Contact" }
    ]
};

/* ===========================================================
   STORAGE KEYS
=========================================================== */

const RS = {
    REQUESTS: "relief_requests",
    OFFERS: "relief_offers",
    MISSIONS: "relief_missions",
    CHAT: "relief_chat",
    NOTIFS: "relief_notifs"
};

/* ===========================================================
   SESSION HELPERS
=========================================================== */

function rGetSession() {
    try {
        const raw = localStorage.getItem("relief_user");
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function rGetRole() {
    const s = rGetSession();
    return (s && s.user && s.user.role) || "Citizen";
}

function rIsLoggedIn() {
    const s = rGetSession();
    return !!(s && s.token && s.user);
}

function rRoleTheme() {
    const role = rGetRole();
    if (ROLES.CITIZEN && role === "Citizen") return "role-citizen";
    if (role === "NGO") return "role-ngo";
    if (role === "Volunteer") return "role-volunteer";
    if (role === "Administrator") return "role-ngo";
    return "role-citizen";
}

/* ===========================================================
   DEMO DATA STORE
=========================================================== */

function rsRead(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}

function rsWrite(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error(e); }
}

/* Seed demo requests (Citizen → NGO workflow) */
function seedReliefData() {

    if (rsRead(RS.REQUESTS, null)) return;

    const now = Date.now();

    const requests = [
        {
            id: "REQ-1001",
            type: "Flood",
            severity: "Critical",
            urgency: "Critical",
            reporter: "Priya S",
            location: "North Chennai",
            lat: 13.2156,
            lng: 80.2812,
            description: "Water level rising fast, family of 4 trapped on first floor.",
            image: "assets/images/news1.jpg",
            status: "NGO Accepted",
            citizenAlerted: false,
            createdAt: now - 3600 * 1000,
            volunteer: null
        },
        {
            id: "REQ-1002",
            type: "Medical Emergency",
            severity: "High",
            urgency: "High",
            reporter: "Karthik R",
            location: "Velachery",
            lat: 12.9816,
            lng: 80.2196,
            description: "Elderly person needs urgent medical attention.",
            image: "assets/images/news2.jpg",
            status: "Verified",
            citizenAlerted: false,
            createdAt: now - 7200 * 1000,
            volunteer: null
        },
        {
            id: "REQ-1003",
            type: "Fire",
            severity: "Medium",
            urgency: "Medium",
            reporter: "Sneha P",
            location: "Adyar",
            lat: 13.0012,
            lng: 80.2565,
            description: "Small fire in residential area, needs water supply support.",
            image: "assets/images/news3.jpg",
            status: "Pending",
            citizenAlerted: false,
            createdAt: now - 10800 * 1000,
            volunteer: null
        }
    ];

    rsWrite(RS.REQUESTS, requests);

    const missions = [
        {
            id: "MIS-5001",
            requestId: "REQ-1001",
            title: "Flood Rescue — North Chennai",
            location: "North Chennai",
            lat: 13.2156,
            lng: 80.2812,
            status: "On the way",
            assignedAt: now - 1800 * 1000,
            photo: null
        }
    ];

    rsWrite(RS.MISSIONS, missions);

    const offers = [
        { id: "OFF-1", kind: "Food", by: "Rahul M", qty: "50 packets", status: "Open" },
        { id: "OFF-2", kind: "Shelter", by: "Anna Nagar Hall", qty: "20 beds", status: "Open" },
        { id: "OFF-3", kind: "Water", by: "Arun K", qty: "100 bottles", status: "Open" }
    ];

    rsWrite(RS.OFFERS, offers);

    rsWrite(RS.CHAT, [
        { who: "NGO-Coord", text: "Thank you for reporting. We are reviewing your request.", time: "09:20 AM" }
    ]);

    rsWrite(RS.NOTIFS, [
        { text: "Welcome to ReliefMap! Choose your role to begin.", time: "Now", read: false }
    ]);
}

/* ===========================================================
   REQUEST HELPERS
=========================================================== */

function addCitizenRequest(payload) {

    /* Offline-First: if offline, queue locally for later sync */
    const offlineActive =
        (typeof window.Offline !== "undefined" &&
         typeof window.Offline.isOnline === "function" &&
         !window.Offline.isOnline());

    if (offlineActive) {
        const session = rGetSession();
        const item = window.Offline.queueRequest({
            type: payload.type || "Request",
            name: payload.name || "Citizen",
            userId: (session && session.user && session.user.id) || "",
            lat: (payload.gps && payload.gps.lat) || payload.lat || null,
            lng: (payload.gps && payload.gps.lng) || payload.lng || null,
            image: payload.image || "",
            description: payload.description || "",
            timestamp: Date.now()
        });
        addNotification("Request " + item.id + " saved offline. Will sync when online.");
        return item;
    }

    const requests = rsRead(RS.REQUESTS, []);

    const n = 1000 + requests.length + 1;

    const request = {
        id: "REQ-" + n,
        type: payload.type,
        severity: payload.urgency,
        urgency: payload.urgency,
        reporter: payload.name || "Citizen",
        location: payload.location,
        lat: payload.lat || 13.0827,
        lng: payload.lng || 80.2707,
        description: payload.description,
        image: payload.image || "",
        gpsShared: !!payload.gps,
        status: "Pending",
        citizenAlerted: false,
        createdAt: Date.now(),
        volunteer: null
    };

    requests.unshift(request);
    rsWrite(RS.REQUESTS, requests);

    addNotification("Request " + request.id + " submitted successfully. Status: Pending.");
    return request;
}

function updateRequestStatus(id, status) {

    /* Offline-First: queue NGO/coordinator status changes when offline */
    const offlineActive =
        (typeof window.Offline !== "undefined" &&
         typeof window.Offline.isOnline === "function" &&
         !window.Offline.isOnline());

    if (offlineActive) {
        window.Offline.queueAction("updateRequestStatus", { id, status });
        addNotification("Status change queued (offline): " + id + " → " + status);
        return getRequestById(id);
    }

    const requests = rsRead(RS.REQUESTS, []);
    const idx = requests.findIndex(r => r.id === id);
    if (idx >= 0) {
        requests[idx].status = status;
        rsWrite(RS.REQUESTS, requests);
        addNotification("Request " + id + " → " + status);
        return requests[idx];
    }
    return null;
}

function getRequestById(id) {
    const requests = rsRead(RS.REQUESTS, []);
    return requests.find(r => r.id === id) || null;
}

/* ===========================================================
   OFFER / DONATION HELPERS
=========================================================== */

function addOffer(kind, by, qty) {
    const offers = rsRead(RS.OFFERS, []);
    offers.unshift({ id: "OFF-" + Date.now(), kind, by, qty, status: "Open" });
    rsWrite(RS.OFFERS, offers);
    addNotification(kind + " offer added by " + by + ".");
    return offers;
}

/* ===========================================================
   VOLUNTEER MISSION HELPERS
=========================================================== */

function getMyMissions() {
    return rsRead(RS.MISSIONS, []);
}

function acceptMission(id) {
    const missions = rsRead(RS.MISSIONS, []);
    const m = missions.find(x => x.id === id);
    if (m) {
        m.status = "On the way";
        rsWrite(RS.MISSIONS, missions);
        addNotification("Mission " + id + " accepted.");
    }
}

function updateMissionStatus(id, status, photo, lat, lng) {
    const missions = rsRead(RS.MISSIONS, []);
    const m = missions.find(x => x.id === id);
    if (m) {
        m.status = status;
        if (photo) m.photo = photo;
        if (lat) m.lat = lat;
        if (lng) m.lng = lng;
        rsWrite(RS.MISSIONS, missions);
        addNotification("Mission " + id + " → " + status);
        if (status === "Completed") {
            const req = getRequestById(m.requestId);
            if (req) updateRequestStatus(req.id, "Completed");
        }
    }
}

/* ===========================================================
   NOTIFICATIONS
=========================================================== */

function addNotification(text) {
    const notifs = rsRead(RS.NOTIFS, []);
    notifs.unshift({ text, time: new Date().toLocaleTimeString(), read: false });
    rsWrite(RS.NOTIFS, notifs);
    if (typeof showToast === "function") {
        showToast(text, "info");
    }
}

function getNotifications() {
    return rsRead(RS.NOTIFS, []);
}

/* ===========================================================
   AI STYLE HELPERS (demo intelligence)
=========================================================== */

function suggestNGO() {
    const ngos = ["Chennai Relief Trust", "Hope Foundation", "Red Cross Chennai"];
    return ngos[Math.floor(Math.random() * ngos.length)];
}

function suggestHospital() {
    const list = ["Rajiv Gandhi Hospital", "Government General Hospital", "Apollo Hospital"];
    return list[Math.floor(Math.random() * list.length)];
}

function suggestShelter() {
    const list = ["Anna University Shelter", "Community Hall T. Nagar", "YMCA Shelter"];
    return list[Math.floor(Math.random() * list.length)];
}

function estimateReliefTime() {
    return Math.floor(Math.random() * 40) + 15 + " min";
}

/* ===========================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    seedReliefData();
    const theme = rRoleTheme();
    document.body.classList.remove("role-citizen", "role-ngo", "role-volunteer");
    document.body.classList.add(theme);
});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Roles Module Loaded");
