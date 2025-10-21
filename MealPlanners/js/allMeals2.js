import { getDatabase, ref, push, set//, serverTimestamp
    //, update
    , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { app } from "./firebaseAuth.js";
//import { serverTimestamp } from "firebase/database";
import { getGroceries } from "./grocery.js";
import { setupGroceryEditControls } from "./grocery.js";
import { customConfirm } from "./confirmModal.js";
import {loadComponent} from "./functions.js";


const db = getDatabase(app);
const email = localStorage.getItem("email");
let group;
if(email){
    group = localStorage.getItem(email.toLowerCase()+"_"+"group");
}else{
    
}


console.log(`🗄️ group: ${group}`);

//Get comments
export async function getMeals(thisWeek, startWeek, endWeek) {
    console.log("ThisWeek: "+thisWeek)
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    let currentMeal = null; // holds the meal currently being edited
    var group = "";
    const email = localStorage.getItem("email");
    if(email){
        group = localStorage.getItem(email.toLowerCase()+"_"+"group");
    }else{
        return;
    }
    

    console.log(`Meals: ${group}`);
    if(group){
        
    }else{

        window.location.href = "getGroup.html";
    }


    const commentsRef = ref(db, 'meals3');
    const q = query(commentsRef, orderByChild("group"), equalTo(group));

    //const snapshot = await get(q);

    const container = document.getElementById("theMeals");
    let tabIndex = 0;

    //The onValue code makes the website update realtime on other people's phones when you make an update.
    onValue(q, (snapshot) => {
        // clear out old comments
        container.innerHTML = "";
        if (snapshot.exists()) {
            // Collect comments into an array
            const commentsArray = [];
            snapshot.forEach((child) => {
                if(thisWeek===true){//This is for the current week
                    const meal = child.val();
                    if(new Date(meal.date)>=new Date(startWeek) && new Date(meal.date)<=new Date(endWeek)){//if the meals date is between or equal to startWeek and endWeek
                        commentsArray.push({ id: child.key, ...child.val() });
                    }
                    // Sort by updatedAt ascending (oldest first)
                    commentsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
                }else{//false: for allMeals page
                    //console.log("ThisWeek: "+thisWeek);

                    const meal = child.val();
                    //if(new Date(meal.date)>=new Date(startWeek) && new Date(meal.date)<=new Date(endWeek)){//if the meals date is between or equal to startWeek and endWeek
                        commentsArray.push({ id: child.key, ...child.val() });
                    //}
                    // Sort by updatedAt descending (latest first)
                    commentsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
                }
                
            });

            

            // Render each comment
            commentsArray.forEach((meal) => {
            const createdDate1 = new Date(meal.date);
            // Get YYYY-MM-DD format for input box
            const createdDate = createdDate1.toString().split("T")[0];
            const year = createdDate1.getFullYear();
            const month = (createdDate1.getMonth() + 1).toString().padStart(2, '0');
            const day = createdDate1.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            const dayOfWeek = createdDate1.toLocaleDateString("en-US", { weekday: "short" });

            //create the card
            const divC = document.createElement("div");
            divC.classList="custom-button";
            divC.role="button";
            divC.tabindex=`${tabIndex}`;
            container.appendChild(divC);
            tabIndex+=1; //Increment the tab index by one

            //Add the first row div
            const line1 = document.createElement("div");
            line1.class="row";
              //const line1p = document.createElement("p");
                //Add 1st span to line1 for Day of week
                const span1_line1 = document.createElement("span");
                span1_line1.class = "day";
                span1_line1.id="day";
                span1_line1.textContent = `${dayOfWeek}`;
                line1.appendChild(span1_line1);
                //Add 3 space bwtween spans
                line1.appendChild(document.createTextNode("\u00A0\u00A0\u00A0"));
                //Add 1st span to line1 for Day of week
                const span2_line1 = document.createElement("span");
                span2_line1.id="date";
                span2_line1.textContent = `${createdDate1.toLocaleDateString()}`;
                line1.appendChild(span2_line1);
              //line1.appendChild(line1p);
            divC.appendChild(line1);
            //Add the second row div
            const line2 = document.createElement("div");
            line2.class="row";
                //Add 1st span to line1 for Day of week
                const span1_line2 = document.createElement("span");
                span1_line2.class = "day";
                span1_line2.id="day";
                span1_line2.style="text-wrap-style:auto"
                span1_line2.textContent = `${meal.description.replace(/&#039;/g,"'").replace(/&quot;/g,'"')}`;
                line2.appendChild(span1_line2);
            divC.appendChild(line2);


            //Add a button to the card
            if(1===1){


                /*
                // Create Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit ✏️";
                editBtn.style="font-size: 1em;padding-top: 0;margin-top:0";
                */
                    const modal = document.getElementById("editModal");
                    const textarea = document.getElementById("editTextarea");
                    const editDate = document.getElementById("editDate");
                    const addGroceryBtn = document.getElementById("addGroceryBtn");
                    const saveBtn = document.getElementById("saveEditBtn");
                    const cancelBtn = document.getElementById("cancelEditBtn");
                    const deleteBtn = document.getElementById("deleteEditBtn");
                    const footer = document.getElementsByTagName("footer")[0];

                    textarea.classList="fontSize1em"
                    editDate.classList="fontSize1em"
                    saveBtn.classList="fontSize1em"
                    cancelBtn.classList="fontSize1em"
                    deleteBtn.classList="fontSize1em"

                    

                // Attach event listener for editing this comment
                divC.addEventListener("click", () => {
                    
                    currentMeal = meal; // ✅ set the selected meal
                    // Pre-fill textarea with the comment text
                    textarea.value = meal.description;
                    editDate.value = formattedDate;

                    // Show modal
                    modal.style.display = "block";
                    footer.style.display = "none";


                    // Show step3 (Add grocery)
                    const step1 = document.getElementById("step1");
                    const step2 = document.getElementById("step2");
                    const step3 = document.getElementById("step3");
                    
                    const addQtyText = document.getElementById("addQtyText");
                    const addGroceryText = document.getElementById("addGroceryText");
                    const saveNewGroceryBtn = document.getElementById("saveNewGroceryBtn");
                    const cancelNewGroceryBtn = document.getElementById("cancelNewGroceryBtn");

                    if (addGroceryBtn){
                        addGroceryBtn.onclick = () => {
                            addQtyText.value="";
                            addGroceryText.value="";
                            step1.style.display = "none";
                            step2.style.display = "none";
                            step3.style.display = "block";
                        };
                    }
                    if (saveNewGroceryBtn){
                        saveNewGroceryBtn.onclick = () => {
                            
                            //populate the text boxes

                            const newQty = addQtyText.value;//Need to make sure this is a quantity
                            const newText = addGroceryText.value;
                            if (newText && newQty) {

                                const commentRef = ref(db, "grocery");
                                const newCommentRef = push(commentRef); // generates a unique ID
                                set(newCommentRef, {
                                    checkedOff: "",
                                    description: newText,
                                    group: group,
                                    mealDesc: meal.description,
                                    mealId: meal.id,
                                    qty: newQty,
                                    thisId: newCommentRef.key
                                }).then(() => {
                                    console.log("+ Grocery item added Successfully!");
                                    step1.style.display = "block";
                                    step2.style.display = "none";
                                    step3.style.display = "none";
                                })
                                .catch(err => console.error("❌ Error:", err))
                            }else{
                                //alert("You must provide a quantity and a Grocery Item Desription.");
                                customConfirm(`You must provide a quantity and a Grocery Item Desription.`, "Qty & Description", false);
                            }
                        };
                    }
                    if (cancelNewGroceryBtn){
                        cancelNewGroceryBtn.onclick = () => {
                            step1.style.display = "block";
                            step2.style.display = "none";
                            step3.style.display = "none";
                        };
                    }


                    
                    //Add the grocery list
                    getGroceries(meal.id);
                    setupGroceryEditControls();
                });
//when saving a meal desc, meal desc needs to be changed in all grocery items also
// Save new text
                    saveBtn.onclick = () => {
                        if (!currentMeal) {
                            //alert("No meal selected.");
                            customConfirm(`No meal selected.`, "Meal?", false);
                            return;
                        }
                        const newText = textarea.value.trim();
                        const newDate = editDate.value;

                        // Convert to Date object
                        const dateObj = new Date(newDate);
                        // Add 13 hours to the date so it shows up on the correct date. Otherwise the date in firebase will be "2025-03-07T00:00:00.000Z" and show up in the app as 3/6/2025.
                        dateObj.setHours(dateObj.getHours() + 13);

                        // Format to date only (no time)
                        const dateOnly = dateObj.toISOString();
                        if (newText && dateOnly) {
                            const commentRef = ref(db, "meals3/" + currentMeal.id);
                            set(commentRef, {
                                ...currentMeal,
                                description: newText,
                                date: dateOnly
                            }).then(() => {
                                console.log("✏️ Meal updated");
                                //Delete the grocery items associated with the meal i'm deleting
                                const groceryRef = ref(db, 'grocery');
                                const q = query(groceryRef, orderByChild("group"), equalTo(group));
                                get(q).then(snapshot => {
                                    snapshot.forEach(child => {
                                        const grocery = child.val();
                                        if (grocery.mealId === currentMeal.id) {
                                            set(child.ref, {
                                                ...grocery,
                                                mealDesc: newText,
                                            }).then(() => console.log("🗑️ child grocery items renamed mealDesc"))
                                            .catch(err => console.error("❌ Error:", err))
                                        }
                                    });
                                });
                            });
                        }
                        modal.style.display = "none";
                        footer.style.display = "flex";
                    };

                    // Cancel closes modal
                    cancelBtn.onclick = () => {
                        modal.style.display = "none";
                        footer.style.display = "flex";
                    };


                    deleteBtn.onclick = async () => {
                        if (!currentMeal) {
                            //alert("No meal selected.");
                            customConfirm(`No meal selected.`, "Meal?", false);
                            return;
                        }
                        const mealDesc = currentMeal.description;
                        //alert("Meal Desc: "+ mealDesc);
                        const ok = await customConfirm(`Are you sure you want to delete meal, "${mealDesc}"?`, "Delete")
                        if (ok) {
                            const mealRef = ref(db, "meals3/" + currentMeal.id);
                            
                            remove(mealRef).then(() => {console.log(`🗑️ Meal "${mealDesc}" deleted`);});
                            
                            //Delete the grocery items associated with the meal i'm deleting
                            const groceryRef = ref(db, 'grocery');
                            const q = query(groceryRef, orderByChild("group"), equalTo(group));
                            get(q).then(snapshot => {
                                snapshot.forEach(child => {
                                    const grocery = child.val();
                                    if (grocery.mealId === currentMeal.id) {
                                        const thisId = grocery.thisId;
                                        remove(child.ref).then(() => console.log("🗑️ grocery item deleted: "+ thisId));
                                    }
                                });
                            });
                            modal.style.display = "none";
                            footer.style.display = "flex";
                        }
                        
                    };

            }
            });

        } else {
            console.log("No meals found");
            const theMeals = document.getElementById("theMeals");
            if(theMeals){
                theMeals.textContent = "No meals found";
            }
            
        }
    });
} 
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("footerComponent", "components/footer.html");
    loadComponent("headerComponent", "components/header.html");
    loadComponent("edit--modal", "components/edit-modal.html");
    loadComponent("custom-confirm", "components/custom-confirm.html");
    //getMeals(true, null, null);
});
    

