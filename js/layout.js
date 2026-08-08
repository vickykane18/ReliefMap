/* ===========================================================
   ReliefMap
   Shared Layout Engine
   Author : Vigneshan S
   Year : 2026

   Injects the fixed sidebar, topbar, loader, footer,
   scroll-top button and toast container into every page.

   Active nav item is highlighted automatically using the
   `data-page` attribute on <body>.
=========================================================== */

"use strict";

/* ===========================================================
   NAVIGATION ITEMS
=========================================================== */

const NAV_ITEMS = [
    {
        page: "dashboard",
        href: "index.html",
        icon: "fa-chart-pie",
        label: "Dashboard"
    },
    {
        page: "map",
        href: "map.html",
        icon: "fa-map-location-dot",
        label: "Live Map"
    },
    {
        page: "analytics",
        href: "analytics.html",
        icon: "fa-chart-column",
        label: "Analytics"
    },
    {
        page: "ai",
        href: "ai.html",
        icon: "fa-brain",
        label: "AI Center"
    },
    {
        page: "news",
        href: "news.html",
        icon: "fa-newspaper",
        label: "News"
    },
    {
        page: "profile",
        href: "profile.html",
        icon: "fa-user",
        label: "Profile"
    },
    {
        page: "settings",
        href: "settings.html",
        icon: "fa-gear",
        label: "Settings"
    },
    {
        page: "contact",
        href: "contact.html",
        icon: "fa-envelope",
        label: "Contact"
    }
];

/* ===========================================================
   BUILD SIDEBAR MARKUP
=========================================================== */

function getLayoutRole() {

    try {

        const raw = localStorage.getItem("relief_user");

        if (!raw) return null;

        const session = JSON.parse(raw);

        return (session && session.user && session.user.role) || null;

    }

    catch (e) {

        return null;

    }

}

function buildSidebar() {

    const activePage = document.body.dataset.page || "dashboard";

    const role = getLayoutRole();

    /* Role-aware menu: use ROLE_NAV if available, else fall back to NAV_ITEMS */
    const items = (typeof ROLE_NAV !== "undefined" && role && ROLE_NAV[role])
        ? ROLE_NAV[role]
        : NAV_ITEMS;

    /* Track which menu item is active, considering URL hash for on-page
       sections (Citizen: My Requests, Offer Help, Donate, etc.) */
    const currentHash = window.location.hash || "";

    const menuItems = items
        .map(item => {

            /* If the item links to an on-page anchor (e.g. index.html#citizen-requests),
               highlight it when the current hash matches that anchor. */
            const itemHash = item.href.includes("#")
                ? "#" + item.href.split("#")[1]
                : "";

            const isActive =
                item.page === activePage ||
                (activePage === "dashboard" && item.page === "dashboard") ||
                (currentHash && itemHash === currentHash);

            return `

            <li class="${isActive ? "active" : ""}" data-page="${item.page}">

                <a href="${item.href}">

                    <i class="fa-solid ${item.icon}"></i>

                    <span>${item.label}</span>

                </a>

            </li>

        `;

        })
        .join("");

    return `

    <aside class="sidebar">

        <div class="logo">

            <i class="fa-solid fa-shield-heart"></i>

            <div>

                <h2>ReliefMap</h2>

                <span>Disaster Intelligence</span>

            </div>

        </div>

        <ul class="menu">

            <li class="menu-title">${role} Menu</li>

            ${menuItems}

</ul>

<div class="system-status">

            <div class="ss-head">

                <i class="fa-solid fa-shield-halved"></i>

                <h4>System Status</h4>

            </div>

            <div class="ss-status-line">

                <span class="status-dot" title="Online"></span>

                <span>All Systems Operational</span>

            </div>

            <div class="ss-item">

                <span>Last Sync</span>

                <strong id="ssLastSync">Just now</strong>

            </div>

            <div class="ss-item">

                <span>Connected Users</span>

                <strong id="ssUsers">315</strong>

            </div>

            <div class="ss-item">

                <span>Server Health</span>

                <strong class="ss-value">100%</strong>

            </div>

            <div class="storage">

                <div class="storage-header">

                    <span>Storage</span>

                    <span>72%</span>

                </div>

                <div class="storage-bar">

                    <div class="storage-fill"></div>

                </div>

            </div>

        </div>

        <div class="ai-panel">

            <i class="fa-solid fa-robot"></i>

            <h3>AI Assistant</h3>

            <p>Get real-time disaster insights.</p>

            <button onclick="location.href='ai.html'">

                Ask AI

            </button>

        </div>

    </aside>

    `;

}

