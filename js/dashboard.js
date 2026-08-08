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

        let stats = {
            Hospitals: 12,
            "Food Centers": 8,
            Shelters: 6,
            Volunteers: 315
        };

        if (
            typeof API !== "undefined" &&
            typeof API.getStats === "function"
        ) {

            const response = await API.getStats();

            if (response && response.success && response.data) {

                stats = response.data;

            }

        }

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

        loadAIInsights();

    }

    catch (error) {

        console.error(error);

        console.warn("Using demo dashboard data.");

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
   LOAD AI INSIGHTS (live data)
=========================================================== */

async function loadAIInsights() {

    try {

        if (
            typeof API !== "undefined" &&
            typeof API.getAIInsights === "function"
        ) {

            const response = await API.getAIInsights();

            if (response && response.success && response.data) {

                updateAIInsights(response.data);

            }

        }

    }

    catch (error) {

        console.warn("AI insights unavailable:", error);

    }

}

/* ===========================================================
   UPDATE AI CARDS WITH LIVE DATA
=========================================================== */

function updateAIInsights(data) {

    const disaster = data.disaster || {};

    const resources = data.resources || {};

    const volunteers = data.volunteers || {};

    /* Flood prediction → disaster risk score */
    const floodCard = document.querySelector(".ai-grid .ai-card:nth-child(1) h1");

    if (floodCard) {

        floodCard.textContent = `${disaster.risk_score || 92}%`;

    }

    const floodDesc = document.querySelector(".ai-grid .ai-card:nth-child(1) p");

    if (floodDesc) {

        floodDesc.textContent =
            `Risk level: ${disaster.risk_level || "High"} — live from system analytics.`;

    }

    /* Volunteers */
    const volCard = document.querySelector(".ai-grid .ai-card:nth-child(2) h1");

    if (volCard) {

        volCard.textContent = formatNumber(volunteers.total_volunteers || 128);

    }

    const volDesc = document.querySelector(".ai-grid .ai-card:nth-child(2) p");

    if (volDesc) {

        volDesc.textContent = volunteers.recommendation || "Current volunteer availability.";

    }

    /* Food requirement → resource forecast */
    const foodCard = document.querySelector(".ai-grid .ai-card:nth-child(3) h1");

    if (foodCard) {

        foodCard.textContent = formatNumber(resources.available_resources || 4250);

    }

    const foodDesc = document.querySelector(".ai-grid .ai-card:nth-child(3) p");

    if (foodDesc) {

        foodDesc.textContent = `Forecast: ${resources.forecast || "High Demand"}.`;

    }

    /* Shelter capacity → pending reports */
    const shelterCard = document.querySelector(".ai-grid .ai-card:nth-child(4) h1");

    if (shelterCard) {

        shelterCard.textContent = `${data.pending_reports || 0} Rx`;

    }

    const shelterDesc = document.querySelector(".ai-grid .ai-card:nth-child(4) p");

    if (shelterDesc) {

        shelterDesc.textContent =
            `Pending reports: ${data.pending_reports || 0}. Active missions: ${data.active_missions || 0}.`;

    }

}

/* ===========================================================
   INFO PANEL — LIVE DATE & TIME
=========================================================== */

function updateInfoDateTime() {

    const element = document.getElementById("infoDateTime");

    if (!element) return;

    const now = new Date();

    element.textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        }) +
        " • " +
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

}

/* ===========================================================
   INFO PANEL — LIVE WEATHER (Open-Meteo, Chennai)
=========================================================== */

async function loadInfoWeather() {

    const element = document.getElementById("infoWeather");

    if (!element) return;

    try {

        const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current_weather=true"
        );

        if (!response.ok) throw new Error("Weather fetch failed");

        const data = await response.json();

        const current = data.current_weather || {};

        if (typeof current.temperature === "number") {

            element.textContent =
                Math.round(current.temperature) + "° " +
                (current.weathercode ? decodeWeather(current.weathercode) : "");

        }

    }

    catch (error) {

        console.warn("Live weather unavailable:", error);

    }

}

