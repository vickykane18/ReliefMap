/* ===========================================================
   ReliefMap
   ReliefBot AI — Fully Working Chatbot Engine
   Author : Vigneshan S
   Year : 2026

   • Natural-language intent matching
   • Local knowledge base search (js/knowledge.json)
   • Backend /ai/chat fallback (live DB)
   • OpenAI-ready (auto-used when API key is provided)
   • Typing + thinking animations, auto-scroll, timestamps
   • Chat history (localStorage), quick-suggestion chips
=========================================================== */

"use strict";

/* ===========================================================
   CONFIG
=========================================================== */

const ReliefBot = {

    config: {
        botName: "ReliefBot AI",
        // Set to a valid OpenAI key to enable ChatGPT responses.
        // Leave null to use backend + local knowledge base.
        OPENAI_API_KEY: null,
        OPENAI_MODEL: "gpt-3.5-turbo",
        ENABLE_OPENAI: false, // set true if you add a key
        HISTORY_KEY: "relief_chat_history",
        MAX_HISTORY: 50,
        MAX_MESSAGE_LEN: 500
    },

    knowledge: null,

    /* =======================================================
       INIT
    ======================================================= */

    async init() {

        this.bindElements();

        await this.loadKnowledge();

        this.renderHistory();

        if (!this.hasHistory()) {
            this.addBotMessage(
                "Hello! I'm <strong>ReliefBot AI</strong> — your disaster relief assistant. " +
                "I can help you find shelters, food, hospitals, volunteer opportunities, " +
                "donation options, and share vital safety tips. What do you need help with today?"
            );
        }

        this.renderSuggestions(this.SUGGESTIONS);

        this.bindEvents();

        this.updateStatus("Online");
    },

    /* =======================================================
       ELEMENTS
    ======================================================= */

    bindElements() {

        this.wrapper = document.getElementById("reliefbot");
        this.chatBody = document.getElementById("cbChatBody");
        this.chatInput = document.getElementById("cbInput");
        this.chatSend = document.getElementById("cbSend");
        this.chatClear = document.getElementById("cbClear");
        this.chatStatus = document.getElementById("cbStatus");
        this.chipsWrap = document.getElementById("cbChips");
        this.chatForm = document.getElementById("cbForm");
    },

    /* =======================================================
       SUGGESTIONS
    ======================================================= */

    SUGGESTIONS: [
        "Find Shelter",
        "Find Hospital",
        "Donate",
        "Volunteer",
        "Flood Tips",
        "Emergency Contacts"
    ],

    /* =======================================================
       LOAD KNOWLEDGE BASE
    ======================================================= */

    async loadKnowledge() {

        try {

            if (typeof RS_KNOWLEDGE !== "undefined") {

                this.knowledge = RS_KNOWLEDGE;

                return;

            }

            const response = await fetch("js/knowledge.json");

            if (!response.ok) throw new Error("HTTP " + response.status);

            this.knowledge = await response.json();

        }

        catch (error) {

            console.warn("Knowledge base not loaded:", error);

            this.knowledge = null;

        }

    },

    /* =======================================================
       STATUS
    ======================================================= */

    updateStatus(text) {

        if (this.chatStatus) {

            this.chatStatus.textContent = text;

        }

    },

    /* =======================================================
       HISTORY (localStorage)
    ======================================================= */

    getHistory() {

        try {

            const raw = localStorage.getItem(this.config.HISTORY_KEY);

            return raw ? JSON.parse(raw) : [];

        }

        catch {

            return [];

        }

    },

    saveHistory(messages) {

        try {

            localStorage.setItem(

                this.config.HISTORY_KEY,

                JSON.stringify(messages.slice(-this.config.MAX_HISTORY))

            );

        }

        catch (error) {

            console.warn(error);

        }

    },

    pushHistory(sender, text) {

        const history = this.getHistory();

        const now = Date.now();

        history.push({

            sender: sender,

            text: text,

            time: now

        });

        this.saveHistory(history);

    },

    hasHistory() {

        return this.getHistory().length > 0;

    },

    clearHistory() {

        localStorage.removeItem(this.config.HISTORY_KEY);

    },

    /* =======================================================
       RENDER HISTORY
    ======================================================= */

    renderHistory() {

        if (!this.chatBody) return;

        const history = this.getHistory();

        history.forEach(item => {

            if (item.sender === "user") {

                this.addUserMessage(item.text, false);

            }

            else {

                this.addBotMessage(this.formatMessage(item.text), false);

            }

        });

        this.scrollToBottom();

    },

    /* =======================================================
       MESSAGE CREATION
    ======================================================= */

    nowLabel() {

        const d = new Date();

        let h = d.getHours();

        let m = d.getMinutes();

        const ampm = h >= 12 ? "PM" : "AM";

        h = h % 12 || 12;

        m = m < 10 ? "0" + m : m;

        return h + ":" + m + " " + ampm;

    },

    addUserMessage(text) {

        if (!this.chatBody) return;

        const wrapper = document.createElement("div");

        wrapper.className = "cb-message cb-user";

        wrapper.innerHTML = `

            <div class="cb-row">

                <div class="cb-bubble cb-user-bubble">${this.escapeHtml(text)}</div>

                <div class="cb-avatar cb-user-avatar">

                    <i class="fa-solid fa-user"></i>

                </div>

            </div>

            <span class="cb-time">${this.nowLabel()}</span>

        `;

        this.chatBody.appendChild(wrapper);

        this.scrollToBottom();

    },

    addBotMessage(html, save = true) {

        if (!this.chatBody) return;

        const wrapper = document.createElement("div");

        wrapper.className = "cb-message cb-bot";

        wrapper.innerHTML = `

            <div class="cb-row">

                <div class="cb-avatar cb-bot-avatar">

                    <i class="fa-solid fa-shield-heart"></i>

                </div>

                <div class="cb-bubble cb-bot-bubble">${html}</div>

            </div>

            <span class="cb-time">${this.nowLabel()}</span>

        `;

        this.chatBody.appendChild(wrapper);

        this.scrollToBottom();

        if (save) {

            this.pushHistory("ai", html);

        }

    },

    /* =======================================================
       TYPING / THINKING
    ======================================================= */

    addTyping() {

        if (!this.chatBody) return;

        this.removeTyping();

        const wrapper = document.createElement("div");

        wrapper.className = "cb-message cb-bot cb-typing-wrapper";

        wrapper.id = "cbTyping";

        wrapper.innerHTML = `

            <div class="cb-row">

                <div class="cb-avatar cb-bot-avatar">

                    <i class="fa-solid fa-shield-heart"></i>

                </div>

                <div class="cb-bubble cb-bot-bubble cb-typing">

                    <span></span><span></span><span></span>

                </div>

            </div>

        `;

        this.chatBody.appendChild(wrapper);

        this.scrollToBottom();

    },

    removeTyping() {

        const el = document.getElementById("cbTyping");

        if (el) el.remove();

    },

    setThinking(bool, label) {

        if (this.chatStatus) {

            this.chatStatus.textContent = bool

                ? "Thinking…"

                : (label || "Online");

        }

    },

    /* =======================================================
       SCROLL
    ======================================================= */

    scrollToBottom() {

        if (this.chatBody) {

            this.chatBody.scrollTop = this.chatBody.scrollHeight;

        }

    },

    /* =======================================================
       UTILITIES
    ======================================================= */

escapeHtml(text) {

        return String(text).replace(/[&<>"']/g, function (c) {

            const map = {

                "&": "&#38;",

                "<": "&#60;",

                ">": "&#62;",

                '"': "&#34;",

                "'": "&#39;"

            };

            return map[c];

        });

    },

    formatMessage(text) {

        // Convert bullet lines to styled list for readability
        let html = String(text);

        // Escape first, then re-apply formatting
        html = this.escapeHtml(html);

        // Split by newlines
        const lines = html.split("\n");

        // Render bullet lines as list items
        let processed = [];

        let inList = false;

        lines.forEach(line => {

            const trimmed = line.trim();

            const bullet = trimmed.match(/^[•●]\s*(.*)$/);

            const numbered = trimmed.match(/^\d+[.)]\s*(.*)$/);

            if (bullet) {

                if (!inList) {

                    processed.push('<ul class="cb-list">');

                    inList = true;

                }

                processed.push(`<li>${bullet[1]}</li>`);

            }

            else if (numbered) {

                if (!inList) {

                    processed.push('<ul class="cb-list cb-list-num">');

                    inList = true;

                }

                processed.push(`<li>${numbered[1]}</li>`);

            }

            else {

                if (inList) {

                    processed.push("</ul>");

                    inList = false;

                }

                if (trimmed) {

                    processed.push(`<p>${line}</p>`);

                }

            }

        });

        if (inList) processed.push("</ul>");

        return processed.join("");

    },

    /* =======================================================
       RENDER QUICK SUGGESTION CHIPS
    ======================================================= */

    renderSuggestions(items) {

        if (!this.chipsWrap) return;

        this.chipsWrap.innerHTML = "";

        (items || []).forEach(label => {

            const chip = document.createElement("button");

            chip.type = "button";

            chip.className = "cb-chip";

            chip.textContent = label;

            chip.addEventListener("click", () => {

                this.chipInput(label);

            });

            this.chipsWrap.appendChild(chip);

        });

    },

    chipInput(label) {

        if (this.chatInput) {

            this.chatInput.value = label;

            this.chatInput.focus();

        }

    },

    /* =======================================================
       KNOWLEDGE BASE MATCH
    ======================================================= */

    matchKnowledge(text) {

        if (!this.knowledge || !this.knowledge.intents) return null;

        const q = text.toLowerCase().trim();

        let best = null;

        let bestScore = 0;

        this.knowledge.intents.forEach(intent => {

            let score = 0;

            (intent.keywords || []).forEach(keyword => {

                const kw = keyword.toLowerCase().trim();

                if (q === kw) {

                    score += 10;

                }

                else if (q.includes(kw)) {

                    score += kw.length;

                }

            });

            if (score > bestScore) {

                bestScore = score;

                best = intent;

            }

        });

        if (bestScore === 0) return null;

        return best;

    },

    /* =======================================================
       BUILD INTENT RESPONSE (rich formatted)
    ======================================================= */

    buildKnowledgeResponse(intent) {

        let html = this.formatMessage(intent.answer);

        if (intent.actions && intent.actions.length) {

            html += '<div class="cb-actions">';

            intent.actions.forEach(action => {

                html +=

                    `<a class="cb-btn" href="${action.url}">` +

                    `${this.escapeHtml(action.label)}</a>`;

            });

            html += "</div>";

        }

        return html;

    },

    /* =======================================================
       BACKEND API CALL
    ======================================================= */

    async callBackend(text) {

        if (typeof API === "undefined" || typeof API.chat !== "function") {

            throw new Error("API chat unavailable");

        }

        const result = await API.chat(text);

        if (!result || !result.success) {

            throw new Error(result && result.message ? result.message : "Backend error");

        }

        return result.data && result.data.message ? result.data.message : null;

    },

    /* =======================================================
       OPENAI CALL (optional, when key is added)
    ======================================================= */

    async callOpenAI(text) {

        if (!this.config.ENABLE_OPENAI || !this.config.OPENAI_API_KEY) {

            throw new Error("OpenAI not configured");

        }

        const response = await fetch(

            "https://api.openai.com/v1/chat/completions",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": "Bearer " + this.config.OPENAI_API_KEY

                },

                body: JSON.stringify({

                    model: this.config.OPENAI_MODEL,

                    messages: [

                        {

                            role: "system",

                            content: "You are ReliefBot AI, a disaster-relief assistant " +

                                     "for the ReliefMap platform. Answer clearly and helpfully."

                        },

                        { role: "user", content: text }

                    ],

                    max_tokens: 300

                })

            }

        );

        if (!response.ok) throw new Error("OpenAI error");

        const data = await response.json();

        return data.choices && data.choices[0] &&

               data.choices[0].message

            ? data.choices[0].message.content.trim()

            : null;

    },

    /* =======================================================
       RESPONSE PIPELINE
       Priority: OpenAI (if enabled) → Backend → Knowledge → Fallback
    ======================================================= */

    async getResponse(text) {

        // 1) OpenAI (if configured)
        if (this.config.ENABLE_OPENAI && this.config.OPENAI_API_KEY) {

            try {

                const openai = await this.callOpenAI(text);

                if (openai) return { source: "openai", html: this.formatMessage(openai) };

            }

            catch (error) {

                console.warn("OpenAI failed, falling back:", error);

            }

        }

        // 2) Backend (live DB via /ai/chat)
        try {

            const backend = await this.callBackend(text);

            if (backend) return { source: "backend", html: this.formatMessage(backend) };

        }

        catch (error) {

            console.warn("Backend chat failed, using knowledge base:", error);

        }

        // 3) Local knowledge base (instant, offline)
        const intent = this.matchKnowledge(text);

        if (intent) {

            return { source: "knowledge", html: this.buildKnowledgeResponse(intent) };

        }

        // 4) Fallback
        const fallback = this.knowledge && this.knowledge.intents

            ? this.knowledge.intents.find(i => i.id === "fallback")

            : null;

        return {

            source: "fallback",

            html: this.formatMessage(

                fallback

                    ? fallback.answer

                    : "I couldn't find an answer to that. Try asking about shelters, food, hospitals, safety tips, or contact the coordination team."

            )

        };

    },

    /* =======================================================
       SEND MESSAGE
    ======================================================= */

