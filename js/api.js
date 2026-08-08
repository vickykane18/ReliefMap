/* ===========================================================
   ReliefMap
   API Service
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   API CLASS
=========================================================== */

class ReliefAPI {

    constructor() {

        this.baseUrl = CONFIG.API_BASE_URL;

        this.timeout = CONFIG.REQUEST_TIMEOUT;

    }

    /* =======================================================
       GENERIC REQUEST
    ======================================================= */

    async request(endpoint, options = {}) {

        const controller = new AbortController();

        const timer = setTimeout(() => {

            controller.abort();

        }, this.timeout);

        try {

            const response = await fetch(

                `${this.baseUrl}${endpoint}`,

                {

                    ...options,

                    signal: controller.signal,

                    headers: {

                        "Content-Type": "application/json",

                        ...(options.headers || {})

                    }

                }

            );

            clearTimeout(timer);

            if (!response.ok) {

                throw new Error(

                    `HTTP ${response.status}`

                );

            }

            return await response.json();

        }

        catch(error){

            clearTimeout(timer);

            console.error(

                "API Error:",

                error

            );

            return {

                success:false,

                message:error.message

            };

        }

    }

    /* =======================================================
       GET
    ======================================================= */

    async get(endpoint){

        return await this.request(

            endpoint,

            {

                method:"GET"

            }

        );

    }

    /* =======================================================
       POST
    ======================================================= */

    async post(endpoint,data){

        return await this.request(

            endpoint,

            {

                method:"POST",

                body:JSON.stringify(data)

            }

        );

    }

    /* =======================================================
       PUT
    ======================================================= */

    async put(endpoint,data){

        return await this.request(

            endpoint,

            {

                method:"PUT",

                body:JSON.stringify(data)

            }

        );

    }

    /* =======================================================
       DELETE
    ======================================================= */

    async delete(endpoint){

        return await this.request(

            endpoint,

            {

                method:"DELETE"

            }

        );

    }

    /* =======================================================
       DASHBOARD
    ======================================================= */

    async getStats(){

        return await this.get(

            "/stats"

        );

    }

    /* =======================================================
       MAP
    ======================================================= */

    async getMapData(){

        return await this.get(

            "/map"

        );

    }

    /* =======================================================
       NEWS
    ======================================================= */

    async getNews(){

        return await this.get(

            "/news"

        );

    }

    /* =======================================================
       ABOUT
    ======================================================= */

    async getAbout(){

        return await this.get(

            "/about"

        );

    }

    /* =======================================================
       PROFILE
    ======================================================= */

async getUser(id){

        return await this.get(

            `/users/${id}`

        );

    }

    async updateUser(id, data){

        return await this.put(

            `/users/${id}`,

            data

        );

    }

    /* =======================================================
       CONTACT
    ======================================================= */

    async sendContact(data){

        return await this.post(

            "/contact",

            data

        );

    }

/* =======================================================
       SETTINGS
    ======================================================= */

    async updateSettings(data){

        return await this.put(

            "/settings/update",

            data

        );

    }

    /* =======================================================
       AUTH
    ======================================================= */

    async register(data){

        return await this.post(

            "/auth/register",

            data

        );

    }

    async login(data){

        return await this.post(

            "/auth/login",

            data

        );

    }

    async getMe(token){

        return await this.request(

            "/auth/me",

            {

                method:"GET",

                headers:{

                    "Authorization": `Bearer ${token}`

                }

            }

        );

    }

    async logout(token){

        return await this.request(

            "/auth/logout",

            {

                method:"POST",

                headers:{

                    "Authorization": `Bearer ${token}`

                }

            }

        );

    }

    /* =======================================================
       AI INSIGHTS
    ======================================================= */

    async getAIInsights(){

        return await this.get(

            "/ai/insights"

        );

    }

    /* =======================================================
       AI RECOMMENDATION
    ======================================================= */

    async getAIRecommendation(){

        return await this.get(

            "/ai/recommendation"

        );

    }

    /* =======================================================
       AI CHAT
    ======================================================= */

    async chat(message){

        return await this.post(

            "/ai/chat",

            { message }

        );

    }

    /* =======================================================
       REPORTS
    ======================================================= */

    async createReport(data){

        return await this.post(

            "/reports",

            data

        );

    }

    async getReports(){

        return await this.get(

            "/reports"

        );

    }

    async getPendingReports(){

        return await this.get(

            "/reports/pending"

        );

    }

    async getMissions(){

        return await this.get(

            "/missions"

        );

    }

}

/* ===========================================================
   API INSTANCE
=========================================================== */

const API = new ReliefAPI();

/* ===========================================================
   BACKEND STATUS
=========================================================== */

let backendOnline = false;

/* ===========================================================
   HEALTH CHECK
=========================================================== */

async function checkBackend(){

    try{

        const result = await fetch(

            `${CONFIG.API_BASE_URL}/stats`,

            { signal: AbortSignal.timeout(4000) }

        );

        backendOnline = result.ok;

        if (backendOnline) {

            console.log("✅ Backend Connected");

        } else {

            console.warn("⚠ Backend Offline");

        }

    }

    catch{

        backendOnline = false;

        console.warn("⚠ Backend Offline");

    }

    updateBackendUI();

    return backendOnline;

}

/* ===========================================================
   UPDATE BACKEND UI (banner + sidebar status)
=========================================================== */

function updateBackendUI(){

    // Offline banner
    let banner = document.getElementById("backendBanner");

    if (!backendOnline) {

        if (!banner) {

            banner = document.createElement("div");

            banner.id = "backendBanner";

            banner.className = "backend-banner";

            banner.innerHTML = `
                <i class="fa-solid fa-plug-circle-xmark"></i>
                Backend offline — showing demo data. Start the server
                (run <code>py app.py</code> in the backend folder) for live data.
            `;

            document.body.appendChild(banner);

        }

        banner.style.display = "flex";

    }

    else if (banner) {

        banner.style.display = "none";

    }

// Sidebar backend status dot
    const dot = document.querySelector(
        '.system-status .ss-status-line .status-dot'
    );

    if (dot) {

        dot.style.background = backendOnline ? "#22c55e" : "#ef4444";

        dot.title = backendOnline ? "Online" : "Offline";

    }

}

/* ===========================================================
   AUTO REFRESH
=========================================================== */

function startAutoRefresh(){

    if(!CONFIG.AUTO_REFRESH) return;

    setInterval(

        async()=>{

            if(typeof loadDashboard==="function"){

                loadDashboard();

            }

        },

        CONFIG.REFRESH_INTERVAL

    );

}

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        checkBackend();

        startAutoRefresh();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log("✅ API Service Loaded");