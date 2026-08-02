/* ===========================================================
   ReliefMap
   Utility Functions
   Author : Vigneshan S
   Version : 2.0
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   DOM HELPERS
=========================================================== */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

/* ===========================================================
   APPLICATION
=========================================================== */

const Utils = {

    version: "2.0.0",

    initialized: false

};

/* ===========================================================
   LOADER
=========================================================== */

function showLoader() {

    const loader = $("#loader");

    if (!loader) return;

    loader.style.display = "flex";

    loader.style.opacity = "1";

}

function hideLoader() {

    const loader = $("#loader");

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.style.display = "none";

    }, 250);

}

/* ===========================================================
   TOAST
=========================================================== */

function showToast(message, type = "info", duration = 3500) {

    const container = $("#toastContainer");

    if (!container) return;

    if (container.children.length >= 4) {

        container.removeChild(container.firstElementChild);

    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    let icon = "fa-circle-info";

    switch (type) {

        case "success":
            icon = "fa-circle-check";
            break;

        case "warning":
            icon = "fa-triangle-exclamation";
            break;

        case "error":
            icon = "fa-circle-xmark";
            break;

    }

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>

        <div class="toast-content">

            <strong>${type.toUpperCase()}</strong>

            <span>${message}</span>

        </div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, duration);

}

/* ===========================================================
   MODAL
=========================================================== */

function openModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

}

function closeModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";

}

/* ===========================================================
   LOCAL STORAGE
=========================================================== */

function saveStorage(key, value) {

    try {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    }

    catch (error) {

        console.error(error);

    }

}

function loadStorage(key, defaultValue = null) {

    try {

        const value = localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : defaultValue;

    }

    catch (error) {

        return defaultValue;

    }

}

function removeStorage(key) {

    localStorage.removeItem(key);

}

/* ===========================================================
   SESSION STORAGE
=========================================================== */

function saveSession(key, value) {

    sessionStorage.setItem(

        key,

        JSON.stringify(value)

    );

}

function loadSession(key) {

    const value = sessionStorage.getItem(key);

    return value
        ? JSON.parse(value)
        : null;

}

/* ===========================================================
   THEME
=========================================================== */

function setTheme(theme) {

    document.body.classList.remove(

        "light",

        "dark"

    );

    document.body.classList.add(theme);

    saveStorage(

        STORAGE.THEME,

        theme

    );

}

function loadTheme() {

    const theme = loadStorage(

        STORAGE.THEME,

        "light"

    );

    setTheme(theme);

}

/* ===========================================================
   FORMATTERS
=========================================================== */

function formatNumber(number = 0) {

    return Number(number)

        .toLocaleString("en-IN");

}

function formatCurrency(amount = 0) {

    return "₹" +

        Number(amount)

            .toLocaleString("en-IN");

}

function formatDate(date) {

    return new Date(date)

        .toLocaleDateString(

            "en-IN",

            {

                year: "numeric",

                month: "short",

                day: "numeric"

            }

        );

}

function formatTime(date) {

    return new Date(date)

        .toLocaleTimeString(

            "en-IN"

        );

}

function formatDateTime(date) {

    return (

        formatDate(date)

        +

        " "

        +

        formatTime(date)

    );

}

/* ===========================================================
   RANDOM ID
=========================================================== */

function randomID() {

    if (window.crypto?.randomUUID) {

        return crypto.randomUUID();

    }

    return (

        Date.now().toString(36)

        +

        Math.random()

            .toString(36)

            .substring(2, 8)

    );

}

/* ===========================================================
   COPY TEXT
=========================================================== */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

        showToast(

            "Copied Successfully",

            "success"

        );

    }

    catch {

        showToast(

            "Unable To Copy",

            "error"

        );

    }

}
/* ===========================================================
   SCROLL TO TOP
=========================================================== */

function scrollTopPage() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ===========================================================
   SMOOTH SCROLL
=========================================================== */

function smoothScroll(target) {

    const element = document.querySelector(target);

    if (!element) return;

    element.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

/* ===========================================================
   DEBOUNCE
=========================================================== */

function debounce(callback, delay = 300) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

/* ===========================================================
   THROTTLE
=========================================================== */

function throttle(callback, limit = 200) {

    let waiting = false;

    return (...args) => {

        if (waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, limit);

    };

}

/* ===========================================================
   REVEAL ANIMATION
=========================================================== */

function revealElements() {

    const elements = $$(
        ".fade-up,.fade-left,.fade-right,.fade-in"
    );

    const trigger = window.innerHeight * 0.85;

    elements.forEach(element => {

        const top = element.getBoundingClientRect().top;

        if (top < trigger) {

            element.classList.add("visible");

        }

    });

}

window.addEventListener(

    "scroll",

    throttle(revealElements, 100)

);

/* ===========================================================
   FADE IN
=========================================================== */

function fadeIn(element) {

    if (!element) return;

    element.style.opacity = 0;

    element.style.display = "block";

    let opacity = 0;

    const animation = setInterval(() => {

        opacity += 0.05;

        element.style.opacity = opacity;

        if (opacity >= 1) {

            clearInterval(animation);

        }

    }, 16);

}

/* ===========================================================
   FADE OUT
=========================================================== */

function fadeOut(element) {

    if (!element) return;

    let opacity = 1;

    const animation = setInterval(() => {

        opacity -= 0.05;

        element.style.opacity = opacity;

        if (opacity <= 0) {

            clearInterval(animation);

            element.style.display = "none";

        }

    }, 16);

}

/* ===========================================================
   NETWORK STATUS
=========================================================== */

function updateConnectionStatus() {

    if (navigator.onLine) {

        showToast(

            "Internet Connected",

            "success",

            2000

        );

    }

    else {

        showToast(

            "Internet Disconnected",

            "warning",

            3000

        );

    }

}

window.addEventListener(

    "online",

    updateConnectionStatus

);

window.addEventListener(

    "offline",

    updateConnectionStatus

);

/* ===========================================================
   URL PARAMETERS
=========================================================== */

function getQuery(name) {

    const params = new URLSearchParams(

        window.location.search

    );

    return params.get(name);

}

/* ===========================================================
   VALIDATION
=========================================================== */

function isEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(email);

}

