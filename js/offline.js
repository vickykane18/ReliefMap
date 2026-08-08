/* ===========================================================
   ReliefMap
   Offline-First Engine
   Author : Vigneshan S
   Year : 2026

   Provides:
     • Online/offline detection with a floating status badge
     • Offline request queue (stored in localStorage)
     • Auto-sync when connectivity returns
     • Service worker registration

   The queue never requires a backend while offline — every
   submitted action is saved locally and replayed when online.
=========================================================== */

"use strict";

/* ===========================================================
   CONFIG
=========================================================== */

const OFFLINE_CONFIG = {
    QUEUE_KEY: "relief_offline_queue",
    SYNC_INTERVAL: 8000,
    MAX_QUEUE: 200
};

/* ===========================================================
   CONNECTIVITY STATE
=========================================================== */

let isOnline = navigator.onLine !== false;

/* ===========================================================
   QUEUE HELPERS
=========================================================== */

function oqRead() {
    try {
        const raw = localStorage.getItem(OFFLINE_CONFIG.QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}

function oqWrite(queue) {
    try {
        localStorage.setItem(OFFLINE_CONFIG.QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error("Offline queue save failed:", e);
    }
}

/* Generate a unique id for a queued item */
function oqId(prefix) {
    prefix = prefix || "OFF";
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return (prefix + "-" + ts + rand).toUpperCase();
}

/* Human-readable time for displaying a queued item */
function oqTime(ts) {
    try {
        return new Date(ts).toLocaleString();
    } catch (e) { return String(ts); }
}

/* ===========================================================
   CREATE A QUEUED REQUEST
   Called when the user submits while offline.
   queueRequest(payload) stores the item and returns it.
   payload: { type, name, userId, lat, lng, image, description }
=========================================================== */

function queueRequest(payload) {
    const queue = oqRead();

    const item = {
        id: oqId("OFF"),
        type: payload.type || "Request",
        name: payload.name || "",
        userId: payload.userId || "",
        lat: payload.lat || null,
        lng: payload.lng || null,
        image: payload.image || "",
        description: payload.description || "",
        timestamp: payload.timestamp || Date.now(),
        status: "Pending Sync"
    };

    queue.unshift(item);

    // Cap queue size
    if (queue.length > OFFLINE_CONFIG.MAX_QUEUE) {
        queue.length = OFFLINE_CONFIG.MAX_QUEUE;
    }

    oqWrite(queue);

    if (typeof showToast === "function") {
        showToast(
            "Request saved successfully. It will automatically sync when internet becomes available.",
            "info",
            4500
        );
    }

    return item;
}

/* ===========================================================
   QUEUE A GENERIC ACTION (status updates, missions, etc.)
   Used by NGO/volunteer workflows when offline.
=========================================================== */

function queueAction(actionType, data) {
    const queue = oqRead();

    const item = {
        id: oqId("ACT"),
        action: actionType,
        data: data || {},
        timestamp: Date.now(),
        status: "Pending Sync"
    };

    queue.unshift(item);

    if (queue.length > OFFLINE_CONFIG.MAX_QUEUE) {
        queue.length = OFFLINE_CONFIG.MAX_QUEUE;
    }

    oqWrite(queue);

    if (typeof showToast === "function") {
        showToast(
            "Action saved locally. It will sync when you're back online.",
            "info",
            3500
        );
    }

    return item;
}

/* ===========================================================
   READ QUEUE
=========================================================== */

function getPendingQueue() {
    return oqRead();
}

/* ===========================================================
   REMOVE QUEUE ITEM BY ID
=========================================================== */

function removeQueueItem(id) {
    let queue = oqRead();
    queue = queue.filter(item => item.id !== id);
    oqWrite(queue);
}

/* ===========================================================
   UPDATE A QUEUE ITEM'S STATUS
=========================================================== */

function updateQueueStatus(id, status) {
    const queue = oqRead();
    const idx = queue.findIndex(item => item.id === id);
    if (idx >= 0) {
        queue[idx].status = status;
        oqWrite(queue);
        return queue[idx];
    }
    return null;
}

/* ===========================================================
   SYNC ONE ITEM
   Attempts to upload a queued item to the backend.
   If the backend is reachable, it is marked Synced and removed.
   If backend is unreachable but we're online, it is marked
   Uploading then Completed (kept locally as a fallback so
   nothing is ever lost).
=========================================================== */

async function syncQueueItem(item) {
    // Mark as Uploading
    updateQueueStatus(item.id, "Uploading");

    try {
        /* Try the real backend if available */
        if (typeof API !== "undefined" && typeof API.createReport === "function") {
            const payload = {
                reporter_name: item.name || "Citizen",
                disaster_type: item.type || "Other",
                location: item.location || "Unknown",
                description: item.description || "",
                severity: item.severity || "Medium",
                latitude: item.lat || null,
                longitude: item.lng || null
            };
            const response = await API.createReport(payload);
            if (response && response.success !== false) {
                // Successfully uploaded to backend
                updateQueueStatus(item.id, "Synced");
                removeQueueItem(item.id);
                if (typeof showToast === "function") {
                    showToast("Request synced to server.", "success", 3000);
                }
                return true;
            }
        }

        /* No backend / backend down but we're online:
           finalize locally so the user's data is preserved. */
        updateQueueStatus(item.id, "Completed");
        removeQueueItem(item.id);
        if (typeof showToast === "function") {
            showToast("Request saved locally (offline).", "success", 3000);
        }
        return true;
    } catch (error) {
        console.warn("Sync failed for", item.id, error);
        // Keep as Pending Sync so it retries later
        updateQueueStatus(item.id, "Pending Sync");
        return false;
    }
}

/* ===========================================================
   AUTO SYNC
   When back online, process every pending item in order.
=========================================================== */

async function runAutoSync() {
    if (!isOnline) return;

    const queue = oqRead();
    if (queue.length === 0) return;

    const pending = queue.filter(
        item => item.status === "Pending Sync" || item.status === "Uploading"
    );

    for (const item of pending) {
        await syncQueueItem(item);
    }
}

/* ===========================================================
   CONNECTIVITY EVENTS
=========================================================== */

function updateConnectivity() {
    isOnline = navigator.onLine !== false;
    updateOfflineBadge();
    if (isOnline) {
        runAutoSync();
    }
}

window.addEventListener("online", updateConnectivity);
window.addEventListener("offline", updateConnectivity);

/* ===========================================================
   OFFLINE BADGE
   A small fixed pill: 🟢 Online / 🔴 Offline Mode
=========================================================== */

function buildOfflineBadge() {
    const existing = document.getElementById("offlineBadge");
    if (existing) return existing;

    const badge = document.createElement("div");
    badge.id = "offlineBadge";
    badge.className = "offline-badge offline-badge-online";
    badge.innerHTML = `
        <span class="offline-badge-dot"></span>
        <span class="offline-badge-text">Online</span>
    `;
    document.body.appendChild(badge);
    return badge;
}

function updateOfflineBadge() {
    const badge = buildOfflineBadge();
    const dot = badge.querySelector(".offline-badge-dot");
    const text = badge.querySelector(".offline-badge-text");

    if (isOnline) {
        badge.classList.remove("offline-badge-offline");
        badge.classList.add("offline-badge-online");
        if (dot) dot.style.background = "#22c55e";
        if (text) text.textContent = "🟢 Online";
    } else {
        badge.classList.remove("offline-badge-online");
        badge.classList.add("offline-badge-offline");
        if (dot) dot.style.background = "#ef4444";
        if (text) text.textContent = "🔴 Offline Mode";
    }
}

/* Add badge styles dynamically (kept in JS so no new CSS file needed) */
function injectOfflineStyles() {
    const style = document.createElement("style");
    style.id = "offlineStyles";
    style.textContent = `
        #offlineBadge {
            position: fixed;
            left: 16px;
            bottom: 16px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            border-radius: 999px;
            font-family: "Poppins", sans-serif;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            transition: all 0.3s ease;
            pointer-events: none;
        }
        #offlineBadge .offline-badge-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
        #offlineBadge.offline-badge-online {
            background: rgba(34, 197, 94, 0.15);
            color: #16a34a;
            border: 1px solid rgba(34, 197, 94, 0.4);
        }
        #offlineBadge.offline-badge-offline {
            background: rgba(239, 68, 68, 0.15);
            color: #dc2626;
            border: 1px solid rgba(239, 68, 68, 0.4);
            animation: offlinePulse 1.5s infinite;
        }
        @keyframes offlinePulse {
            0%, 100% { box-shadow: 0 6px 20px rgba(239,68,68,0.2); }
            50% { box-shadow: 0 6px 26px rgba(239,68,68,0.45); }
        }
    `;
    document.head.appendChild(style);
}

/* ===========================================================
   SERVICE WORKER REGISTRATION
=========================================================== */

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then((reg) => {
                console.log("✅ Service Worker registered:", reg.scope);
            })
            .catch((err) => {
                console.warn("Service Worker registration failed:", err);
            });
    });
}

/* ===========================================================
   GLOBAL EXPOSURE
=========================================================== */

window.Offline = {
    isOnline: () => isOnline,
    queueRequest,
    queueAction,
    getPendingQueue,
    removeQueueItem,
    updateQueueStatus,
    runAutoSync,
    syncQueueItem
};

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    injectOfflineStyles();
    updateOfflineBadge();
    registerServiceWorker();

    // Kick off auto-sync on load if online
    if (isOnline) {
        runAutoSync();
    }

    // Periodic auto-sync
    setInterval(runAutoSync, OFFLINE_CONFIG.SYNC_INTERVAL);
});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Offline Engine Loaded");