/* ===========================================================
   SESSION HELPERS (self-contained for shared layout)
=========================================================== */

function layoutGetSession() {

    try {

        const raw = localStorage.getItem("relief_user");

        return raw ? JSON.parse(raw) : null;

    }

    catch (error) {

        return null;

    }

}

function getLayoutUser() {
    const session = layoutGetSession();
    const user = session && session.user ? session.user : null;
    const role = user && user.role ? user.role : null;
    const name = user && (user.username || user.name || user.email)
        ? (user.username || user.name || user.email)
        : "shan";
    const displayRole = role ? role : "Citizen";
    const avatar = user && user.avatar ? user.avatar : "assets/profile/profile.jpg";
    const isAuthenticated = !!(session && session.token && user);

    return {
        name,
        email: user && user.email ? user.email : "",
        role,
        displayRole,
        avatar,
        isAuthenticated
    };
}

function getRoleClass(role) {
    if (role === "NGO") return "role-ngo";
    if (role === "Volunteer") return "role-volunteer";
    if (role === "Administrator") return "role-admin";
    return "role-citizen";
}

function getRoleBadgeClass(role) {
    if (role === "NGO") return "badge-ngo";
    if (role === "Volunteer") return "badge-volunteer";
    if (role === "Administrator") return "badge-admin";
    return "badge-citizen";
}

function getUserGreeting(user) {
    if (!user.isAuthenticated) {
        return "Welcome to ReliefMap";
    }
    return "Welcome back, ";
}

function renderNavbarUser() {
    const user = getLayoutUser();
    const roleClass = getRoleClass(user.displayRole);
    const badgeClass = getRoleBadgeClass(user.displayRole);

    document.body.classList.remove("role-citizen", "role-ngo", "role-volunteer", "role-admin");
    document.body.classList.add(roleClass);

    const nbName = document.getElementById("nbName");
    const nbRole = document.getElementById("nbRole");
    const nbProfileName = document.getElementById("nbProfileName");
    const nbProfileRole = document.getElementById("nbProfileRole");
    const nbAvatar = document.querySelectorAll(".nb-avatar");
    const nbProfileBtn = document.getElementById("nbProfileBtn");

    if (nbName) nbName.textContent = user.name;
    if (nbRole) {
        nbRole.textContent = user.displayRole;
        nbRole.className = `nb-role-badge ${badgeClass}`;
    }
    if (nbProfileName) nbProfileName.textContent = user.name;
    if (nbProfileRole) {
        nbProfileRole.textContent = user.displayRole;
        nbProfileRole.className = `nb-role-badge ${badgeClass}`;
    }
if (nbAvatar) {
        nbAvatar.forEach(el => {
            /* Element is a user-icon span (not an <img>). Preserve the icon. */
            el.title = user.name + " avatar";
            el.setAttribute("aria-label", user.name + " avatar");
        });
    }
    if (nbProfileBtn) {
        nbProfileBtn.title = user.isAuthenticated ? `${user.name} — ${user.displayRole}` : "Guest account";
    }
}

