import { showLoading, hideLoading } from "./loading.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { getTheGroceries } from "./allGroceries.js";


localStorage.setItem("webPage","groceries.html");

document.addEventListener("DOMContentLoaded", () => {
  showLoading();

  let authResolved = false;

  // Fallback in case auth never resolves
  const authTimeout = setTimeout(() => {
    if (!authResolved) {
      window.location.href = "login.html";
    }
  }, 5000);

  onAuthStateChanged(auth, (user) => {
    authResolved = true;
    clearTimeout(authTimeout);

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // ✅ Authenticated
    hideLoading();

    const addMealNav = document.getElementById("addMealNav");
    addMealNav?.addEventListener("click", () => {
      window.location.href = "addGroceryItem.html";
    });

    const addGroceriesNav = document.getElementById("addGroceriesNav");
    addGroceriesNav?.addEventListener("click", () => {
      window.location.href = "addGroceryItem.html";
    });

    const sortByItemBtn = document.getElementById("sortByItem");
    sortByItemBtn?.addEventListener("click", () => {
      getTheGroceries("description");
    });

    const sortByDateBtn = document.getElementById("sortByDate");
    sortByDateBtn?.addEventListener("click", () => {
      getTheGroceries("key");
    });

    const sortByMealBtn = document.getElementById("sortByMeal");
    sortByMealBtn?.addEventListener("click", () => {
      getTheGroceries("mealDesc");
    });

    

    const allMealsBtn = document.getElementById("allMealsBtn");
    // Add handler here later if needed
    // allMealsBtn?.addEventListener("click", () => getMeals(false, null, null));

    const allGroceriesBtn = document.getElementById("allGroceriesBtn");
    allGroceriesBtn?.addEventListener("click", () => {
      window.location.href = "groceries.html";
    });
  });
});