function isPhone(number) {

    return /^[6-9]\d{9}$/

        .test(number);

}

/* ===========================================================
   EMPTY CHECK
=========================================================== */

function isEmpty(value) {

    return (

        value === null ||

        value === undefined ||

        value === ""

    );

}

/* ===========================================================
   DELAY
=========================================================== */

function sleep(milliseconds) {

    return new Promise(resolve => {

        setTimeout(resolve, milliseconds);

    });

}

/* ===========================================================
   ELEMENT VISIBILITY
=========================================================== */

function isVisible(element) {

    if (!element) return false;

    const rect = element.getBoundingClientRect();

    return (

        rect.top >= 0 &&

        rect.bottom <=

        window.innerHeight

    );

}

/* ===========================================================
   DOWNLOAD JSON
=========================================================== */

function downloadJSON(data, filename = "data.json") {

    const blob = new Blob(

        [

            JSON.stringify(

                data,

                null,

                4

            )

        ],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

}

/* ===========================================================
   PAGE TITLE
=========================================================== */

function setTitle(title) {

    document.title =

        title +

        " | ReliefMap";

}

/* ===========================================================
   UUID
=========================================================== */

function generateUUID() {

    return crypto.randomUUID
        ? crypto.randomUUID()
        : randomID();

}

/* ===========================================================
   WINDOW LOAD
=========================================================== */

window.addEventListener(

    "load",

    () => {

        revealElements();

        hideLoader();

    }

);
/* ===========================================================
   KEYBOARD SHORTCUTS
=========================================================== */

document.addEventListener("keydown", (event) => {

    // ESC closes all modals
    if (event.key === "Escape") {

        $$(".modal.active").forEach(modal => {

            modal.classList.remove("active");

        });

    }

    // CTRL + SHIFT + HOME -> Scroll to top
    if (event.ctrlKey && event.shiftKey && event.key === "Home") {

        scrollTopPage();

    }

});

/* ===========================================================
   PAGE VISIBILITY
=========================================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (document.hidden) {

            console.log("📴 Page Hidden");

        }

        else {

            console.log("📱 Page Active");

        }

    }

);

/* ===========================================================
   AUTO SAVE
=========================================================== */

function autoSave(key, value) {

    try {

        saveStorage(key, value);

    }

    catch (error) {

        console.error(error);

    }

}

/* ===========================================================
   CLEAR STORAGE
=========================================================== */

function clearStorage() {

    localStorage.clear();

}

/* ===========================================================
   DARK MODE
=========================================================== */

function toggleTheme() {

    const dark = document.body.classList.contains("dark");

    if (dark) {

        setTheme("light");

    }

    else {

        setTheme("dark");

    }

}

/* ===========================================================
   PERFORMANCE TIMER
=========================================================== */

function startTimer(name = "Timer") {

    console.time(name);

}

function stopTimer(name = "Timer") {

    console.timeEnd(name);

}

/* ===========================================================
   LOGGING
=========================================================== */

function log(message) {

    console.log(

        `%c${message}`,

        "color:#2563eb;font-weight:bold;"

    );

}

function warn(message) {

    console.warn(message);

}

function error(message) {

    console.error(message);

}

/* ===========================================================
   VERSION
=========================================================== */

function version() {

    return Utils.version;

}

/* ===========================================================
   DEVICE
=========================================================== */

function isMobile() {

    return window.innerWidth < 768;

}

function isTablet() {

    return window.innerWidth >= 768 &&

           window.innerWidth < 1024;

}

function isDesktop() {

    return window.innerWidth >= 1024;

}

/* ===========================================================
   CONNECTION
=========================================================== */

function connectionStatus() {

    return navigator.onLine

        ? "Online"

        : "Offline";

}

/* ===========================================================
   PAGE RELOAD
=========================================================== */

function reloadPage() {

    location.reload();

}

/* ===========================================================
   GO BACK
=========================================================== */

function goBack() {

    history.back();

}

/* ===========================================================
   GO HOME
=========================================================== */

function goHome() {

    location.href = "index.html";

}

/* ===========================================================
   EXPORT
=========================================================== */

window.Utils = {

    $,
    $$,

    showLoader,
    hideLoader,

    showToast,

    openModal,
    closeModal,

    saveStorage,
    loadStorage,
    removeStorage,

    saveSession,
    loadSession,

    setTheme,
    loadTheme,
    toggleTheme,

    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,

    randomID,
    generateUUID,

    debounce,
    throttle,

    revealElements,

    scrollTopPage,
    smoothScroll,

    fadeIn,
    fadeOut,

    copyText,

    downloadJSON,

    isEmail,
    isPhone,
    isEmpty,

    sleep,

    setTitle,

    log,
    warn,
    error,

    version,

    isMobile,
    isTablet,
    isDesktop,

    connectionStatus,

    reloadPage,
    goBack,
    goHome,

    autoSave,
    clearStorage

};

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadTheme();

        revealElements();

        hideLoader();

        Utils.initialized = true;

        console.table({

            Project: "ReliefMap",

            Version: Utils.version,

            Status: "Ready",

            Theme: document.body.className,

            Device: isMobile()
                ? "Mobile"
                : isTablet()
                ? "Tablet"
                : "Desktop",

            Connection: connectionStatus()

        });

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Utility Functions Loaded Successfully");