function renderNavbarNotifications() {
    const user = getLayoutUser();
    const showNotifications = typeof getNotifications === "function";
    const notifs = showNotifications ? getNotifications() : [];
    const unread = notifs.filter(item => !item.read).length;

    const notifBody = document.getElementById("nbNotifBody");
    const notifCount = document.getElementById("nbNotifCount");
    const unreadBadge = document.getElementById("nbUnreadBadge");

    if (notifCount) {
        notifCount.textContent = unread > 0 ? String(unread) : "0";
    }
    if (unreadBadge) {
        unreadBadge.textContent = unread > 0 ? `${unread} unread` : "No unread notifications";
    }
    if (!notifBody) return;

    if (!notifs || notifs.length === 0) {
        const roleLabel = user.displayRole || "User";
        notifBody.innerHTML = `
            <div class="nb-nf-empty">
                <i class="fa-solid fa-bell-slash"></i>
                <div>
                    <strong>No notifications yet</strong>
                    <span>${roleLabel} notifications will appear here.</span>
                </div>
            </div>
        `;
        return;
    }

    notifBody.innerHTML = notifs.slice(0, 6).map(item => {
        const itemClass = item.read ? "" : "unread";
        const when = item.time || "Just now";
        const href = item.href ? `data-href="${item.href}"` : "";
        return `
            <div class="nb-nf-item ${itemClass}" ${href}>
                <i class="fa-solid fa-bell"></i>
                <div>
                    <strong>${item.text}</strong>
                    <span>${when}</span>
                </div>
            </div>
        `;
    }).join("");
}

function clearAllNotifications() {
    if (typeof rsWrite === "function" && typeof RS !== "undefined") {
        rsWrite(RS.NOTIFS, []);
    } else {
        localStorage.removeItem("relief_notifs");
    }
    refreshNavbar();
}

function refreshNavbar() {
    renderNavbarUser();
    renderNavbarNotifications();
}

/* ===========================================================
   BUILD TOPBAR MARKUP
   Professional role-based navbar with:
     Left:   Logo + breadcrumb
     Center: Search bar
     Right:  Online indicator + time + weather + notifications + profile chip
=========================================================== */

// Topbar HTML builder and related helpers REMOVED.
// Permanent topbar (navbar) is provided directly in each HTML page per project requirements.
// The dynamic layout still binds to existing DOM elements (date/time, notifications, profile),
// but the old injection and builder functions were removed to avoid duplication and instability.

/* ===========================================================
   LAYOUT LOGOUT (self-contained for shared layout)
=========================================================== */

async function layoutLogout() {

    try {

        const session = layoutGetSession();

        if (session && session.token && typeof API !== "undefined") {

            await API.logout(session.token);

        }

    }

    catch (error) {

        console.warn(error);

    }

    localStorage.removeItem("relief_user");

    location.href = "login.html";

}

/* ===========================================================
   BUILD RELIEFBOT CHAT WIDGET (floating, injected on every page)
=========================================================== */

function buildReliefBot() {

    return `
        <link rel="stylesheet" href="css/chatbot.css">
        <link rel="stylesheet" href="css/modal.css">

        <div class="cb-launcher" id="cbLauncher" title="Chat with ReliefBot AI">
            <i class="fa-solid fa-robot"></i>
            <span class="cb-launcher-badge"></span>
        </div>

        <div class="cb-widget" id="cbWidget">

            <div class="reliefbot">

                <div class="cb-header">

                    <div class="cb-header-avatar">
                        <i class="fa-solid fa-shield-heart"></i>
                    </div>

                    <div class="cb-header-info">
                        <h3>ReliefBot AI</h3>
                        <div class="cb-status-wrap">
                            <span class="cb-status-dot"></span>
                            <span id="cbStatus">Online</span>
                        </div>
                    </div>

                    <div class="cb-header-actions">
                        <button class="cb-clear-btn" id="cbClear" title="Clear chat">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button class="cb-clear-btn" id="cbClose" title="Close">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                </div>

                <div class="cb-body" id="cbChatBody"></div>

                <div class="cb-chips" id="cbChips"></div>

                <form class="cb-input-bar" id="cbForm" autocomplete="off">
                    <div class="cb-input-wrap">
                        <i class="fa-solid fa-comment-dots"></i>
                        <input
                            type="text"
                            id="cbInput"
                            placeholder="Ask me about shelters, food, help..."
                            maxlength="500">
                    </div>
                    <button type="submit" class="cb-send-btn" id="cbSend">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>

            </div>

        </div>
    `;

}

