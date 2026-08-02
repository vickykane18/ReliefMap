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
   LOAD PROFILE
=========================================================== */

async function loadProfile(){

    try{

        showLoader();

        const response = await API.getUser(1);

        if(!response || !response.data){

            throw new Error("Profile not found");

        }

        const user = response.data;

        if(profileName)
            profileName.textContent = user.username;

        if(profileRole)
            profileRole.textContent = user.role;

        if(profileEmail)
            profileEmail.textContent = user.email;

        if(profilePhone)
            profilePhone.textContent = user.phone || "-";

        if(profileAvatar){

            profileAvatar.src =

                user.avatar ||

                "assets/images/profile.png";

        }

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load profile",

            "error"

        );

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

                if(profileAvatar){

                    profileAvatar.src =

                        e.target.result;

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

        event=>{

            event.preventDefault();

            showToast(

                "Profile Updated Successfully",

                "success"

            );

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