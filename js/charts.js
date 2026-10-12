/* ===========================================================
   ReliefMap
   Charts Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   CHART INSTANCES
=========================================================== */

let distributionChart = null;

let trendChart = null;

let resourceChart = null;

let volunteerChart = null;

/* ===========================================================
   DESTROY CHART
=========================================================== */

function destroyChart(chart){

    if(chart){

        chart.destroy();

    }

}

/* ===========================================================
   DISTRIBUTION CHART
=========================================================== */

function loadDistributionChart(stats){

    const canvas = document.getElementById("distributionChart");

    if(!canvas) return;

    destroyChart(distributionChart);

    distributionChart = new Chart(

        canvas,

        {

            type:"bar",

            data:{

                labels:Object.keys(stats),

                datasets:[{

                    label:"Relief Centers",

                    data:Object.values(stats),

                    backgroundColor:[

                        COLORS.PRIMARY,

                        COLORS.WARNING,

                        COLORS.SUCCESS,

                        COLORS.PURPLE

                    ],

                    borderRadius:10

                }]

            },

            options:CHART_OPTIONS

        }

    );

}

/* ===========================================================
   TREND CHART
=========================================================== */

function loadTrendChart(){

    const canvas=document.getElementById("trendChart");

    if(!canvas) return;

    destroyChart(trendChart);

    trendChart=new Chart(

        canvas,

        {

            type:"line",

            data:{

                labels:[

                    "Mon",

                    "Tue",

                    "Wed",

                    "Thu",

                    "Fri",

                    "Sat",

                    "Sun"

                ],

                datasets:[{

                    label:"Rescues",

                    data:[

                        120,

                        150,

                        180,

                        210,

                        260,

                        280,

                        300

                    ],

                    borderColor:COLORS.PRIMARY,

                    backgroundColor:"rgba(37,99,235,.15)",

                    fill:true,

                    tension:.4

                }]

            },

            options:CHART_OPTIONS

        }

    );

}

/* ===========================================================
   RESOURCE CHART
=========================================================== */

function loadResourceChart(){

    const canvas=document.getElementById("resourceChart");

    if(!canvas) return;

    destroyChart(resourceChart);

    resourceChart=new Chart(

        canvas,

        {

            type:"doughnut",

            data:{

                labels:[

                    "Food",

                    "Water",

                    "Medicine",

                    "Fuel"

                ],

                datasets:[{

                    data:[

                        82,

                        91,

                        65,

                        55

                    ],

                    backgroundColor:[

                        COLORS.SUCCESS,

                        COLORS.CYAN,

                        COLORS.WARNING,

                        COLORS.DANGER

                    ]

                }]

            },

            options:CHART_OPTIONS

        }

    );

}

/* ===========================================================
   VOLUNTEER CHART
=========================================================== */

function loadVolunteerChart(){

    const canvas=document.getElementById("volunteerChart");

    if(!canvas) return;

    destroyChart(volunteerChart);

    volunteerChart=new Chart(

        canvas,

        {

            type:"pie",

            data:{

                labels:[

                    "Medical",

                    "Food",

                    "Shelter",

                    "Rescue"

                ],

                datasets:[{

                    data:[

                        120,

                        90,

                        70,

                        150

                    ],

                    backgroundColor:[

                        COLORS.PRIMARY,

                        COLORS.SUCCESS,

                        COLORS.WARNING,

                        COLORS.PURPLE

                    ]

                }]

            },

            options:CHART_OPTIONS

        }

    );

}

/* ===========================================================
   LOAD ALL CHARTS
=========================================================== */

async function initializeCharts(){

    try{

        let stats = {

            Hospitals: 12,

            "Food Centers": 8,

            Shelters: 6,

            Volunteers: 315

        };

        if(typeof API !== "undefined"){

            try{

                const response = await API.getStats();

                if(response && response.data){

                    stats = response.data;

                }

            }

            catch(e){

                console.warn("Using demo chart data.");

            }

        }

        loadDistributionChart(stats);

        loadTrendChart();

        loadResourceChart();

        loadVolunteerChart();

    }

    catch(error){

        console.error(error);

    }

}

/* ===========================================================
   REFRESH CHARTS
=========================================================== */

async function refreshCharts(){

    await initializeCharts();

}

/* ===========================================================
   AUTO REFRESH
=========================================================== */

setInterval(

    ()=>{

        if(CONFIG.AUTO_REFRESH){

            refreshCharts();

        }

    },

    CONFIG.REFRESH_INTERVAL

);

/* ===========================================================
   WINDOW RESIZE
=========================================================== */

window.addEventListener(

    "resize",

    ()=>{

        distributionChart?.resize();

        trendChart?.resize();

        resourceChart?.resize();

        volunteerChart?.resize();

    }

);

/* ===========================================================
   INITIALIZE
=========================================================== */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        initializeCharts();

    },500);

});
/* ===========================================================
   END
=========================================================== */

console.log("✅ Charts Loaded");