/* Map WMO weather codes to short labels */
function decodeWeather(code) {

    const map = {
        0: "Clear",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",
        80: "Light Showers",
        81: "Showers",
        82: "Heavy Showers",
        95: "Thunderstorm"
    };

    return map[code] || "Cloudy";

}

/* ===========================================================
   INFO PANEL — SYSTEM STATUS
=========================================================== */

function updateInfoSystemStatus() {

    const element = document.getElementById("infoSystemStatus");

    if (!element) return;

    const dot = element.closest(".info-item")?.querySelector(".info-dot");

    const online =
        typeof backendOnline !== "undefined" && backendOnline;

    element.textContent = online ? "Online" : "Demo Mode";

    if (dot) {

        dot.style.background = online ? "#16a34a" : "#f59e0b";

    }

}

/* ===========================================================
   INITIALIZE INFO PANEL
=========================================================== */

function initInfoPanel() {

    updateInfoDateTime();

    updateInfoSystemStatus();

    loadInfoWeather();

    setInterval(updateInfoDateTime, 1000);

}

/* ===========================================================
   ============================================================
   MULTI-ROLE DASHBOARD (Citizen / NGO / Volunteer)
   ============================================================
   ============================================================ */

function rdGetRole() {
    if (typeof rGetRole === "function") return rGetRole();
    try {
        const raw = localStorage.getItem("relief_user");
        if (!raw) return "Citizen";
        const s = JSON.parse(raw);
        return (s && s.user && s.user.role) || "Citizen";
    } catch (e) { return "Citizen"; }
}

function rdGetName() {
    try {
        const raw = localStorage.getItem("relief_user");
        if (!raw) return "Guest";
        const s = JSON.parse(raw);
        return (s && s.user && (s.user.username || s.user.name)) || "Guest";
    } catch (e) { return "Guest"; }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    /* Update the URL hash so the sidebar highlights the matching
       menu item (e.g. My Requests, Offer Help, Donate). */
    if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
    } else {
        window.location.hash = id;
    }
    highlightActiveSidebar(id);
}

/* Highlight the matching sidebar menu item for a given section id */
function highlightActiveSidebar(id) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const links = sidebar.querySelectorAll(".menu li a");
    links.forEach((link) => {
        const li = link.closest("li");
        if (li) li.classList.remove("active");
        const itemHash = link.getAttribute("href").includes("#")
            ? "#" + link.getAttribute("href").split("#")[1]
            : "";
        if (itemHash === "#" + id && li) {
            li.classList.add("active");
        }
    });
}

/* Role badge next to greeting */
function roleBadgeHTML(role) {
    const icons = {
        Citizen: "fa-user-group",
        NGO: "fa-truck-medical",
        Volunteer: "fa-handshake-angle",
        Administrator: "fa-user-shield"
    };
    return `<span class="role-badge"><i class="fa-solid ${icons[role] || "fa-user"}"></i> ${role}</span>`;
}

/* ===========================================================
   STATUS STEPPER (visual workflow tracker)
=========================================================== */

function renderStepper(status) {
    const steps = ["Pending", "Verified", "NGO Accepted", "Volunteer Assigned", "Completed"];
    const statusMap = {
        "Pending": 0,
        "Verified": 1,
        "NGO Accepted": 2,
        "Volunteer Assigned": 3,
        "Completed": 4
    };
    const current = statusMap[status] !== undefined ? statusMap[status] : 0;
    return `<div class="stepper">${steps.map((s, i) => `
        <div class="step ${i < current ? "done" : (i === current ? "active" : "")}">
            <div class="dot">${i < current ? "✓" : (i + 1)}</div>
            <div class="lbl">${s}</div>
        </div>`).join("")}</div>`;
}

function statusClass(status) {
    const map = {
        "Pending": "pending",
        "Verified": "verified",
        "NGO Accepted": "accepted",
        "Volunteer Assigned": "accepted",
        "Completed": "completed"
    };
    return map[status] || "pending";
}

