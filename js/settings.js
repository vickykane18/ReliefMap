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

    theme: "dark",

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

        theme: themeSelect ? themeSelect.value : DEFAULT_SETTINGS.theme,

        language: languageSelect ? languageSelect.value : DEFAULT_SETTINGS.language,

        notifications: notificationToggle ?

            notificationToggle.checked : DEFAULT_SETTINGS.notifications

    };

    saveStorage(

        STORAGE.SETTINGS,

        settings

    );

    setTheme(settings.theme);

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

    setTheme(DEFAULT_SETTINGS.theme);

    saveStorage(

        STORAGE.SETTINGS,

        DEFAULT_SETTINGS

    );

    showToast(

        "Settings Reset",

        "info"

    );

}

/* ===========================================================
   THEME BOX INTERACTION
=========================================================== */

function setupThemeBoxes(){

    const boxes = document.querySelectorAll(".theme-box");

    if(!boxes.length) return;

    boxes.forEach(box=>{

        box.addEventListener("click",()=>{

            const theme = box.dataset.theme;

            if(themeSelect){

                themeSelect.value = theme;

            }

            setTheme(theme);

            boxes.forEach(b=>b.classList.remove("active"));

            box.classList.add("active");

        });

    });

}

/* ===========================================================
   LIVE THEME PREVIEW
=========================================================== */

if(themeSelect){

    themeSelect.addEventListener(

        "change",

        ()=>{

            setTheme(themeSelect.value);

            document.querySelectorAll(".theme-box").forEach(b=>{

                b.classList.toggle("active", b.dataset.theme === themeSelect.value);

            });

        }

    );

}

/* ===========================================================
   LANGUAGE BUTTON INTERACTION
=========================================================== */

function setupLanguageButtons(){

    const buttons = document.querySelectorAll(".language-btn");

    if(!buttons.length) return;

    buttons.forEach(btn=>{

        btn.addEventListener("click",()=>{

            const lang = btn.dataset.lang;

            if(languageSelect){

                languageSelect.value = lang;

            }

            buttons.forEach(b=>b.classList.remove("active"));

            btn.classList.add("active");

        });

    });

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

        setupThemeBoxes();

        setupLanguageButtons();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ Settings Module Loaded");