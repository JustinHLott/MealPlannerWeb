import { getDatabase, ref, push, set//, serverTimestamp
    //, update
    , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { app } from "./firebaseAuth.js";
import { sanitizeInput } from "./functions.js";
import { getNextDate } from "./functions.js";
import { loadComponent } from "./functions.js";
import { customConfirm } from "./confirmModal.js";
//import { serverTimestamp } from "firebase/database";
import { getGroceries } from "./grocery.js";
import { setupGroceryEditControls } from "./grocery.js";

//To update the app hosted in firebase put this in the powershell terminal:
//   firebase deploy --only hosting:mealplanners
//Then press enter

const db = getDatabase(app);
const email = localStorage.getItem("email");
let group = localStorage.getItem(email.toLowerCase()+"_"+"group");
console.log(`🗄️ group: ${group}`);



//Get comments
function loadAddMeal() {

    console.log(`Made it to loadAddMeal`);
    //alert(`Made it to loadAddMeal`);
    const email = localStorage.getItem("email");
    let group = localStorage.getItem(email.toLowerCase()+"_"+"group");

    if(group){
        console.log(`addMeal, got the account: ${group}`);
        addMeal1(group);
    }else{
        window.location.href = "getGroup.html";
    }
}
    

//How it works: create an empty meal to start at load then i can add groceries to the empty meal. Delete the meal & groceries if they press cancel.
//Adding comments


function addMeal1(account){

    //load the header and footer
    async function loadComponent(id, path) {
        const el = document.getElementById(id);
        if (el) {
            const html = await fetch(path).then(r => r.text());
            el.innerHTML = html;
        }
    }

    loadComponent("edit--modal", "components/edit-modal.html");
    loadComponent("custom-confirm", "./components/custom-confirm.html");

    //ensure user is logged in    
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Logged in as:", user.uid);
            // Clear the meal description
            document.getElementById("editTextarea").value = "";
            // Now safe to call
            getNextDate(account).then(theDate => {
                //alert("Latest date: " + theDate);
                
                addMeal2(account, theDate);
            });
            
            
        } else {
            console.log("❌ No user logged in");
            // Maybe redirect to login.html here
        }
    });
}

