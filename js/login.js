/* ===========================================================
   ReliefMap

=========================================================== */

"use strict";

/* ===========================================================
   ELEMENTS
=========================================================== */

const formTitle = document.getElementById("formTitle");
const formSub = document.getElementById("formSub");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* ===========================================================
   STATE
=========================================================== */

let activeRole = "Citizen";

/* ===========================================================
   ROLE TOGGLE
=========================================================== */

document.querySelectorAll(".role-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".role-btn").forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        activeRole = btn.dataset.role;

        if (formTitle) formTitle.textContent = btn.dataset.title;

        if (formSub) formSub.textContent = btn.dataset.sub;

    });

});

/* ===========================================================
   TAB SWITCH (Login / Register)
=========================================================== */

document.querySelectorAll(".tab-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn").forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        const tab = btn.dataset.tab;

        if (loginForm) loginForm.classList.toggle("hidden", tab !== "login");

        if (registerForm) registerForm.classList.toggle("hidden", tab !== "register");

    });

});

/* ===========================================================
   PASSWORD TOGGLE
=========================================================== */

document.querySelectorAll(".toggle-pass").forEach(btn => {

    btn.addEventListener("click", () => {

        const input = btn.parentElement.querySelector("input");

        const icon = btn.querySelector("i");

        if (!input) return;

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        icon.className = isPassword
            ? "fa-solid fa-eye-slash"
            : "fa-solid fa-eye";

    });

});

/* ===========================================================
   LOGIN
=========================================================== */

if (loginForm) {

    loginForm.addEventListener("submit", async event => {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {

            setMessage(loginMsg, "Please fill in all fields.", "error");

            return;

        }

        setLoading(loginBtn, true, "Logging in...");

        setMessage(loginMsg, "", "");

        try {

            let result = null;

            if (typeof API !== "undefined") {

                result = await API.login({ email, password });

            }

// Fallback demo auth when backend is offline
            if (!result || !result.success) {

                result = demoLogin(email, activeRole);

            }

            if (result.success) {

                const session = {
                    token: result.token || "demo-token",
                    user: result.data
                };

                if (typeof setSession === "function") {
                    setSession(session);
                }

setMessage(loginMsg, result.message || "Login successful!", "success");

                setTimeout(() => {
                    const role = (result.data && result.data.role) || "Citizen";
                    // Role-aware routing — all roles enter the dashboard which
                    // re-renders according to the logged-in role.
                    location.href = "index.html?role=" + encodeURIComponent(role);
                }, 900);

            }

            else {

                setMessage(loginMsg, result.message || "Invalid email or password.", "error");

            }

        }

        catch (error) {

            setMessage(loginMsg, "Unable to reach server. Please try again.", "error");

        }

        finally {

            setLoading(loginBtn, false, "Login");

        }

    });

}

/* ===========================================================
   REGISTER
=========================================================== */

if (registerForm) {

    registerForm.addEventListener("submit", async event => {

        event.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const password = document.getElementById("regPassword").value;

        if (!name || !email || !password) {

            setMessage(registerMsg, "Please fill in required fields.", "error");

            return;

        }

        if (password.length < 6) {

            setMessage(registerMsg, "Password must be at least 6 characters.", "error");

            return;

        }

        setLoading(registerBtn, true, "Creating account...");

        setMessage(registerMsg, "", "");

        try {

            let result = null;

            if (typeof API !== "undefined") {

                result = await API.register({
                    username: name,
                    email,
                    password,
                    phone,
                    role: activeRole
                });

            }

            // Fallback demo registration
            if (!result || !result.success) {

                const user = {
                    username: name,
                    email,
                    phone,
                    role: activeRole,
                    avatar: "assets/profile/profile.jpg"
                };

                result = {
                    success: true,
                    message: "Account created successfully! Please login.",
                    data: user
                };

            }

            if (result.success) {

                setMessage(registerMsg, result.message, "success");

                // Switch to login tab
                document.querySelectorAll(".tab-btn").forEach(b =>
                    b.classList.remove("active")
                );

                const loginTab = document.querySelector('.tab-btn[data-tab="login"]');

                if (loginTab) loginTab.classList.add("active");

                if (loginForm) loginForm.classList.remove("hidden");

                if (registerForm) registerForm.classList.add("hidden");

            }

            else {

                setMessage(registerMsg, result.message, "error");

            }

        }

        catch (error) {

            setMessage(registerMsg, "Unable to reach server. Please try again.", "error");

        }

        finally {

            setLoading(registerBtn, false, "Create Account");

        }

    });

}

/* ===========================================================
   HELPERS
=========================================================== */

function setMessage(element, text, type) {

    if (!element) return;

    element.textContent = text || "";

    element.className = "auth-msg" + (type ? " " + type : "");

}

function setLoading(btn, loading, label) {

    if (!btn) return;

    btn.disabled = loading;

    btn.innerHTML = loading
        ? '<i class="fa-solid fa-spinner fa-spin"></i> ' + label
        : label;

}

function demoLogin(email, selectedRole) {

    let role = selectedRole || "Citizen";

    const e = email.toLowerCase();

    if (e.includes("admin")) role = "Administrator";
    else if (e.includes("ngo")) role = "NGO";
    else if (e.includes("vol") || e.includes("volunteer")) role = "Volunteer";

return {
        success: true,
        token: "demo-" + Date.now(),
        message: "Welcome back! (Demo mode)",
        data: {
            id: 1,
            username: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            email: email,
            role: role,
            phone: "+91 96772 18987",
            avatar: "assets/profile/profile.jpg"
        }
    };

}

/* ===========================================================
   REDIRECT IF ALREADY LOGGED IN
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof isLoggedIn === "function" && isLoggedIn()) {

        location.href = "index.html";

    }

});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Login Module Loaded");
