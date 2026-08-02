/* ===========================================================
   ReliefMap
   Settings Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   SETTINGS ELEMENTS
=========================================================== */

const settingsForm = document.getElementById("settingsForm");

const themeSelect = document.getElementById("theme");

const languageSelect = document.getElementById("language");

const notificationToggle = document.getElementById("notifications");

const saveButton = document.getElementById("saveSettings");

/* ===========================================================
   DEFAULT SETTINGS
=========================================================== */

const DEFAULT_SETTINGS = {

    theme: "light",

    language: "English",

    notifications: true

};

/* ===========================================================
   LOAD SETTINGS
=========================================================== */

function loadSettings(){

    const saved = loadStorage(STORAGE.SETTINGS);

    const settings = saved || DEFAULT_SETTINGS;

    if(themeSelect){

        themeSelect.value = settings.theme;

    }

    if(languageSelect){

        languageSelect.value = settings.language;

    }

    if(notificationToggle){

        notificationToggle.checked = settings.notifications;

    }

    setTheme(settings.theme);

}

/* ===========================================================
   SAVE SETTINGS
=========================================================== */

async function saveSettings(){

    const settings = {

        theme: themeSelect ? themeSelect.value : "light",

        language: languageSelect ? languageSelect.value : "English",

        notifications: notificationToggle ?

            notificationToggle.checked : true

    };

    saveStorage(

        STORAGE.SETTINGS,

        settings

    );

    setTheme(

        settings.theme

    );

    try{

        const response = await API.updateSettings(

            settings

        );

        if(response.success !== false){

            showToast(

                "Settings Saved",

                "success"

            );

        }

        else{

            showToast(

                response.message ||

                "Unable to save settings",

                "warning"

            );

        }

    }

    catch(error){

        console.error(error);

        showToast(

            "Server Error",

            "error"

        );

    }

}

/* ===========================================================
   RESET SETTINGS
=========================================================== */

function resetSettings(){

    if(themeSelect){

        themeSelect.value =

            DEFAULT_SETTINGS.theme;

    }

    if(languageSelect){

        languageSelect.value =

            DEFAULT_SETTINGS.language;

    }

    if(notificationToggle){

        notificationToggle.checked =

            DEFAULT_SETTINGS.notifications;

    }

    saveStorage(

        STORAGE.SETTINGS,

        DEFAULT_SETTINGS

    );

    setTheme(

        DEFAULT_SETTINGS.theme

    );

    showToast(

        "Settings Reset",

        "info"

    );

}

/* ===========================================================
   LIVE THEME PREVIEW
=========================================================== */

if(themeSelect){

    themeSelect.addEventListener(

        "change",

        ()=>{

            setTheme(

                themeSelect.value

            );

        }

    );

}

/* ===========================================================
   SAVE FORM
=========================================================== */

if(settingsForm){

    settingsForm.addEventListener(

        "submit",

        event=>{

            event.preventDefault();

            saveSettings();

        }

    );

}

/* ===========================================================
   RESET BUTTON
=========================================================== */

const resetButton = document.getElementById(

    "resetSettings"

);

if(resetButton){

    resetButton.addEventListener(

        "click",

        resetSettings

    );

}

/* ===========================================================
   AUTO LOAD
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadSettings();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Settings Module Loaded");