function addMeal2(account, latestDate) {
    try{
    //alert("Made it to addMeal2")
    const modal = document.getElementById("editModal");
    const modalContent = document.getElementById("modal-content");
    const dateInput = document.getElementById("dateInput");
    const deleteEditBtn = document.getElementById("deleteEditBtn");
    const idH4 = document.getElementById("idH4");

    if(modal && modalContent && dateInput && deleteEditBtn&&idH4){
        //alert("Do i make it here?")
        modal.classList="modalBlock";
        modalContent.classList="modal-contentBlock";

        dateInput.style.display="block";
        deleteEditBtn.style.display="none";
        idH4.innerHTML="Add Meal Description"

        modal.style.display="block";
        modal.style.position="fixed";
        modal.style.zIndex="1000";
        modal.style.left="0";
        modal.style.top="0";
        modal.style.width="100%";
        modal.style.height="100%";
        modal.style.background="rgb(0,0,0)";

        modalContent.style.background="rgba(255, 255, 255, 0.87)";
        modalContent.style.padding="10px";
        modalContent.style.maxWidth="400px";
        modalContent.style.margin="10% auto";
        modalContent.style.borderRadius="8px";
    }
    
    const createdDate1 = new Date(latestDate);
    // ✅ Add one day
    createdDate1.setDate(createdDate1.getDate() + 1);
    // Get YYYY-MM-DD format for input box
            const createdDate = createdDate1.toString().split("T")[0];
            const year = createdDate1.getFullYear();
            const month = (createdDate1.getMonth() + 1).toString().padStart(2, '0');
            const day = createdDate1.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
    
    const createdDate2 = createdDate1.toLocaleDateString()

    const mealsRef = ref(db, 'meals3');
    const newMealRef = push(mealsRef); // generates a unique ID

    // Save meal ID so we can clean it up later if needed
    localStorage.setItem("tempMealId", newMealRef.key);

    
        
        set(newMealRef, { 
            description: "",
            date: createdDate2,
            group: account,
            id: newMealRef.key
            })
        .then(() =>{
                //alert("added new meal success");
                console.log("Meal added successfully!");
                
                //getGroceries(newMealRef.key);
            })
        .catch(err => {
            //alert("added new meal err");
            customConfirm("Added new meal, error", "Error", false);
            console.error("❌ Error:", err);

        })        

    // Attach event listener for editing this comment

    const textarea = document.getElementById("editTextarea");
    const editDate = document.getElementById("editDate");
    const saveBtn = document.getElementById("saveEditBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");

    textarea.classList="fontSize1em";
    editDate.classList="fontSize1em";
    saveBtn.classList="fontSize1em";
    cancelBtn.classList="fontSize1em";

    // Pre-fill textarea with the comment text
    textarea.value = "";
    editDate.value = formattedDate;

    // Show modal
    modal.style.display = "block";

    // Show step3 (Add grocery)
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const addGroceryBtn = document.getElementById("addGroceryBtn");
    const addQtyText = document.getElementById("addQtyText");
    const addGroceryText = document.getElementById("addGroceryText");
    const saveNewGroceryBtn = document.getElementById("saveNewGroceryBtn");
    const cancelNewGroceryBtn = document.getElementById("cancelNewGroceryBtn");

    if (addGroceryBtn){
        addGroceryBtn.addEventListener("click", () => {
            //Only allow addition of grocery items if there is a meal description
            const mealText = sanitizeInput(textarea.value.trim());
            if (mealText){
                addQtyText.value="";
                addGroceryText.value="";
                step1.style.display = "none";
                step2.style.display = "none";
                step3.style.display = "block";
            } else {
                //alert("You must first enter a meal description");
                customConfirm("You must first enter a meal description", "Description", false);
            }
        });
    }

    //This array is neccessary for deleting grocery items if an addMeal is canceled.
    const groceryArray = [];
    if (saveNewGroceryBtn){
        saveNewGroceryBtn.addEventListener("click", () => {
            
            //populate the text boxes
            const newQty = addQtyText.value;//Need to make sure this is a quantity
            const newText = addGroceryText.value;
            const mealText = sanitizeInput(textarea.value.trim());
            if (newText && newQty) {

                const groceryRef = ref(db, "grocery");
                const newGroceryRef = push(groceryRef); // generates a unique ID
                set(newGroceryRef, {
                    checkedOff: "",
                    description: newText,
                    group: group,
                    mealDesc: mealText,
                    mealId: newMealRef.key,
                    qty: newQty,
                    thisId: newGroceryRef.key
                }).then(() => {
                    //Add new grocery id to the array of new grocery items
                    groceryArray.push(newGroceryRef.key);
                    //Add the grocery list
                    getGroceries(newMealRef.key)
                    setupGroceryEditControls();
                    console.log("+ Grocery item added Successfully!");
                    step1.style.display = "block";
                    step2.style.display = "none";
                    step3.style.display = "none";
                })
                .catch(err => console.error("❌ Error:", err))
            }else{
                //alert("You must provide a quantity and a Grocery Item Desription.");
                customConfirm("You must provide a quantity and a Grocery Item Desription.", "Qty & Grocery Description", false);
            }
        });
    }

    if (cancelNewGroceryBtn){
        cancelNewGroceryBtn.addEventListener("click", () => {
            step1.style.display = "block";
            step2.style.display = "none";
            step3.style.display = "none";
        });
    }


    // Save new text
    saveBtn.onclick = () => {
        const newText = sanitizeInput(textarea.value.trim());
        const newDate = editDate.value;

        // Convert to Date object
        const dateObj = new Date(newDate);
        // Add 13 hours to the date so it shows up on the correct date. Otherwise the date in firebase will be "2025-03-07T00:00:00.000Z" and show up in the app as 3/6/2025.
        dateObj.setHours(dateObj.getHours() + 13);


        // Format to date only (no time)
        const dateOnly = dateObj.toISOString();
        if (newText && dateOnly) {
            const MealRef = ref(db, "meals3/" + newMealRef.key);
            set(MealRef, {
                date: dateOnly,
                description: newText,
                group: account,//already added
                id: newMealRef.key//already added
            }).then(() => {
                console.log("✏️ Meal updated");
                //Must remove from localStorage so it is not deleted when we leave the page (beforeunload)
                localStorage.removeItem("tempMealId");
                let webPage = localStorage.getItem("webPage");
                if(webPage){
                    window.location.href=webPage;
                }
                
            }).catch(err => console.error("❌ Error:", err));
        }else{
            customConfirm("You must have both a date and a meal description to save!", "Saving Error", false);
        }
    };

    // Cancel closes modal
    cancelBtn.onclick = () => {
        //Delete the meal I created if i cancel
        const mealDeleteRef = ref(db, "meals3/" + newMealRef.key);
        remove(mealDeleteRef).then(() => console.log("🗑️ meal deleted: "+ newMealRef.key));
        modal.style.display = "none";
        let webPage = localStorage.getItem("webPage");
        if(webPage){
            window.location.href=webPage;
        }
        //Delete the grocery items I created if i cancel
        groceryArray.forEach(groceryId=>{
            const groceryDeleteRef = ref(db, "grocery/" + groceryId);
            remove(groceryDeleteRef).then(() => console.log("🗑️ grocery item deleted: "+ groceryId));
        })
        
        //Must remove from localStorage so it won't try to delete again when we leave the page (beforeunload)
        localStorage.removeItem("tempMealId");
        window.location.href=webPage;
    };

    }catch (error) {
        console.log("Stack trace:", error.stack);     // where the error happened
        console.log("Error message:", error.message); // just the message
        //alert("Full error:"+ error);        // logs the full Error object
        customConfirm("Full error:"+ error, "Error", false);
    }       
}
// Bind to button in JS
document.addEventListener("DOMContentLoaded", () => {
    
    loadAddMeal();
});

// Clean up temp meal if user leaves without saving
/*
window.addEventListener("beforeunload", () => {
    const tempMealId = localStorage.getItem("tempMealId");
    if (tempMealId) {
        console.log("🗑️ Auto-cleaning meal:", tempMealId);
        const mealDeleteRef = ref(db, "meals3/" + tempMealId);
        remove(mealDeleteRef).catch(err => console.error("❌ Cleanup error:", err));
        localStorage.removeItem("tempMealId");
    }
});
*/
window.addEventListener("pagehide", (event) => {
    const tempMealId = localStorage.getItem("tempMealId");
    if (tempMealId) {
        console.log("🗑️ Auto-cleaning meal:", tempMealId);
        const mealDeleteRef = ref(db, "meals3/" + tempMealId);
        remove(mealDeleteRef).catch(err => console.error("❌ Cleanup error:", err));
        localStorage.removeItem("tempMealId");
    }
});
