/* ===========================================================
   ReliefMap
   Configuration File
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   API CONFIGURATION
=========================================================== */

const CONFIG = {

    API_BASE_URL: "http://127.0.0.1:5000/aoi",

    API_VERSION: "v1",

    REQUEST_TIMEOUT: 10000,

    AUTO_REFRESH: true,

    REFRESH_INTERVAL: 30000

};

/* ===========================================================
   MAP CONFIGURATION
=========================================================== */

const MAP_CONFIG = {

    DEFAULT_LOCATION: {

        lat: 13.0827,

        lng: 80.2707,

        zoom: 11

    },

    TILE_LAYER:

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    ATTRIBUTION:

        "&copy; OpenStreetMap Contributors"

};

/* ===========================================================
   DASHBOARD CONFIGURATION
=========================================================== */

const DASHBOARD = {

    ANIMATION_DURATION: 1200,

    CARD_DELAY: 150,

    MAX_NEWS: 10,

    MAX_NOTIFICATIONS: 20

};

/* ===========================================================
   CHART COLORS
=========================================================== */

const COLORS = {

    PRIMARY: "#2563eb",

    SECONDARY: "#38bdf8",

    SUCCESS: "#16a34a",

    WARNING: "#f59e0b",

    DANGER: "#dc2626",

    PURPLE: "#7c3aed",

    CYAN: "#06b6d4",

    ORANGE: "#fb923c",

    PINK: "#ec4899"

};

/* ===========================================================
   CHART DEFAULT OPTIONS
=========================================================== */

const CHART_OPTIONS = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            position: "bottom"

        }

    },

    animation: {

        duration: 1500

    }

};

/* ===========================================================
   THEMES
=========================================================== */

const THEMES = [

    "light",

    "dark",

    "blue",

    "green"

];

/* ===========================================================
   LANGUAGES
=========================================================== */

const LANGUAGES = [

    "English",

    "Tamil"

];

/* ===========================================================
   USER ROLES
=========================================================== */

const USER_ROLES = {

    ADMIN: "Administrator",

    VOLUNTEER: "Volunteer",

    NGO: "NGO",

    PUBLIC: "Citizen"

};

/* ===========================================================
   NOTIFICATION TYPES
=========================================================== */

const NOTIFICATION_TYPES = {

    SUCCESS: "success",

    ERROR: "error",

    WARNING: "warning",

    INFO: "info"

};

/* ===========================================================
   STORAGE KEYS
=========================================================== */

const STORAGE = {

    THEME: "relief_theme",

    LANGUAGE: "relief_language",

    USER: "relief_user",

    SETTINGS: "relief_settings"

};

/* ===========================================================
   END OF CONFIG
=========================================================== */

console.log("✅ ReliefMap Config Loaded");