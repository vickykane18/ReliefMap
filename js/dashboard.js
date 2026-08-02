/* ===========================================================
   ReliefMap
   Dashboard Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   DASHBOARD ELEMENTS
=========================================================== */

const hospitalElement = document.getElementById("hospitals");

const foodElement = document.getElementById("food");

const shelterElement = document.getElementById("shelters");

const volunteerElement = document.getElementById("volunteers");

/* ===========================================================
   ANIMATE COUNTER
=========================================================== */

function animateCounter(element, target) {

    if (!element) return;

    let current = 0;

    const increment = Math.ceil(target / 80);

    const timer = setInterval(() => {

        current += increment;

        if (current >= target) {

            current = target;

            clearInterval(timer);

        }

        element.textContent = formatNumber(current);

    }, 20);

}

/* ===========================================================
   LOAD DASHBOARD
=========================================================== */

async function loadDashboard() {

    showLoader();

    try {

        const response = await API.getStats();

        if (!response || !response.data) {

            throw new Error("No Dashboard Data");

        }

        const stats = response.data;

        animateCounter(

            hospitalElement,

            stats.Hospitals || 0

        );

        animateCounter(

            foodElement,

            stats["Food Centers"] || 0

        );

        animateCounter(

            shelterElement,

            stats.Shelters || 0

        );

        animateCounter(

            volunteerElement,

            stats.Volunteers || 0

        );

        updateDashboardTime();

       

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to load dashboard",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}

/* ===========================================================
   UPDATE LAST REFRESH
=========================================================== */

function updateDashboardTime() {

    const element = document.getElementById(

        "lastUpdated"

    );

    if (!element) return;

    element.textContent =

        formatTime(new Date());

}

/* ===========================================================
   REFRESH BUTTON
=========================================================== */

/* ===========================================================
   REFRESH BUTTON
=========================================================== */

const dashboardRefreshButton =
    document.getElementById("refreshMap");

if (dashboardRefreshButton) {

    dashboardRefreshButton.addEventListener(
        "click",
        loadDashboard
    );

}

/* ===========================================================
   DASHBOARD CARDS HOVER
=========================================================== */

document.querySelectorAll(

    ".dashboard-cards .card"

).forEach(card => {

    card.addEventListener(

        "mouseenter",

        () => {

            card.style.transform =

                "translateY(-10px) scale(1.03)";

        }

    );

    card.addEventListener(

        "mouseleave",

        () => {

            card.style.transform =

                "";

        }

    );

});

/* ===========================================================
   QUICK ACTION BUTTONS
=========================================================== */

document.querySelectorAll(

    ".action-card"

).forEach(card => {

    card.addEventListener(

        "click",

        () => {

            const title =

                card.querySelector("h3")?.textContent ||

                "Action";

            showToast(

                `${title} selected`,

                "info"

            );

        }

    );

});

/* ===========================================================
   AUTO REFRESH
=========================================================== */

function startDashboardRefresh() {

    if (!CONFIG.AUTO_REFRESH) return;

    setInterval(() => {

        loadDashboard();

    }, CONFIG.REFRESH_INTERVAL);

}

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadDashboard();

        startDashboardRefresh();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Dashboard Loaded");