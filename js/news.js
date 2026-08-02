/* ===========================================================
   ReliefMap
   News Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   NEWS ELEMENTS
=========================================================== */

const newsContainer = document.getElementById("newsFeed");

const tickerContainer = document.getElementById("newsTicker");

const featuredNews = document.getElementById("featuredNews");

/* ===========================================================
   RELATIVE TIME
=========================================================== */

function getRelativeTime(date){

    const seconds = Math.floor(

        (new Date() - new Date(date)) / 1000

    );

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    if(days > 0) return `${days} day(s) ago`;

    if(hours > 0) return `${hours} hour(s) ago`;

    if(minutes > 0) return `${minutes} minute(s) ago`;

    return "Just now";

}

/* ===========================================================
   CREATE NEWS CARD
=========================================================== */

function createNewsCard(news){

    return `

    <article class="news-card fade-up">

        <img src="${news.image || 'assets/images/news-placeholder.jpg'}"

             alt="${news.title}">

        <div class="news-content">

            <span class="news-tag ${

                news.category?.toLowerCase() || "warning"

            }">

                ${news.category || "General"}

            </span>

            <h3>${news.title}</h3>

            <p>${news.content}</p>

            <small>

                <i class="fa-regular fa-clock"></i>

                ${getRelativeTime(news.created_at)}

            </small>

        </div>

    </article>

    `;

}

/* ===========================================================
   FEATURED NEWS
=========================================================== */

function renderFeatured(news){

    if(!featuredNews) return;

    featuredNews.innerHTML = `

    <div class="featured-news">

        <img src="${news.image || 'assets/images/news-placeholder.jpg'}">

        <div class="featured-content">

            <span class="news-tag">

                FEATURED

            </span>

            <h2>${news.title}</h2>

            <p>${news.content}</p>

            <button class="primary-btn">

                Read More

            </button>

        </div>

    </div>

    `;

}

/* ===========================================================
   LOAD NEWS
=========================================================== */

async function loadNews(){

    if(!newsContainer) return;

    try{

        showLoader();

        const response = await API.getNews();

        if(!response || !response.data){

            throw new Error("News unavailable");

        }

        const news = response.data;

        newsContainer.innerHTML = "";

        if(news.length > 0){

            renderFeatured(news[0]);

        }

        news.forEach(item=>{

            newsContainer.innerHTML +=

                createNewsCard(item);

        });

        updateTicker(news);

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load news",

            "error"

        );

    }

    finally{

        hideLoader();

    }

}

/* ===========================================================
   NEWS TICKER
=========================================================== */

function updateTicker(news){

    if(!tickerContainer) return;

    tickerContainer.innerHTML =

        news

        .map(item=>item.title)

        .join(" • ");

}

/* ===========================================================
   SEARCH NEWS
=========================================================== */

function searchNews(keyword){

    const cards =

    document.querySelectorAll(".news-card");

    cards.forEach(card=>{

        const text =

        card.innerText.toLowerCase();

        if(text.includes(keyword.toLowerCase())){

            card.style.display="block";

        }

        else{

            card.style.display="none";

        }

    });

}

/* ===========================================================
   SEARCH INPUT
=========================================================== */

const searchInput =

document.getElementById("newsSearch");

if(searchInput){

    searchInput.addEventListener(

        "input",

        debounce((e)=>{

            searchNews(

                e.target.value

            );

        },300)

    );

}

/* ===========================================================
   EMERGENCY ALERT
=========================================================== */

function showEmergencyAlert(message){

    showToast(

        message,

        "warning"

    );

}

/* ===========================================================
   AUTO REFRESH
=========================================================== */

function startNewsRefresh(){

    if(!CONFIG.AUTO_REFRESH) return;

    setInterval(

        ()=>{

            loadNews();

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

        loadNews();

        startNewsRefresh();

    }

);

/* ===========================================================
   END
=========================================================== */

console.log(

    "✅ News Module Loaded"

);