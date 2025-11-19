import { showLoading, hideLoading } from "./loading.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { getMeals } from "./allMeals2.js";
//import { getTheGroceries } from "./allGroceries.js";
import { getNextDate } from "./functions.js";
import { getPreviousDate } from "./functions.js";
//import { loadAddMeal } from "./addMeal.js";

localStorage.setItem("webPage","index.html");

//load the header and footer
async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (el) {
    const html = await fetch(path).then(r => r.text());
    el.innerHTML = html;
  }
}

loadComponent("footerComponent", "components/footer.html");
//loadComponent("headerComponent", "components/header.html");
loadComponent("edit--modal", "components/edit-modal.html");
loadComponent("custom-confirm", "components/custom-confirm.html");

async function getStartAndEnd(theDate){
    console.log("lastSunday or nextMonday: " + theDate);
    let today;
    if(theDate){
        if(theDate === "futureSunday"){
            const futureSunday = localStorage.getItem("nextSunday");
            if(futureSunday){
                console.log("NextSunday: "+ futureSunday)
                today = new Date(futureSunday);// past or future week    
            }
            
        }else if(theDate === "lastSunday"){
            const pastSunday = localStorage.getItem("lastSunday");
            if(pastSunday){
                console.log("PastSunday: "+ pastSunday)
                today = new Date(pastSunday);// past or future week    
            }
            
        }
        
    }else{
        today = new Date();//currrent week
    }
    
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    //const endWeek = ;


    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Sunday

    // Clone today's date so we don't modify the original
    const startWeek = new Date(today);
    startWeek.setDate(today.getDate() - dayOfWeek );
    startWeek.setHours(0);
    startWeek.setMinutes(0);
    startWeek.setSeconds(0);
    console.log("StartWeek: ", startWeek);

    const endWeek = new Date(today);
    if(endWeek.toDateString()==="Sunday"){
        endWeek.setHours(23);
        endWeek.setMinutes(59);
        endWeek.setSeconds(59);
        console.log("upcoming Sunday unaltered:", endWeek);
    }else{
        endWeek.setDate(today.getDate() +(6- dayOfWeek));
        endWeek.setHours(23);
        endWeek.setMinutes(59);
        endWeek.setSeconds(59);
        console.log("End week:", endWeek);
    }

    //const email = localStorage.getItem("email");
    //let account = localStorage.getItem(email.toLowerCase()+"_"+"group");
    //alert("account before: " +account);
    //alert("account after: " +account);

    const lastSunday = new Date(startWeek);
    lastSunday.setDate(lastSunday.getDate() -7);
    localStorage.setItem("lastSunday", new Date(lastSunday));
    console.log("Last Sunday: ", lastSunday);

    const nextSunday = new Date(startWeek); 
    nextSunday.setDate(nextSunday.getDate() + 7);
    localStorage.setItem("nextSunday", new Date(nextSunday));
    console.log("Next Sunday: ", nextSunday);

    const datesArray = [];

    datesArray.push(startWeek.toISOString());
    datesArray.push(endWeek.toISOString());
    
    return datesArray;
}

function pastWeek() {
    getStartAndEnd("lastSunday").then(datesArray=>{
        const startWeek = new Date(datesArray[0]);
        const endWeek = new Date(datesArray[1]);
        console.log("Start and end: " + startWeek + endWeek);
        getMeals(true, startWeek, endWeek);
    });
}

function currentWeek() {
    getStartAndEnd(null).then(datesArray=>{
        const startWeek = new Date(datesArray[0]);
        const endWeek = new Date(datesArray[1]);
        console.log("Start and end: " + startWeek + endWeek);
        getMeals(true, startWeek, endWeek);
    });
}

function futureWeek() {
    getStartAndEnd("futureSunday").then(datesArray=>{
        const startWeek = new Date(datesArray[0]);
        const endWeek = new Date(datesArray[1]);
        console.log("Start and end: " + startWeek + endWeek);
        getMeals(true, startWeek, endWeek);
    });
}



document.addEventListener("DOMContentLoaded", () => {
    showLoading(); // 🔄 show immediately when page starts

    let authChecked = false;

    onAuthStateChanged(auth, (user) => {
    authChecked = true;
    if (user) {
        currentWeek();
        const past = document.getElementById("past");
        if (past) {
            past.addEventListener("click", pastWeek);
        }
        const currentWeekBtn = document.getElementById("currentWeekBtn");
        if (currentWeekBtn) {
            currentWeekBtn.addEventListener("click", currentWeek);
        }
        const future = document.getElementById("future");
        if (future) {
            future.addEventListener("click", futureWeek);
        }
        const addMealNav = document.getElementById("addMealNav");
        if (addMealNav) {
            //addMealNav.addEventListener("click", () => loadAddMeal());
            addMealNav.addEventListener("click", () => window.location.href="addMeal.html");
        }
        const addGroceriesNav = document.getElementById("addGroceriesNav");
        if (addGroceriesNav) {
            //addGroceriesNav.addEventListener("click", () => loadAddMeal());
            addGroceriesNav.addEventListener("click", () => window.location.href="addGroceryItem.html");
        }
        const allMealsBtn = document.getElementById("allMealsBtn");
        if (allMealsBtn) {
            allMealsBtn.addEventListener("click",  getMeals(false, null, null));
        }
        const allGroceriesBtn = document.getElementById("allGroceriesBtn");
        if (allGroceriesBtn) {
            //allGroceriesBtn.addEventListener("click",  getTheGroceries());
            allGroceriesBtn.addEventListener("click", () => window.location.href="groceries.html");
        }

    } else {
      window.location.href = "login.html";
    }
    
  });
  setTimeout(() => {
        if (!authChecked && !auth.currentUser) {
        window.location.href = "login.html";
        } else if (auth.currentUser) {
        hideLoading();// ✅ hide when ready
        }
    }, 300)
});

  
