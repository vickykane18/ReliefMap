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

}

/* ===========================================================
   API INSTANCE
=========================================================== */

const API = new ReliefAPI();

/* ===========================================================
   HEALTH CHECK
=========================================================== */

async function checkBackend(){

    try{

        const result = await API.getStats();

        if(result){

            console.log(

                "✅ Backend Connected"

            );

        }

    }

    catch{

        console.warn(

            "⚠ Backend Offline"

        );

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