/* ===========================================================
   RENDER CITIZEN DASHBOARD
=========================================================== */

function renderCitizenDashboard() {

    const hub = document.getElementById("citizenHub");
    if (!hub) return;
    hub.style.display = "block";

    const name = rdGetName();
    const greet = document.getElementById("citizenGreeting");
    if (greet) greet.innerHTML = `Welcome, <span id="citizenName">${name}</span> ${roleBadgeHTML("Citizen")}`;

    const requests = (typeof rsRead === "function" ? rsRead("relief_requests", []) : []);
    const offers = (typeof rsRead === "function" ? rsRead("relief_offers", []) : []);
    const notifs = (typeof rsRead === "function" ? rsRead("relief_notifs", []) : []);

    const active = requests.filter(r => r.status !== "Completed");
    const resolved = requests.filter(r => r.status === "Completed");

    setCount("citReqCount", active.length);
    setCount("citResolvedCount", resolved.length);
    setCount("citOfferCount", offers.length);
    setCount("citNotifCount", notifs.length);

    /* Render tracked requests */
    const trackGrid = document.getElementById("citizenTrackGrid");
    if (trackGrid) {
        if (requests.length === 0) {
            trackGrid.innerHTML = `<div class="glass-card">No requests yet. Submit your first request above.</div>`;
        } else {
            trackGrid.innerHTML = requests.map(r => `
                <div class="request-card">
                    <div class="req-media">
                        ${r.image ? `<img src="${r.image}" alt="request">` : `<div class="req-badge">${r.type}</div>`}
                        <span class="req-type">${r.urgency}</span>
                    </div>
                    <div class="req-body">
                        <h3>${r.type} — ${r.id}</h3>
                        <p>${r.description || "No description"}</p>
                        <div class="req-meta">
                            <span><i class="fa-solid fa-location-dot"></i> ${r.location}</span>
                            <span class="status-pill ${statusClass(r.status)}">${r.status}</span>
                        </div>
                        ${renderStepper(r.status)}
                        <div class="req-actions">
                            <button class="btn-sm danger" onclick="deleteMyRequest('${r.id}', this)"><i class="fa-solid fa-trash"></i> Cancel</button>
                        </div>
                    </div>
                </div>`).join("");
        }
    }

    /* Render offer list */
    const offerList = document.getElementById("citizenOfferList");
    if (offerList) {
        offerList.innerHTML = offers.map(o => `
            <div class="request-card">
                <div class="req-body">
                    <h3><i class="fa-solid fa-hand-holding-heart"></i> ${o.kind} Offer</h3>
                    <p>${o.qty} — by ${o.by}</p>
                    <div class="req-meta"><span class="status-pill pending">${o.status}</span></div>
                </div>
            </div>`).join("");
    }

    /* Render notifications */
    const notifList = document.getElementById("citizenNotifList");
    if (notifList) {
        notifList.innerHTML = notifs.map(n => `
            <div class="notif">
                <i class="fa-solid fa-circle-info"></i>
                <div class="n-text">${n.text}</div>
                <div class="n-time">${n.time}</div>
            </div>`).join("");
    }

}

/* ===========================================================
   RENDER NGO DASHBOARD
=========================================================== */