async sendMessage(text) {

        let message = (text || "").trim();

        if (!message) return;

        if (message.length > this.config.MAX_MESSAGE_LEN) {

            message = message.slice(0, this.config.MAX_MESSAGE_LEN);

        }

        // Show user message
        this.addUserMessage(message);

        this.pushHistory("user", message);

        // Clear input
        if (this.chatInput) this.chatInput.value = "";

        // Show thinking + typing
        this.setThinking(true);

        this.addTyping();

        // Simulate a small delay for natural feel
        const delay = 600 + Math.random() * 500;

        const result = await this.getResponse(message);

        // Remove typing, show response
        this.removeTyping();

        this.setThinking(false);

        await this.sleep(delay);

        this.addBotMessage(result.html);

        // Re-render suggestions after response
        this.renderSuggestions(this.SUGGESTIONS);

    },

    sleep(ms) {

        return new Promise(res => setTimeout(res, ms));

    },

    /* =======================================================
       CLEAR CHAT
    ======================================================= */

    clearChat() {

        if (this.chatBody) this.chatBody.innerHTML = "";

        this.clearHistory();

        this.addBotMessage(

            "Chat cleared. I'm <strong>ReliefBot AI</strong> — how can I help you today?"

        );

        this.renderSuggestions(this.SUGGESTIONS);

    },

    /* =======================================================
       EVENTS
    ======================================================= */

    bindEvents() {

        // Send button
        if (this.chatSend) {

            this.chatSend.addEventListener("click", () => {

                this.sendMessage(this.chatInput.value);

            });

        }

        // Form submit (Enter key)
        if (this.chatForm) {

            this.chatForm.addEventListener("submit", (event) => {

                event.preventDefault();

                this.sendMessage(this.chatInput.value);

            });

        }

        // Clear button
        if (this.chatClear) {

            this.chatClear.addEventListener("click", () => {

                this.clearChat();

            });

        }

    }

};

/* ===========================================================
   AUTO-START
=========================================================== */

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", () => {

        ReliefBot.init();

    });

}

else {

    ReliefBot.init();

}

/* ===========================================================
   END
=========================================================== */

console.log("✅ ReliefBot AI Loaded");