/* ===========================================================
   BUILD LOADER MARKUP
=========================================================== */

function buildLoader() {

    return `

    <div id="loader" style="display:none">

        <div class="loader-content">

            <div class="loader-logo">

                <i class="fa-solid fa-shield-heart"></i>

            </div>

            <h1>ReliefMap</h1>

            <p>Loading Disaster Intelligence...</p>

            <div class="loader-bar">

                <div class="loader-progress"></div>

            </div>

        </div>

    </div>

    `;

}

/* ===========================================================
   BUILD FOOTER MARKUP
=========================================================== */

function buildFooter() {

    return `

    <footer>

        <div class="footer-content">

            <h2>ReliefMap</h2>

            <p>AI Powered Disaster Relief Coordination Platform</p>

            <h3>Demo Version</h3>

            <div class="social">

                <a href="#" aria-label="GitHub">

                    <i class="fab fa-github"></i>

                </a>

                <a href="#" aria-label="LinkedIn">

                    <i class="fab fa-linkedin"></i>

                </a>

                <a href="#" aria-label="Twitter">

                    <i class="fab fa-twitter"></i>

                </a>

            </div>

            <small>
                © 2026 ReliefMap &nbsp;•&nbsp; Created by Vigneshan S
            </small>

        </div>

    </footer>

    `;

}

/* ===========================================================
   BUILD FLOATING BUTTON + TOAST CONTAINER
=========================================================== */

function buildFloating() {

    return `

    <button
            id="scrollTopBtn"
            title="Back to top">

        ↑

    </button>

    <div id="toastContainer"></div>

    `;

}

/* ===========================================================
   INJECT SHARED LAYOUT
=========================================================== */

function injectLayout() {

    const main = document.querySelector("main.content");

    if (!main) return;

    /* Sidebar (fixed, before main) */

    const sidebar = document.createElement("div");

    sidebar.innerHTML = buildSidebar();

    document.body.prepend(
        sidebar.firstElementChild
    );

    /* Loader, floating button & toast container */

    const loader = document.createElement("div");

    loader.innerHTML = buildLoader();

    document.body.appendChild(
        loader.firstElementChild
    );

    const floating = document.createElement("div");

    floating.innerHTML = buildFloating();

    document.body.appendChild(
        floating.children[0]
    );

    document.body.appendChild(
        floating.children[1]
    );

     /* Topbar is now provided as permanent HTML in each page (per SIH requirements).
         Do not inject topbar via JavaScript. buildTopbar() remains available for
         future dynamic builds, but injectLayout will not prepend it. */

/* Footer (append inside main.content) */

    const footer = document.createElement("div");

    footer.innerHTML = buildFooter();

    main.appendChild(footer.firstElementChild);

/* ReliefBot chat widget (floating launcher + panel) */

    const reliefbot = document.createElement("div");

    reliefbot.innerHTML = buildReliefBot();

    /* Inject the chat stylesheets into <head> (not <body>) for valid HTML.
       The first two children are <link rel="stylesheet"> tags. */
    const chatLinks = reliefbot.querySelectorAll("link[rel='stylesheet']");

    chatLinks.forEach(link => {

        document.head.appendChild(
            document.importNode(link, true)
        );

    });

    /* Append the launcher and widget (the remaining non-<link> nodes) to body */
    Array.from(reliefbot.children).forEach(child => {

        if (child.tagName === "LINK") return;

        document.body.appendChild(child);

    });

/* Load chatbot engine script (once) */

    if (!window.ReliefBot && !document.getElementById("chatbotScript")) {

        const chatScript = document.createElement("script");

        chatScript.id = "chatbotScript";

        chatScript.src = "js/chatbot.js";

        document.body.appendChild(chatScript);

    }

    /* Load offline-first engine (once per page) */

    if (!window.Offline && !document.getElementById("offlineScript")) {

        const offlineScript = document.createElement("script");

        offlineScript.id = "offlineScript";

        offlineScript.src = "js/offline.js";

        document.body.appendChild(offlineScript);

    }

    /* Set document title */

    const active = NAV_ITEMS.find(
        item => item.page === document.body.dataset.page
    );

    if (active) {

        document.title = active.label + " | ReliefMap";

    }

    bindLayoutEvents();

}

