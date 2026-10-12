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
   RELOAD AI RECOMMENDATION (backed by dedicated API)
=========================================================== */

async function loadAIRecommendation() {

    try {

        const resp = await API.getAIRecommendation();

        if (resp && resp.success && resp.data) {

            const d = resp.data;

if (d.recommendation && aiRecommendation) {

                aiRecommendation.textContent = d.recommendation;

            }

            // The /ai/recommendation endpoint returns disaster as
            // { risk_level, risk_score } (not "prediction"). Derive a
            // human-readable prediction from those fields.
            if (d.disaster && aiPrediction) {

                const level = d.disaster.risk_level;
                const score = d.disaster.risk_score;

                if (level && score !== undefined) {
                    aiPrediction.textContent =
                        `Risk level ${level} (${score}/100) — AI monitored live.`;
                } else if (level) {
                    aiPrediction.textContent = `Risk level ${level} — AI monitored live.`;
                }

            }

            return;

        }

    }

    catch (err) {

        console.warn("AI recommendation API unavailable, using fallback:", err);

    }

    /* Fallback: use stats-based prediction */
    try {

        const stats = await API.getStats();

        if (!stats || !stats.data) return;

        const data = stats.data;

        let prediction = "";

        let recommendation = "";

        if (data.Volunteers < 100) {

            prediction = "Volunteer availability is expected to decrease in the next 24 hours.";

            recommendation = "Recruit additional volunteers in high-risk areas.";

        }

        else if (data.Shelters < 10) {

            prediction = "Shelter capacity may become insufficient.";

            recommendation = "Prepare temporary shelters immediately.";

        }

        else {

            prediction = "Current relief resources are sufficient.";

            recommendation = "Continue monitoring disaster zones every 30 minutes.";

        }

        if (aiPrediction) aiPrediction.textContent = prediction;

        if (aiRecommendation) aiRecommendation.textContent = recommendation;

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
   Uses the ReliefBot knowledge base when available for rich,
   offline answers; otherwise falls back to a built-in intent
   matcher so the assistant always responds intelligently.
=========================================================== */

function generateResponse(rawText) {

    /* Prefer ReliefBot's knowledge base for rich, accurate answers */
    if (typeof ReliefBot !== "undefined" &&
        ReliefBot.matchKnowledge &&
        ReliefBot.knowledge) {

        const intent = ReliefBot.matchKnowledge(rawText);

        if (intent) {

            return ReliefBot.buildKnowledgeResponse(intent);

        }

    }

    const text = (rawText || "").toLowerCase().trim();

    /* Greetings */
    if (/^(hi|hello|hey|hi there|hello there|good morning|good afternoon|good evening|namaste|vanakkam)\b/.test(text)) {

        return "Hello! 👋 I'm the <strong>ReliefMap AI Assistant</strong>. I can help you find shelters, food, hospitals, volunteer opportunities, donation options, and share vital safety tips. What do you need help with today?";

    }

    if (text.includes("how are you") || text.includes("how r u")) {

        return "I'm always online and ready to assist! 👍 How can I help with disaster relief today?";

    }

    if (text.includes("thank")) {

        return "You're most welcome! Stay safe and reach out anytime you need help. 🙏";

    }

    if (text.includes("who are you") || text.includes("your name") || text.includes("about you")) {

        return "I'm the <strong>ReliefMap AI Assistant</strong> — an intelligent helper for citizens, NGOs, and volunteers during disasters. I provide real-time relief info, safety guidelines, and coordination support.";

    }

    if (text.includes("hospital") || text.includes("medical") || text.includes("doctor") || text.includes("clinic")) {

        return "Nearest hospitals and medical facilities are displayed on the interactive map. For life-threatening emergencies, call <strong>112</strong> immediately.";

    }

    if (text.includes("shelter") || text.includes("evacuat") || text.includes("safe place") || text.includes("refuge")) {

        return "Open the <strong>Live Map</strong> and enable the 'Shelters' filter to find the nearest shelter with available capacity.";

    }

    if (text.includes("food") || text.includes("hungry") || text.includes("meal") || text.includes("ration")) {

        return "Food distribution centers are operating normally. Open the <strong>Live Map</strong> and filter by 'Food Centers' to see the nearest one and its stock.";

    }

    if (text.includes("volunteer") || text.includes("join") || text.includes("help out")) {

        return "Volunteering is easy! Register/log in and select the <strong>Volunteer</strong> role, then view available missions on your dashboard.";

    }

    if (text.includes("donate") || text.includes("donation") || text.includes("contribute")) {

        return "Thank you for wanting to help! You can donate food, medicine, clothes, or money via the coordination team. Contact us to coordinate your contribution.";

    }

    if (text.includes("flood") || text.includes("rain") || text.includes("water rising")) {

        return "⚡ Flood Safety: Move to higher ground, avoid floodwater, turn off electricity/gas before evacuating, and keep an emergency kit ready. If trapped, call <strong>112</strong>.";

    }

    if (text.includes("cyclone") || text.includes("storm") || text.includes("hurricane")) {

        return "🌀 Cyclone Safety: Stay indoors, away from windows, secure loose objects, stock supplies, and move to a shelter if ordered to evacuate.";

    }

    if (text.includes("earthquake")) {

        return "🌍 Earthquake Safety: Drop, Cover, and Hold On. Stay away from windows and heavy furniture. If outdoors, move to an open area.";

    }

    if (text.includes("fire") || text.includes("burning") || text.includes("smoke")) {

        return "🔥 Fire Safety: Evacuate immediately and call <strong>112</strong>. Stay low to avoid smoke, feel doors before opening, and never use water on electrical fires.";

    }

    if (text.includes("emergency") || text.includes("contact") || text.includes("number") || text.includes("call") || text.includes("helpline")) {

        return "📞 Emergency Contacts:<br><br>• National Emergency: <strong>112</strong><br>• Ambulance: <strong>108</strong><br>• Fire: <strong>101</strong><br>• Police: <strong>100</strong><br>• Disaster Management: <strong>1078</strong><br>• ReliefMap Team: <strong>+91 96772 18987</strong>";

    }

    if (text.includes("first aid") || text.includes("cpr") || text.includes("bleeding") || text.includes("wound") || text.includes("unconscious")) {

        return "🩹 First Aid: Call <strong>112</strong> for emergencies. Apply firm pressure to bleeding, cool burns with water, and don't move someone with a suspected spinal injury.";

    }

    if (text.includes("map") || text.includes("location") || text.includes("directions") || text.includes("where")) {

        return "The <strong>Live Map</strong> pins all relief centers, shelters, hospitals, and food points. Use the 'My Location' button and filters to navigate to what you need.";

    }

    if (text.includes("report") || text.includes("disaster")) {

        return "To report a disaster, click <strong>'Report a Disaster'</strong> on the dashboard, enter your details, select the type & severity, and submit. The AI will analyze and alert the relief team.";

    }

    if (text.includes("register") || text.includes("sign up") || text.includes("create account")) {

        return "To register, click <strong>Login</strong>, switch to the <strong>Register</strong> tab, choose your role (Citizen, NGO, or Volunteer), and create your account.";

    }

    if (text.includes("help")) {

        return "I can help with hospitals, shelters, food centers, volunteers, donations, safety tips, and disaster information. Try asking '<em>Where is the nearest shelter?</em>'";

    }

    return "I'm not sure about that yet. Try asking about <strong>shelters, food, hospitals, volunteering, donations, safety tips</strong>, or <strong>emergency contacts</strong>.";

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

        loadAIRecommendation();

    }, CONFIG.REFRESH_INTERVAL);

}

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

updateAIStatus();

        loadAIRecommendation();

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