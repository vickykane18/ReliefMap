/* ===========================================================
   ReliefMap
   Contact Controller
   Author : Vigneshan S
   Year : 2026
=========================================================== */

"use strict";

/* ===========================================================
   CONTACT ELEMENTS
=========================================================== */

const contactForm = document.getElementById("contactForm");

const contactName = document.getElementById("contactName");

const contactEmail = document.getElementById("contactEmail");

const contactMessage = document.getElementById("contactMessage");

const contactResponse = document.getElementById("contactResponse");

const characterCounter = document.getElementById("messageCount");

/* ===========================================================
   EMAIL VALIDATION
=========================================================== */

function validateEmail(email){

    const pattern =

    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}

/* ===========================================================
   CHARACTER COUNTER
=========================================================== */

if(contactMessage){

    contactMessage.addEventListener(

        "input",

        ()=>{

            if(characterCounter){

                characterCounter.textContent =

                `${contactMessage.value.length}/500`;

            }

        }

    );

}

/* ===========================================================
   VALIDATE FORM
=========================================================== */

function validateForm(){

    if(!contactName.value.trim()){

        showToast(

            "Please enter your name",

            "warning"

        );

        return false;

    }

    if(!validateEmail(contactEmail.value)){

        showToast(

            "Invalid email address",

            "warning"

        );

        return false;

    }

    if(contactMessage.value.trim().length < 10){

        showToast(

            "Message is too short",

            "warning"

        );

        return false;

    }

    return true;

}

/* ===========================================================
   SUBMIT FORM
=========================================================== */

async function submitContact(){

    if(!validateForm()) return;

    const payload = {

        name:contactName.value,

        email:contactEmail.value,

        message:contactMessage.value

    };

    showLoader();

    try{

        const response =

        await API.sendContact(

            payload

        );

        if(response.success!==false){

            if(contactResponse){

                contactResponse.textContent =

                response.message ||

                "Message Sent Successfully";

                contactResponse.className =

                    "contact-response show success";

                setTimeout(()=>{

                    contactResponse.classList.remove("show");

                },6000);

            }

            showToast(

                "Message Sent",

                "success"

            );

            contactForm.reset();

            if(characterCounter){

                characterCounter.textContent =

                "0/500";

            }

        }

        else{

            throw new Error(

                response.message

            );

        }

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to send message",

            "error"

        );

    }

    finally{

        hideLoader();

    }

}

/* ===========================================================
   FORM SUBMIT
=========================================================== */

if(contactForm){

    contactForm.addEventListener(

        "submit",

        event=>{

            event.preventDefault();

            submitContact();

        }

    );

}

/* ===========================================================
   END
=========================================================== */

console.log(

    "✅ Contact Module Loaded"

);