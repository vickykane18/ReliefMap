/* ===========================================================
   ReliefMap
   Auth Guard & Session Helpers
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   SESSION HELPERS
=========================================================== */

function getSession() {
    try {
        const raw = localStorage.getItem(STORAGE.USER);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setSession(data) {
    localStorage.setItem(STORAGE.USER, JSON.stringify(data));
}

function clearSession() {
    localStorage.removeItem(STORAGE.USER);
}

function isLoggedIn() {
    const session = getSession();
    return !!(session && session.token && session.user);
}

function getUserRole() {
    const session = getSession();
    return session && session.user ? session.user.role : null;
}

/* ===========================================================
   AUTH GUARD — redirect to login if not authenticated
=========================================================== */

function requireAuth(role) {

    if (isLoggedIn()) {

        // If a specific role is required, check it
        if (role && getUserRole() !== role) {

            location.href = "index.html";

        }

        return true;

    }

    // Not logged in → send to login page
    location.href = "login.html";

    return false;

}

/* ===========================================================
   LOGOUT
=========================================================== */

async function logout() {

    const session = getSession();

    if (session && session.token) {

        try {

            if (typeof API !== "undefined") {

                await API.logout(session.token);

            }

        } catch (e) {

            console.warn(e);

        }

    }

    clearSession();

    location.href = "login.html";

}

/* ===========================================================
   GENERIC AUTH HEADER
=========================================================== */

function authHeaders() {

    const session = getSession();

    return session && session.token
        ? { "Authorization": `Bearer ${session.token}` }
        : {};

}

/* ===========================================================
   END
=========================================================== */

console.log("✅ Auth Module Loaded");