function renderNgoDashboard() {

    const hub = document.getElementById("ngoHub");
    if (!hub) return;
    hub.style.display = "block";

    const name = rdGetName();
    const greet = document.getElementById("ngoGreeting");
    if (greet) greet.innerHTML = `NGO Command Center — ${name} ${roleBadgeHTML("NGO")}`;

    const requests = (typeof rsRead === "function" ? rsRead("relief_requests", []) : []);
    const missions = (typeof rsRead === "function" ? rsRead("relief_missions", []) : []);
    const notifs = (typeof rsRead === "function" ? rsRead("relief_notifs", []) : []);

    const pending = requests.filter(r => r.status === "Pending" || r.status === "Verified");
    const activeMissions = missions.filter(m => m.status !== "Completed");

    setCount("ngoPendingCount", pending.length);
    setCount("ngoMissionCount", activeMissions.length);
    setCount("ngoVolCount", 12);
    setCount("ngoResourceLevel", 68);

    /* Render incoming requests with NGO actions */
    const grid = document.getElementById("ngoRequestGrid");
    if (grid) {
        if (requests.length === 0) {
            grid.innerHTML = `<div class="glass-card">No incoming requests right now.</div>`;
        } else {
            grid.innerHTML = requests.map(r => `
                <div class="request-card">
                    <div class="req-media">
                        ${r.image ? `<img src="${r.image}" alt="request">` : `<div class="req-badge">${r.type}</div>`}
                        <span class="req-type">${r.urgency}</span>
                    </div>
                    <div class="req-body">
                        <h3>${r.type} — ${r.id}</h3>
                        <p>${r.description}</p>
                        <div class="req-meta">
                            <span><i class="fa-solid fa-location-dot"></i> ${r.location}</span>
                            <span><i class="fa-solid fa-user"></i> ${r.reporter}</span>
                        </div>
                        <div class="req-meta"><span class="status-pill ${statusClass(r.status)}">${r.status}</span></div>
                        ${r.status === "Pending" || r.status === "Verified"
                            ? `<div class="req-actions">
                                <button class="btn-sm success" onclick="ngoVerify('${r.id}', this)"><i class="fa-solid fa-check"></i> Verify</button>
                                <button class="btn-sm primary" onclick="ngoAccept('${r.id}', this)"><i class="fa-solid fa-check-double"></i> Accept</button>
                                <button class="btn-sm danger" onclick="ngoReject('${r.id}', this)"><i class="fa-solid fa-xmark"></i> Reject</button>
                            </div>`
                        : r.status === "NGO Accepted"
                            ? `<div class="req-actions">
                                <button class="btn-sm primary" onclick="ngoAssign('${r.id}', this)"><i class="fa-solid fa-user-plus"></i> Assign Volunteer</button>
                            </div>`
                            : r.status === "Volunteer Assigned"
                            ? `<div class="req-actions">
                                <button class="btn-sm outline" onclick="ngoCall('${r.id}', this)"><i class="fa-solid fa-phone"></i> Call</button>
                            </div>`
                            : `<div class="req-actions"><button class="btn-sm outline" disabled>Completed</button></div>`}
                    </div>
                </div>`).join("");
        }
    }

    /* Render volunteer pool */
    const volGrid = document.getElementById("ngoVolunteerGrid");
    if (volGrid) {
        const volunteers = [
            { name: "Arun Kumar", skill: "Rescue", status: "Ready" },
            { name: "Priya S", skill: "First Aid", status: "Ready" },
            { name: "Karthik R", skill: "Driving", status: "On Mission" },
            { name: "Sneha P", skill: "Medical", status: "Ready" }
        ];
        volGrid.innerHTML = volunteers.map(v => `
            <div class="request-card">
                <div class="req-body">
                    <h3><i class="fa-solid fa-user"></i> ${v.name}</h3>
                    <p>Skill: ${v.skill}</p>
                    <div class="req-meta"><span class="status-pill ${v.status === "Ready" ? "accepted" : "pending"}">${v.status}</span></div>
                </div>
            </div>`).join("");
    }

    /* Render operations feed */
    const notifList = document.getElementById("ngoNotifList");
    if (notifList) {
        notifList.innerHTML = notifs.map(n => `
            <div class="notif">
                <i class="fa-solid fa-tower-broadcast"></i>
                <div class="n-text">${n.text}</div>
                <div class="n-time">${n.time}</div>
            </div>`).join("");
    }

    /* Resource defaults */
    setText("resFood", "84%");
    setText("resWater", "91%");
    setText("resMedicine", "67%");
    setText("resFuel", "53%");
}

/* ===========================================================
   RENDER VOLUNTEER DASHBOARD
=========================================================== */

