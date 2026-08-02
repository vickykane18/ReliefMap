/* ===========================================================
   ReliefMap
   Main Application
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   APPLICATION
=========================================================== */

const ReliefMapApp = {

    initialized: false,

    version: "1.0.0"

};

/* ===========================================================
   INITIALIZE APPLICATION
=========================================================== */

async function initializeApplication() {

    try {

        showLoader();

        console.log("🚀 Starting ReliefMap...");

        await initializeModules();

        initializeEvents();

        initializeAnimations();

        ReliefMapApp.initialized = true;

        hideLoader();

        showToast(

            "ReliefMap Ready",

            "success"

        );

        console.log("✅ ReliefMap Started");

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showToast(

            "Application Failed To Start",

            "error"

        );

    }

}

/* ===========================================================
   LOAD MODULES
=========================================================== */

async function initializeModules() {

    if (typeof loadDashboard === "function") {

        await loadDashboard();

    }

    if (typeof initializeMap === "function") {

        initializeMap();

    }

  if (typeof window.loadMap === "function") {
    window.loadMap();
}

    if (typeof initializeCharts === "function") {

        await initializeCharts();

    }

    if (typeof loadNews === "function") {

        await loadNews();

    }

    if (typeof loadAIInsights === "function") {

        await loadAIInsights();

    }

    if (typeof refreshProfile === "function") {

        refreshProfile();

    }

    if (typeof loadSettings === "function") {

        loadSettings();

    }

}

/* ===========================================================
   GLOBAL EVENTS
=========================================================== */

function initializeEvents() {

    window.addEventListener(

        "resize",

        debounce(() => {

            if (typeof resizeMap === "function") {

                resizeMap();

            }

        }, 200)

    );

    document.addEventListener(

        "keydown",

        event => {

            if (event.key === "Escape") {

                document

                    .querySelectorAll(".modal.active")

                    .forEach(modal => {

                        modal.classList.remove("active");

                    });

            }

        }

    );

}

/* ===========================================================
   PAGE ANIMATIONS
=========================================================== */

function initializeAnimations() {

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(

                        "visible"

                    );

                }

            });

        },

        {

            threshold: 0.15

        }

    );

    document

        .querySelectorAll(

            "section,.card,.chart-card,.news-card,.profile-card"

        )

        .forEach(item => {

            observer.observe(item);

        });

}

/* ===========================================================
   SIDEBAR TOGGLE
=========================================================== */

const sidebarToggle =

document.getElementById(

    "sidebarToggle"

);

if (sidebarToggle) {

    sidebarToggle.addEventListener(

        "click",

        () => {

            document

                .querySelector(".sidebar")

                ?.classList.toggle("collapsed");

        }

    );

}

/* ===========================================================
   MOBILE MENU
=========================================================== */

const mobileMenu =

document.getElementById(

    "mobileMenu"

);

if (mobileMenu) {

    mobileMenu.addEventListener(

        "click",

        () => {

            document

                .querySelector(".sidebar")

                ?.classList.toggle("mobile-open");

        }

    );

}

/* ===========================================================
   SMOOTH SCROLL
=========================================================== */

document

.querySelectorAll('a[href^="#"]')

.forEach(link => {

    link.addEventListener(

        "click",

        event => {

            event.preventDefault();

            const target =

            document.querySelector(

                link.getAttribute("href")

            );

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth"

                });

            }

        }

    );

});

/* ===========================================================
   CONNECTION STATUS
=========================================================== */

window.addEventListener(

    "online",

    () => {

        showToast(

            "Connection Restored",

            "success"

        );

    }

);

window.addEventListener(

    "offline",

    () => {

        showToast(

            "No Internet Connection",

            "warning"

        );

    }

);

/* ===========================================================
   LOADER
=========================================================== */

window.addEventListener(

    "load",

    () => {

        hideLoader();

    }

);

/* ===========================================================
   APPLICATION START
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initializeApplication();

    }

);

/* ===========================================================
   DEBUG
=========================================================== */

console.table({

    Project: "ReliefMap",

    Version: ReliefMapApp.version,

    Status: "Running",

    Backend: CONFIG.API_BASE_URL

});

/* ===========================================================
   END
=========================================================== */

console.log("🌍 ReliefMap Fully Loaded");