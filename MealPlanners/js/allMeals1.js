/*--------------No longer used, but keeping for reference------------------*/
/*--------------No longer used, but keeping for reference------------------*/
/*--------------No longer used, but keeping for reference------------------*/
/*--------------No longer used, but keeping for reference------------------*/
/*--------------No longer used, but keeping for reference------------------*/


import { showLoading, hideLoading } from "./loading.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { getMeals } from "./allMeals2.js";

//import { getTheGroceries } from "./allGroceries.js";

localStorage.setItem("webPage","allMeals.html");

document.addEventListener("DOMContentLoaded", () => {
    showLoading(); // 🔄 show immediately when page starts

  let authChecked = false;

  onAuthStateChanged(auth, (user) => {
    authChecked = true;
    if (user) {
          // Bind to button in JS
    //document.getElementById("addCommentBtn").addEventListener("click", () => { addComment1(); });
    if(document.querySelector(".custom-button")){
        document.querySelector(".custom-button").addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.target.click(); // trigger the click handler
            }
        });
    }  
      const addGroceriesNav = document.getElementById("addGroceriesNav");
        if (addGroceriesNav) {
            //addGroceriesNav.addEventListener("click", () => loadAddMeal());
            addGroceriesNav.addEventListener("click", () => window.location.href="addGroceryItem.html");
        }
        const addMealNav = document.getElementById("addMealNav");
        if (addMealNav) {
            //addMealNav.addEventListener("click", () => loadAddMeal());
            addMealNav.addEventListener("click", () => window.location.href="addMeal.html");
        }

        const allMealsBtn = document.getElementById("allMealsBtn");
        if (allMealsBtn) {
            allMealsBtn.addEventListener("click",  getMeals(false, null, null));
        }
        const allGroceriesBtn = document.getElementById("allGroceriesBtn");
        if (allGroceriesBtn) {
        // allGroceriesBtn.addEventListener("click",  getTheGroceries());
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
      hideLoading(); // ✅ hide when ready
    }
  }, 5000);




});