function renderVolunteerDashboard() {

    const hub = document.getElementById("volunteerHub");
    if (!hub) return;
    hub.style.display = "block";

    const name = rdGetName();
    const greet = document.getElementById("volGreeting");
    if (greet) greet.innerHTML = `Volunteer Dashboard — ${name} ${roleBadgeHTML("Volunteer")}`;

    const missions = (typeof rsRead === "function" ? rsRead("relief_missions", []) : []);
    const notifs = (typeof rsRead === "function" ? rsRead("relief_notifs", []) : []);

    const active = missions.filter(m => m.status !== "Completed");
    const done = missions.filter(m => m.status === "Completed");

    setCount("volActiveCount", active.length);
    setCount("volDoneCount", done.length);
    setCount("volHours", done.length * 2);
    setCount("volPoints", done.length * 50);

    /* Active missions */
    const missionGrid = document.getElementById("volMissionGrid");
    if (missionGrid) {
        if (active.length === 0) {
            missionGrid.innerHTML = `<div class="glass-card">No active missions. New assignments will appear here.</div>`;
        } else {
            missionGrid.innerHTML = active.map(m => `
                <div class="request-card">
                    <div class="req-body">
                        <h3>${m.title}</h3>
                        <div class="mission-loc"><i class="fa-solid fa-location-crosshairs"></i> ${m.location}</div>
                        <div class="req-meta"><span class="mission-state otw">${m.status}</span></div>
                        <div class="req-actions">
                            <button class="btn-sm outline" onclick="volLiveLocation('${m.id}', this)"><i class="fa-solid fa-location-crosshairs"></i> Share Location</button>
                            <label class="btn-sm primary" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer">
                                <i class="fa-solid fa-camera"></i> Photo
                                <input type="file" accept="image/*" hidden onchange="volPhoto('${m.id}', this)">
                            </label>
                            <button class="btn-sm success" onclick="volComplete('${m.id}', this)"><i class="fa-solid fa-circle-check"></i> Complete</button>
                        </div>
                        <div class="file-prev" id="photo_${m.id}" style="display:none;margin-top:12px"></div>
                    </div>
                </div>`).join("");
        }
    }

    /* History */
    const histGrid = document.getElementById("volHistoryGrid");
    if (histGrid) {
        if (done.length === 0) {
            histGrid.innerHTML = `<div class="glass-card">No completed missions yet.</div>`;
        } else {
            histGrid.innerHTML = done.map(m => `
                <div class="request-card">
                    <div class="req-body">
                        <h3>${m.title}</h3>
                        <div class="mission-loc"><i class="fa-solid fa-location-dot"></i> ${m.location}</div>
                        <div class="req-meta"><span class="status-pill completed">${m.status}</span></div>
                        ${m.photo ? `<img src="${m.photo}" alt="completion" style="width:100%;border-radius:12px;margin-top:10px;max-height:200px;object-fit:cover">` : ""}
                    </div>
                </div>`).join("");
        }
    }

    /* Team updates */
    const notifList = document.getElementById("volNotifList");
    if (notifList) {
        notifList.innerHTML = notifs.map(n => `
            <div class="notif">
                <i class="fa-solid fa-users"></i>
                <div class="n-text">${n.text}</div>
                <div class="n-time">${n.time}</div>
            </div>`).join("");
    }
}

/* ===========================================================
   HELPERS
=========================================================== */

function setCount(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* ===========================================================
   CITIZEN ACTIONS
=========================================================== */

/* Submit relief request */
function bindCitizenRequest() {
    const form = document.getElementById("citizenRequestForm");
    if (!form) return;
    form.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("reqName").value.trim() || rdGetName();
        const type = document.getElementById("reqType").value;
        const urgency = document.getElementById("reqUrgency").value;
        const location = document.getElementById("reqLocation").value.trim();
        const description = document.getElementById("reqDescription").value.trim();
        if (!location || !description) {
            showToast("Please fill location and description.", "error");
            return;
        }
        const gps = window.__reqGPS || null;
        const payload = { name, type, urgency, location, description, gps };
        if (typeof addCitizenRequest === "function") {
            addCitizenRequest(payload);
        }
        showToast("Request submitted! NGO will review it.", "success");
        form.reset();
        renderCitizenDashboard();
    });
}

