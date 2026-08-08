/* ===========================================================
   ReliefMap
   Profile Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   PROFILE ELEMENTS
=========================================================== */

const profileName = document.getElementById("profileName");

const profileRole = document.getElementById("profileRole");

const profileEmail = document.getElementById("profileEmail");

const profilePhone = document.getElementById("profilePhone");

const profileAvatar = document.getElementById("profileAvatar");

const profileForm = document.getElementById("profileForm");

const avatarInput = document.getElementById("avatarInput");

/* ===========================================================
   SESSION PROFILE
   Pull the logged-in user from auth session (auth.js)
=========================================================== */

function getSessionProfile() {

    if (typeof getSession !== "function") return null;

    const session = getSession();

    return session && session.user ? session.user : null;

}

/* ===========================================================
   LOAD PROFILE
=========================================================== */

async function loadProfile(){

    try{

        showLoader();

let user = getSessionProfile() || {

            username: "ReliefMap User",

            role: "Administrator",

            email: "user@reliefmap.in",

            phone: "+91 9677218987",

            avatar: "assets/profile/profile.jpg"

        };

// Load the latest profile from the database when a session user exists
        if(typeof API !== "undefined"){

            const sessionUser = getSessionProfile();

            const userId = (sessionUser && sessionUser.id) ? sessionUser.id : 1;

            try{

                const response = await API.getUser(userId);

                if(response && response.data){

                    user = response.data;

                    // Keep the session in sync with the database
                    if (sessionUser && typeof setSession === "function") {

                        const session = getSession();

                        if (session) {

                            session.user = response.data;

                            setSession(session);

                        }

                    }

                }

            }

            catch(e){

                console.warn("Using demo profile.");

            }

        }

        if(profileName)
            profileName.textContent = user.username;

        if(profileRole)
            profileRole.textContent = user.role;

        if(profileEmail)
            profileEmail.textContent = user.email;

        if(profilePhone)
            profilePhone.textContent = user.phone;

if(profileAvatar) {
            /* profileAvatar is now a user-icon <span> (not an <img>).
               Update its title/aria-label for accessibility. Avoid .src. */
            profileAvatar.title = (user.username || "ReliefMap User") + " avatar";
            profileAvatar.setAttribute("aria-label", (user.username || "ReliefMap User") + " avatar");
        }

// Populate the edit form from the loaded user
        const editName = document.getElementById("editName");
        const editEmail = document.getElementById("editEmail");
        const editPhone = document.getElementById("editPhone");

        if (editName) editName.value = user.username || "";
        if (editEmail) editEmail.value = user.email || "";
        if (editPhone) editPhone.value = user.phone || "";

        // Sync the contact info rows
        const infoEmail = document.getElementById("infoEmail");
        const infoPhone = document.getElementById("infoPhone");
        const infoRole = document.getElementById("infoRole");

        if (infoEmail) infoEmail.textContent = user.email || "";
        if (infoPhone) infoPhone.textContent = user.phone || "";
        if (infoRole) infoRole.textContent = user.role || "";

    }

    catch(error){

        console.warn("Demo profile loaded.");

    }

    finally{

        hideLoader();

    }

}
/* ===========================================================
   IMAGE PREVIEW
=========================================================== */

if(avatarInput){

    avatarInput.addEventListener(

        "change",

        event=>{

            const file =

                event.target.files[0];

            if(!file) return;

            const reader =

                new FileReader();

            reader.onload = e=>{

                if(profileAvatar && profileAvatar.tagName === "IMG"){

                    profileAvatar.src = e.target.result;

                }
                else if(profileAvatar){
                    /* Icon-based avatar: show a success indicator */
                    profileAvatar.innerHTML =
                        '<i class="fa-solid fa-circle-check"></i>';
                    if(typeof showToast === "function"){
                        showToast("Photo noted — icon avatar is used in this demo", "success");
                    }
                }

            };

            reader.readAsDataURL(file);

        }

    );

}

/* ===========================================================
   SAVE PROFILE
=========================================================== */

if(profileForm){

    profileForm.addEventListener(

        "submit",

        async event=>{

            event.preventDefault();

            const name = document.getElementById("editName");
            const email = document.getElementById("editEmail");
            const phone = document.getElementById("editPhone");

            const session = (typeof getSession === "function") ? getSession() : null;

            if (session && session.user) {

                if (name) session.user.username = name.value;
                if (email) session.user.email = email.value;
                if (phone) session.user.phone = phone.value;

                if (typeof setSession === "function") setSession(session);

                // Update the displayed profile
                if (profileName) profileName.textContent = session.user.username;
                if (profileEmail) profileEmail.textContent = session.user.email;
                if (profilePhone) profilePhone.textContent = session.user.phone;

                // Persist to the database via the backend API
                if (typeof API !== "undefined" && session.user.id) {

                    try {

                        await API.updateUser(session.user.id, {
                            username: session.user.username,
                            email: session.user.email,
                            phone: session.user.phone
                        });

                    }

                    catch(error) {

                        console.warn("Database save failed, kept in session.", error);

                    }

                }

            }

            showToast(

                "Profile Updated Successfully",

                "success"

            );

        }

    );

}

/* ===========================================================
   LOGOUT
=========================================================== */

async function handleLogout() {

    if (typeof logout === "function") {

        await logout();

    }

    else {

        if (typeof clearSession === "function") clearSession();

        location.href = "login.html";

    }

}

/* ===========================================================
   AUTH GUARD — require login to view profile
=========================================================== */

if (typeof requireAuth === "function") {

    document.addEventListener(

        "DOMContentLoaded",

        ()=>{

            requireAuth();

        }

    );

}

/* ===========================================================
   ACHIEVEMENTS
=========================================================== */

function loadAchievements(){

    const badges =

        document.getElementById(

            "achievementContainer"

        );

    if(!badges) return;

    const data=[

        "100+ Volunteers",

        "Top Coordinator",

        "Emergency Response",

        "AI Enabled"

    ];

    badges.innerHTML="";

    data.forEach(item=>{

        badges.innerHTML+=`

        <div class="profile-badge">

            ${item}

        </div>

        `;

    });

}

/* ===========================================================
   ANIMATE COUNTER (self-contained for profile page)
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

        element.textContent = current.toLocaleString("en-IN");

    }, 20);

}

/* ===========================================================
   USER STATS
=========================================================== */

function loadProfileStats(){

    const stats={

        missions:42,

        volunteers:185,

        reports:96,

        alerts:28

    };

    Object.keys(stats).forEach(key=>{

        const element=

            document.getElementById(key);

        if(element){

            animateCounter(

                element,

                stats[key]

            );

        }

    });

}

/* ===========================================================
   REFRESH
=========================================================== */

function refreshProfile(){

    loadProfile();

    loadAchievements();

    loadProfileStats();

}

/* ===========================================================
   AUTO REFRESH
=========================================================== */

setInterval(

    ()=>{

        if(CONFIG.AUTO_REFRESH){

            refreshProfile();

        }

    },

    CONFIG.REFRESH_INTERVAL

);

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        refreshProfile();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Profile Module Loaded");