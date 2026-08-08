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
   HTML ESCAPE
=========================================================== */

function escapeHTML(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&" + "amp;")
        .replace(/</g, "&" + "lt;")
        .replace(/>/g, "&" + "gt;")
        .replace(/"/g, "&" + "quot;")
        .replace(/'/g, "&#" + "39;");

}

/* ===========================================================
   CREATE NEWS CARD
=========================================================== */

function resolveNewsImage(image) {
    if (!image) return 'assets/images/news-placeholder.jpg';
    // Already a full path, data URI, or absolute URL
    if (image.startsWith('http') || image.startsWith('data:') ||
        image.startsWith('/') || image.startsWith('assets/')) {
        return image;
    }
    // Bare filename stored in DB (e.g. "news1.jpg") -> map to assets/images/
    return 'assets/images/' + image;
}

function createNewsCard(news){

    const title = escapeHTML(news.title);
    const content = escapeHTML(news.content);
    const category = escapeHTML(news.category || "General");
    const image = escapeHTML(resolveNewsImage(news.image));

    return `

<article class="news-card fade-up">

        <img src="${image}"

             alt="${title}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/news-placeholder.jpg';this.classList.add('img-fallback');">

        <div class="news-content">

            <span class="news-tag ${

                escapeHTML(news.category?.toLowerCase() || "warning")

            }">

                ${category}

            </span>

            <h3>${title}</h3>

            <p>${content}</p>

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

const title = escapeHTML(news.title);
    const content = escapeHTML(news.content);
    const image = escapeHTML(resolveNewsImage(news.image));

    featuredNews.innerHTML = `

    <div class="featured-news">

        <img src="${image}" alt="${title}"
             onerror="this.onerror=null;this.src='assets/images/news-placeholder.jpg';this.classList.add('img-fallback');">

        <div class="featured-content">

            <span class="news-tag">

                FEATURED

            </span>

            <h2>${title}</h2>

            <p>${content}</p>

            <button class="primary-btn" onclick="showToast('Full story coming soon in the demo feed.','info')">

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