/* File upload preview */
function bindCitizenFile() {
    const drop = document.getElementById("reqDropZone");
    const file = document.getElementById("reqFile");
    const prev = document.getElementById("reqFilePrev");
    if (!drop || !file) return;
    drop.addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
        const f = file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
            prev.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
            prev.style.display = "block";
        };
        reader.readAsDataURL(f);
    });
}

/* GPS */
function bindCitizenGPS() {
    const btn = document.getElementById("reqGPS");
    const status = document.getElementById("gpsStatus");
    if (!btn || !status) return;
    btn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            status.textContent = "GPS not supported";
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            window.__reqGPS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            status.textContent = "GPS shared ✓ (" + pos.coords.latitude.toFixed(3) + ", " + pos.coords.longitude.toFixed(3) + ")";
            showToast("GPS location captured.", "success");
        }, () => {
            status.textContent = "Could not get location.";
        });
    });
}

/* Cancel my request */
window.deleteMyRequest = function(id, btn) {
    if (typeof rsRead !== "function") return;
    const requests = rsRead("relief_requests", []);
    const idx = requests.findIndex(r => r.id === id);
    if (idx >= 0) {
        requests[idx].status = "Cancelled";
        rsWrite("relief_requests", requests);
        if (typeof addNotification === "function") addNotification("Request " + id + " cancelled.");
        showToast("Request cancelled.", "warning");
        renderCitizenDashboard();
    }
};

/* Offer form */
function bindCitizenOffer() {
    const form = document.getElementById("citizenOfferForm");
    if (!form) return;
    form.addEventListener("submit", e => {
        e.preventDefault();
        const kind = document.getElementById("offerKind").value;
        const qty = document.getElementById("offerQty").value.trim() || "Offer";
        if (typeof addOffer === "function") addOffer(kind, rdGetName(), qty);
        showToast(kind + " offer posted!", "success");
        form.reset();
        renderCitizenDashboard();
    });
}

/* Donate form */
function bindCitizenDonate() {
    const form = document.getElementById("citizenDonateForm");
    if (!form) return;
    form.addEventListener("submit", e => {
        e.preventDefault();
        const amount = document.getElementById("donateAmount").value;
        const cause = document.getElementById("donateCause").value;
        if (!amount || amount <= 0) {
            showToast("Enter a valid amount.", "error");
            return;
        }
        showToast("Donation of ₹" + amount + " received for " + cause + ". Thank you!", "success");
        if (typeof addNotification === "function") addNotification("₹" + amount + " donated to " + cause + ".");
        form.reset();
    });
}

/* Volunteer application */
function bindCitizenVolunteer() {
    const form = document.getElementById("citizenVolunteerForm");
    if (!form) return;
    form.addEventListener("submit", e => {
        e.preventDefault();
        const skill = document.getElementById("volSkill").value;
        const availability = document.getElementById("volAvailability").value;
        showToast("Application submitted! You applied as " + skill + " (" + availability + ").", "success");
        if (typeof addNotification === "function") addNotification("Volunteer application submitted — Skill: " + skill + ".");
        form.reset();
    });
}

/* ===========================================================
   NGO ACTIONS
=========================================================== */

window.ngoVerify = function(id) {
    if (typeof updateRequestStatus === "function") updateRequestStatus(id, "Verified");
    showToast("Request " + id + " verified.", "success");
    renderNgoDashboard();
};

window.ngoAccept = function(id) {
    if (typeof updateRequestStatus === "function") updateRequestStatus(id, "NGO Accepted");
    showToast("Request " + id + " accepted by NGO.", "success");
    renderNgoDashboard();
};

