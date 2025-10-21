import { getDatabase, ref, push, set//, serverTimestamp
    //, update
    , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { app } from "./firebaseAuth.js";
import { sanitizeInput } from "./functions.js";

//To update the app hosted in firebase put this in the powershell terminal:
//   firebase deploy --only hosting:mealplanners
//Then press enter

const db = getDatabase(app);

//Get comments
function loadAddGroceryItem() {

    console.log(`Made it to loadAddMeal`);
    //alert(`Made it to loadAddMeal`);
    const email = localStorage.getItem("email");
    let group = localStorage.getItem(email.toLowerCase()+"_"+"group");
    if(group){
        console.log(`addMeal, got the account: ${group}`);
        addGroceryItem1(group);
    }else{
        window.location.href = "getGroup.html";
    }
}
    

//How it works: create an empty meal to start at load then i can add groceries to the empty meal. Delete the meal & groceries if they press cancel.
//Adding comments


function addGroceryItem1(account){
    //ensure user is logged in    
    const user = auth.currentUser;
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Logged in as:", user.uid);
            // Clear the grocery item qty
            document.getElementById("addQtyText").value = "";
            // Clear the meal description
            document.getElementById("addGroceryText").value = "";
            // Now safe to call

                addGroceryItem2(account);
           
            
        } else {
            console.log("❌ No user logged in");
            // Maybe redirect to login.html here
        }
    });
}

function addGroceryItem2(account) {
    //alert("Made it to addMeal2")
    try{

    const groceriesRef = ref(db, 'grocery');
    const newGroceryItemRef = push(groceriesRef); // generates a unique ID

    // Save meal ID so we can clean it up later if needed
    localStorage.setItem("tempGroceryItemId", newGroceryItemRef.key);

    
        
    set(newGroceryItemRef, { 
        checkedOff:     "",
        description:    "",
        group:          account,
        id:             newGroceryItemRef.key,
        mealDesc:       "NO MEAL",
        mealId:         1,
        qty:            "",
        thisId:         newGroceryItemRef.key,
    })
    .then(() =>{
            //alert("added new meal success");
            console.log("Grocery Item added successfully!");
            
            //getGroceries(newMealRef.key);
        })
    .catch(err => {
        //alert("added new meal err");
        customConfirm("Added new meal err", "Error", false);
        console.error("❌ Error:", err);

    })        

    // Attach event listener for editing this comment

    const modal = document.getElementById("editModal");

    // Show step3 (Add grocery)
    const step3 = document.getElementById("step3");

    const addQtyText = document.getElementById("addQtyText");
    const addGroceryText = document.getElementById("addGroceryText");
    const saveNewGroceryBtn = document.getElementById("saveNewGroceryBtn");
    const cancelNewGroceryBtn = document.getElementById("cancelNewGroceryBtn");

    addGroceryText.classList="fontSize1em"
    addQtyText.classList="fontSize1em"

    // Pre-fill textarea with the comment text
    addGroceryText.value = "";
    addQtyText.value = "";

    // Show modal
    modal.style.display = "block";

    addQtyText.value="";
    addGroceryText.value="";
    step3.style.display = "block";

    //This array is neccessary for deleting grocery items if an addMeal is canceled.
    const groceryArray = [];
    if (saveNewGroceryBtn){
        saveNewGroceryBtn.addEventListener("click", () => {
            //alert("Made it to add grocery3");
            //customConfirm("Made it to add grocery", "Error", false);
            //populate the text boxes
            const newQty = addQtyText.value;//Need to make sure this is a quantity
            const newText = sanitizeInput(addGroceryText.value.trim());
            if (newText && newQty) {

                const newGroceryRef = ref(db, "grocery/" + newGroceryItemRef.key);
                set(newGroceryRef, {
                    checkedOff:     "",
                    description:    newText,
                    group:          account,
                    id:             newGroceryItemRef.key,
                    mealDesc:       "NO MEAL",
                    mealId:         1,
                    qty:            newQty,
                    thisId:         newGroceryItemRef.key,
                }).then(() => {
                    //Must remove from localStorage so it is not deleted when we leave the page (beforeunload)
                    localStorage.removeItem("tempGroceryItemId");
                    const webPage = localStorage.getItem("webPage");
                    if (webPage) {
                        window.location.href = webPage;
                    }
                    console.log("+ Grocery item added Successfully!");
                })
                .catch(err => console.error("❌ Error:", err))
            }else{
                //alert("You must provide a quantity and a Grocery Item Desription.");
                customConfirm("You must provide a quantity and a Grocery Item Desription.", "Error", false);
            }
        });
    }

    // Cancel closes modal
    cancelNewGroceryBtn.onclick = () => {
        //Delete the meal I created if i cancel
        const grocDeleteRef = ref(db, "grocery/" + newGroceryItemRef.key);
        remove(grocDeleteRef).then(() => console.log("🗑️ grocery item deleted: "+ newGroceryItemRef.key));
        modal.style.display = "none";

        const webPage = localStorage.getItem("webPage");
        if (webPage) {
            window.location.href = webPage;
        }
                
        //Must remove from localStorage so it won't try to delete again when we leave the page (beforeunload)
        localStorage.removeItem("tempGroceryItemId");
        if (webPage) {
            window.location.href = webPage;
        }
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
    
    loadAddGroceryItem();
});

// Clean up temp meal if user leaves without saving
/*
window.addEventListener("beforeunload", () => {
    const tempGroceryItemId = localStorage.getItem("tempGroceryItemId");
    if (tempGroceryItemId) {
        console.log("🗑️ Auto-cleaning grocery item:", tempGroceryItemId);
        const grocDeleteRef = ref(db, "grocery/" + tempGroceryItemId);
        remove(grocDeleteRef).catch(err => console.error("❌ Cleanup error:", err));
        localStorage.removeItem("tempGroceryItemId");
    }
});
*/
window.addEventListener("pagehide", (event) => {
    const tempGroceryItemId = localStorage.getItem("tempGroceryItemId");
    if (tempGroceryItemId) {
        console.log("🗑️ Auto-cleaning grocery item:", tempGroceryItemId);
        const grocDeleteRef = ref(db, "grocery/" + tempGroceryItemId);
        remove(grocDeleteRef).catch(err => console.error("❌ Cleanup error:", err));
        localStorage.removeItem("tempGroceryItemId");
    }
});
