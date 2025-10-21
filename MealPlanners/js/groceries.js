import { showLoading, hideLoading } from "./loading.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";


localStorage.setItem("webPage","groceries.html");

document.addEventListener("DOMContentLoaded", () => {
    showLoading(); // 🔄 show immediately when page starts

    let authChecked = false;

    onAuthStateChanged(auth, (user) => {
    authChecked = true;
    if (user) {
        const addMealNav = document.getElementById("addMealNav");
        if (addMealNav) {
            //addMealNav.addEventListener("click", () => loadAddMeal());
            addMealNav.addEventListener("click", () => window.location.href="addGroceryItem.html");
        }
        const addGroceriesNav = document.getElementById("addGroceriesNav");
        if (addGroceriesNav) {
            //addGroceriesNav.addEventListener("click", () => loadAddMeal());
            addGroceriesNav.addEventListener("click", () => window.location.href="addGroceryItem.html");
        }

        const allMealsBtn = document.getElementById("allMealsBtn");
        if (allMealsBtn) {
            //allMealsBtn.addEventListener("click",  getMeals(false, null, null));
        }
        const allGroceriesBtn = document.getElementById("allGroceriesBtn");
        if (allGroceriesBtn) {
            //allGroceriesBtn.addEventListener("click",  getTheGroceries());
            allGroceriesBtn.addEventListener("click", () => window.location.href="groceries.html");
        }
        //hideLoading(); // ✅ hide when ready
    } else {
      window.location.href = "login.html";
    }
    
  });
  setTimeout(() => {
        if (!authChecked && !auth.currentUser) {
            window.location.href = "login.html";
        } else if (auth.currentUser) {
            hideLoading();
        }
    }, 500);
});