window.ngoReject = function(id) {
    if (typeof updateRequestStatus === "function") updateRequestStatus(id, "Rejected");
    showToast("Request " + id + " rejected.", "error");
    renderNgoDashboard();
};

window.ngoAssign = function(id) {
    if (typeof updateRequestStatus === "function") updateRequestStatus(id, "Volunteer Assigned");
    // Create a mission for the volunteer
    const request = typeof getRequestById === "function" ? getRequestById(id) : null;
    if (request && typeof rsRead === "function") {
        const missions = rsRead("relief_missions", []);
        missions.unshift({
            id: "MIS-" + Date.now(),
            requestId: id,
            title: request.type + " — " + request.location,
            location: request.location,
            lat: request.lat,
            lng: request.lng,
            status: "On the way",
            assignedAt: Date.now(),
            photo: null
        });
        rsWrite("relief_missions", missions);
    }
    if (typeof addNotification === "function") addNotification("Volunteer assigned to " + id + ".");
    showToast("Volunteer assigned to " + id + ".", "success");
    renderNgoDashboard();
};

window.ngoCall = function(id) {
    showToast("Initiating call to request " + id + "...", "info");
};

/* Resource update */
function bindNgoResource() {
    const btn = document.getElementById("ngoResUpdate");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const type = document.getElementById("ngoResType").value;
        const level = document.getElementById("ngoResLevel").value;
        if (!level || level < 0 || level > 100) {
            showToast("Enter resource level 0-100.", "error");
            return;
        }
        const map = { Food: "resFood", Water: "resWater", Medicine: "resMedicine", Fuel: "resFuel" };
        setText(map[type], level + "%");
        if (typeof addNotification === "function") addNotification(type + " resources updated to " + level + "%.");
        showToast(type + " resource updated to " + level + "%.", "success");
        document.getElementById("ngoResLevel").value = "";
    });
}

/* ===========================================================
   VOLUNTEER ACTIONS
=========================================================== */

window.volLiveLocation = function(id, btn) {
    if (!navigator.geolocation) {
        showToast("GPS not supported.", "error");
        return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
        if (typeof updateMissionStatus === "function") {
            updateMissionStatus(id, "On the way", null, pos.coords.latitude, pos.coords.longitude);
        }
        showToast("Live location shared for " + id + ".", "success");
        renderVolunteerDashboard();
    }, () => {
        showToast("Could not get location.", "error");
    });
};

window.volPhoto = function(id, input) {
    const f = input.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
        if (typeof updateMissionStatus === "function") {
            updateMissionStatus(id, "Helping", ev.target.result);
        }
        const prev = document.getElementById("photo_" + id);
        if (prev) {
            prev.innerHTML = `<img src="${ev.target.result}" alt="mission photo" style="max-height:180px;border-radius:12px">`;
            prev.style.display = "block";
        }
        showToast("Photo captured for mission " + id + ".", "success");
    };
    reader.readAsDataURL(f);
};

window.volComplete = function(id) {
    if (typeof updateMissionStatus === "function") updateMissionStatus(id, "Completed");
    showToast("Mission " + id + " completed! Great work.", "success");
    renderVolunteerDashboard();
};

/* ===========================================================
   BIND ALL ROLE MODULES
=========================================================== */

function bindRoleModules() {
    bindCitizenRequest();
    bindCitizenFile();
    bindCitizenGPS();
    bindCitizenOffer();
    bindCitizenDonate();
    bindCitizenVolunteer();
    bindNgoResource();
}

/* ===========================================================
   RENDER ACTIVE ROLE HUB
=========================================================== */

function renderRoleHub() {
    const role = rdGetRole();
    // Hide all hubs
    ["citizenHub", "ngoHub", "volunteerHub"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    if (role === "NGO") {
        renderNgoDashboard();
    } else if (role === "Volunteer") {
        renderVolunteerDashboard();
    } else {
        renderCitizenDashboard();
    }
}

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadDashboard();

        startDashboardRefresh();

        initInfoPanel();

        renderRoleHub();

        bindRoleModules();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Dashboard Loaded");
