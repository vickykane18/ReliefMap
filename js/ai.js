/* ===========================================================
   ReliefMap
   AI Module
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   AI ELEMENTS
=========================================================== */

const aiStatus = document.getElementById("aiStatus");

const aiPrediction = document.getElementById("aiPrediction");

const aiRecommendation = document.getElementById("aiRecommendation");

const aiChatBody = document.getElementById("aiChatBody");

const aiInput = document.getElementById("aiInput");

const aiSendButton = document.getElementById("aiSend");

/* ===========================================================
   AI STATUS
=========================================================== */

function updateAIStatus(status = "Online") {

    if (!aiStatus) return;

    aiStatus.innerHTML = `

        <span class="status-dot"></span>

        ${status}

    `;

}

/* ===========================================================
   LOAD AI INSIGHTS
=========================================================== */

async function loadAIInsights() {

    try {

        const stats = await API.getStats();

        if (!stats || !stats.data) return;

        const data = stats.data;

        let prediction = "";

        let recommendation = "";

        /* Resource Prediction */

        if (data.Volunteers < 100) {

            prediction =

                "Volunteer availability is expected to decrease in the next 24 hours.";

            recommendation =

                "Recruit additional volunteers in high-risk areas.";

        }

        else if (data.Shelters < 10) {

            prediction =

                "Shelter capacity may become insufficient.";

            recommendation =

                "Prepare temporary shelters immediately.";

        }

        else {

            prediction =

                "Current relief resources are sufficient.";

            recommendation =

                "Continue monitoring disaster zones every 30 minutes.";

        }

        if (aiPrediction) {

            aiPrediction.textContent = prediction;

        }

        if (aiRecommendation) {

            aiRecommendation.textContent = recommendation;

        }

    }

    catch (error) {

        console.error(error);

    }

}

/* ===========================================================
   CHAT MESSAGE
=========================================================== */

function addChatMessage(message, sender = "ai") {

    if (!aiChatBody) return;

    const messageBox = document.createElement("div");

    messageBox.className = `chat-message ${sender}`;

    messageBox.innerHTML = `

        <div class="chat-bubble">

            ${message}

        </div>

    `;

    aiChatBody.appendChild(messageBox);

    aiChatBody.scrollTop = aiChatBody.scrollHeight;

}

/* ===========================================================
   AI RESPONSE
=========================================================== */

function generateResponse(text) {

    text = text.toLowerCase();

    if (text.includes("hospital")) {

        return "Nearest hospitals are displayed on the interactive map.";

    }

    if (text.includes("food")) {

        return "Food distribution centers are operating normally.";

    }

    if (text.includes("volunteer")) {

        return "Current volunteer availability looks stable.";

    }

    if (text.includes("shelter")) {

        return "Shelter locations can be viewed from the map section.";

    }

    if (text.includes("help")) {

        return "I can help with hospitals, shelters, food centers, volunteers and disaster information.";

    }

    return "I'm still learning. Please contact the disaster coordinator for detailed assistance.";

}

/* ===========================================================
   SEND MESSAGE
=========================================================== */

function sendMessage() {

    if (!aiInput) return;

    const message = aiInput.value.trim();

    if (message === "") return;

    addChatMessage(message, "user");

    aiInput.value = "";

    setTimeout(() => {

        const reply = generateResponse(message);

        addChatMessage(reply, "ai");

    }, 800);

}

/* ===========================================================
   SEND BUTTON
=========================================================== */

if (aiSendButton) {

    aiSendButton.addEventListener(

        "click",

        sendMessage

    );

}

/* ===========================================================
   ENTER KEY
=========================================================== */

if (aiInput) {

    aiInput.addEventListener(

        "keypress",

        (event) => {

            if (event.key === "Enter") {

                sendMessage();

            }

        }

    );

}

/* ===========================================================
   AI REFRESH
=========================================================== */

function startAIRefresh() {

    if (!CONFIG.AUTO_REFRESH) return;

    setInterval(() => {

        loadAIInsights();

    }, CONFIG.REFRESH_INTERVAL);

}

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        updateAIStatus();

        loadAIInsights();

        startAIRefresh();

        addChatMessage(

            "Hello! I am the ReliefMap AI Assistant. How can I help you today?"

        );

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ AI Module Loaded");