/* ===========================================================
   LAYOUT INTERACTIONS
=========================================================== */

function bindLayoutEvents() {

    refreshNavbar();

    /* Scroll top button */

    const scrollBtn = document.getElementById("scrollTopBtn");

    if (scrollBtn) {

        window.addEventListener("scroll", () => {

            scrollBtn.style.display =
                window.scrollY > 300
                    ? "flex"
                    : "none";

        });

        scrollBtn.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    /* =========================================================
       NEW ROLE-BASED NAVBAR INTERACTIONS
    ========================================================= */

/* Live date + time — update every second */
    const nbDate = document.getElementById("nbDate");
    const nbTime = document.getElementById("nbTime");

    function updateNavDateTime() {
        const now = new Date();

        if (nbDate) {
            nbDate.textContent = now.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }

        if (nbTime) {
            nbTime.textContent = now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        }
    }

    updateNavDateTime();
    setInterval(updateNavDateTime, 1000);

/* Online/offline indicator (dot + label) */
    const nbOnlineDot = document.getElementById("nbOnlineDot");
    const nbOnlineLabel = document.getElementById("nbOnlineLabel");
    const nbOnlineWrap = document.getElementById("nbOnline");
    if (nbOnlineDot) {
        function updateOnlineStatus() {
            const online = navigator.onLine;
            nbOnlineDot.className = "nb-online-dot " + (online ? "on" : "off");
            if (nbOnlineLabel) nbOnlineLabel.textContent = online ? "Online" : "Offline";
            if (nbOnlineWrap) {
                nbOnlineWrap.title = online ? "Online" : "Offline";
                nbOnlineWrap.className = "nb-online" + (online ? "" : " off");
            }
        }
        updateOnlineStatus();
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);
    }

    /* Mobile menu toggle (opens/closes sidebar) */
    const nbMenuBtn = document.getElementById("nbMenuBtn");
    if (nbMenuBtn) {
        nbMenuBtn.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) sidebar.classList.toggle("mobile-open");
        });
    }

    /* Notification bell toggle */
    const nbNotifBtn = document.getElementById("nbNotifBtn");
    const nbNotifDropdown = document.getElementById("nbNotifDropdown");
    if (nbNotifBtn && nbNotifDropdown) {
        nbNotifBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            nbNotifDropdown.classList.toggle("open");
            /* Close profile dropdown if open */
            const nbProfileDropdown = document.getElementById("nbProfileDropdown");
            if (nbProfileDropdown) nbProfileDropdown.classList.remove("open");
        });
        document.addEventListener("click", (event) => {
            if (!nbNotifBtn.contains(event.target) && !nbNotifDropdown.contains(event.target)) {
                nbNotifDropdown.classList.remove("open");
            }
        });
    }

    /* Profile dropdown toggle */
    const nbProfileBtn = document.getElementById("nbProfileBtn");
    const nbProfileDropdown = document.getElementById("nbProfileDropdown");
    if (nbProfileBtn && nbProfileDropdown) {
        nbProfileBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            const expanded = nbProfileBtn.getAttribute("aria-expanded") === "true";
            nbProfileBtn.setAttribute("aria-expanded", String(!expanded));
            nbProfileDropdown.classList.toggle("open");
            /* Close notification dropdown if open */
            if (nbNotifDropdown) {
                nbNotifDropdown.classList.remove("open");
                nbNotifBtn.setAttribute("aria-expanded", "false");
            }
        });
        document.addEventListener("click", (event) => {
            if (!nbProfileBtn.contains(event.target) && !nbProfileDropdown.contains(event.target)) {
                nbProfileDropdown.classList.remove("open");
                nbProfileBtn.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* Mark all notifications as read */
    const nbMarkRead = document.getElementById("nbMarkRead");
    const nbClearAll = document.getElementById("nbClearAll");
    if (nbMarkRead) {
        nbMarkRead.addEventListener("click", () => {
            const notifs = typeof getNotifications === "function" ? getNotifications() : [];
            const updated = notifs.map(item => ({ ...item, read: true }));
            if (typeof rsWrite === "function" && typeof RS !== "undefined") {
                rsWrite(RS.NOTIFS, updated);
            } else {
                localStorage.setItem("relief_notifs", JSON.stringify(updated));
            }
            refreshNavbar();
            if (typeof showToast === "function") {
                showToast("All notifications marked as read", "success");
            }
        });
    }
    if (nbClearAll) {
        nbClearAll.addEventListener("click", () => {
            clearAllNotifications();
            if (typeof showToast === "function") {
                showToast("Notifications cleared", "success");
            }
        });
    }

    /* System status — live last-sync time + connected users */

    const ssLastSync = document.getElementById("ssLastSync");

    if (ssLastSync) {

        const updateSync = () => {

            const now = new Date();

            ssLastSync.textContent =
                now.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });

        };

        updateSync();

        setInterval(updateSync, 1000);

    }

    const ssUsersEl = document.getElementById("ssUsers");

    if (ssUsersEl) {

        const base = 300;

        const delta = Math.floor(Math.random() * 40) + 8;

        ssUsersEl.textContent = base + delta;

    }

    /* ReliefBot chat widget — launcher & close toggle */

    const cbLauncher = document.getElementById("cbLauncher");

    const cbWidget = document.getElementById("cbWidget");

    const cbClose = document.getElementById("cbClose");

    const openChat = () => {

        if (!cbWidget) return;

        cbWidget.classList.add("open");

        if (cbLauncher) cbLauncher.classList.add("hidden");

        if (typeof ReliefBot !== "undefined" && ReliefBot.chatInput) {

            setTimeout(() => ReliefBot.chatInput.focus(), 50);

        }

    };

    const closeChat = () => {

        if (!cbWidget) return;

        cbWidget.classList.remove("open");

        if (cbLauncher) cbLauncher.classList.remove("hidden");

    };

    if (cbLauncher) {

        cbLauncher.addEventListener("click", openChat);

    }

    if (cbClose) {

        cbClose.addEventListener("click", closeChat);

    }

    /* =========================================================
       SIDEBAR ACTIVE STATE — on click & hash change
       Highlights the selected menu item (including on-page
       sections like "My Requests", "Offer Help", "Donate").
    ========================================================= */

    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        /* On menu link click: mark the clicked item selected.
           Also toggle mobile sidebar closed on small screens. */
        sidebar.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            if (!link) return;
            const li = link.closest("li");
            sidebar.querySelectorAll("li.active").forEach(item =>
                item.classList.remove("active")
            );
            if (li) {
                li.classList.add("active");
                /* Close mobile sidebar after selecting */
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove("mobile-open");
                }
            }
        });
    }

    /* On hash change (e.g. index.html#citizen-requests) update active item. */
    window.addEventListener("hashchange", () => {
        const currentHash = window.location.hash || "";
        if (!sidebar) return;
        const links = sidebar.querySelectorAll(".menu li a");
        links.forEach((link) => {
            const li = link.closest("li");
            const itemHash = link.getAttribute("href").includes("#")
                ? "#" + link.getAttribute("href").split("#")[1]
                : "";
            if (li) li.classList.remove("active");
            if (itemHash && itemHash === currentHash && li) {
                li.classList.add("active");
            }
        });
    });

}

/* ===========================================================
   RUN
=========================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        injectLayout
    );

}

else {

    injectLayout();

}

window.addEventListener("load", () => {
    if (typeof refreshNavbar === "function") {
        refreshNavbar();
    }
});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Shared Layout Injected");
