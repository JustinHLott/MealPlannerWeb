import { getDatabase, ref, push, set//, serverTimestamp
    //, update
    , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebaseAuth.js";
import { app } from "./firebaseAuth.js";
import { customConfirm } from "./confirmModal.js";
//import { serverTimestamp } from "firebase/database";


const db = getDatabase(app);
const email = localStorage.getItem("email");
let group = localStorage.getItem(email.toLowerCase()+"_"+"group");

console.log(`🗄️ group: ${group}`);

//load the header and footer
async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (el) {
    const html = await fetch(path).then(r => r.text());
    el.innerHTML = html;
  }
}

(async () => {
  loadComponent("footerComponent", "components/footer.html"); // can load anytime
  await loadComponent("headerComponent", "components/header.html");
  await loadComponent("expandHeader", "components/buttonsGrocerySorting.html");
  await loadComponent("custom-confirm", "components/custom-confirm.html"); //
})();


//Get comments
export async function getTheGroceries(sortBy = "key") {
    //alert("Made it to get TheGroceries");
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    var group = "";
    const email = localStorage.getItem("email");
    group = localStorage.getItem(email.toLowerCase()+"_"+"group");
   
    if(group){
        console.log(`groceryItems, got the account: ${group}`);
        
    }else{
        //alert("No item in: " + group);
        customConfirm("No item in: " + group, "Group?", false);
        window.location.href = "getGroup.html";
    }


    const groceryRef = ref(db, 'grocery');
    const q = query(groceryRef, orderByChild("group"), equalTo(group));

    //const snapshot = await get(q);

    const container = document.getElementById("theGroceries");
    let tabIndex = 0;

    //The onValue code makes the website update realtime on other people's phones when you make an update.
    onValue(q, (snapshot) => {
        let currentGroceryItem = null; // store the grocery item being edited
        // clear out old comments
        container.innerHTML = "";
        if (snapshot.exists()) {
            // Collect comments into an array
            const groceryArray = [];
            snapshot.forEach((child) => {

            groceryArray.push({ key: child.key, ...child.val() });
            // Sort by updatedAt ascending (oldest first)
            // Flip order so latest is first
            groceryArray.reverse();
            
            // Add sorting logic
            if(sortBy === "key"){
                //console.log("Sorting by key (default order)");
            }

            if (sortBy === "description") {
                groceryArray.sort((a, b) => {
                const nameA = (a.description || "").toLowerCase();
                const nameB = (b.description || "").toLowerCase();
                return nameA.localeCompare(nameB);
                });
            }

            if (sortBy === "mealDesc") {
                groceryArray.sort((a, b) => {
                const nameA = (a.mealDesc || "").toLowerCase();
                const nameB = (b.mealDesc || "").toLowerCase();
                return nameA.localeCompare(nameB);
                });
            }
            
        });


            // Render each comment
            groceryArray.forEach((groceryItem) => {

                
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
                    //Add Button to line1 to delete grocery item
                    const delete_line1 = document.createElement("Button");
                    delete_line1.class = "day";
                    delete_line1.id="deleteGroceryBtn";
                    delete_line1.textContent = `🗑️`;
                    delete_line1.style="background: darkblue; font-size: 1.2em;padding-left: 0; padding-right:0; padding-top: 0; padding-bottom:2px;"
                    line1.appendChild(delete_line1);
                    //Add 3 space bwtween spans
                    line1.appendChild(document.createTextNode("\u00A0\u00A0\u00A0"));



                    //Add 1st span to line1 for grocery item qty
                    const span1_line1 = document.createElement("span");
                    span1_line1.textContent = `${groceryItem.qty}`;
                    line1.appendChild(span1_line1);
                    //Add 3 space bwtween spans
                    line1.appendChild(document.createTextNode("\u00A0\u00A0\u00A0"));
                    //Add 2nd span to line1 for grocery item description
                    const span2_line1 = document.createElement("span");
                    span2_line1.textContent = `${groceryItem.description.replace(/&#039;/g,"'").replace(/&quot;/g,'"')}`;
                    span2_line1.style="text-wrap-style:auto; font-size: 1em; border-collapse: collapse; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"
                    line1.appendChild(span2_line1);
                //line1.appendChild(line1p);
                divC.appendChild(line1);
                //Add the second row div
                const line2 = document.createElement("div");
                line2.class="row";
                    //Add 1st span to line2 for meal description associated with grocery item
                    const span1_line2 = document.createElement("span");
                    span1_line2.style="text-wrap-style:auto; font-size: .7em; border-collapse: collapse; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"
                    span1_line2.textContent = `${groceryItem.mealDesc.replace(/&#039;/g,"'").replace(/&quot;/g,'"')}`;
                    line2.appendChild(span1_line2);
                divC.appendChild(line2);


                //Add a button to the card
                const modal = document.getElementById("editModal");
                
                const editQty = document.getElementById("editQty");
                const editTextDescription = document.getElementById("editText");
                const addGroceryBtn = document.getElementById("addGroceryBtn");
                const saveBtn = document.getElementById("saveEditBtn");
                const cancelBtn = document.getElementById("cancelEditBtn");
                const deleteBtn = document.getElementById("deleteEditBtn");
                const footer = document.getElementsByTagName("footer")[0];

                editTextDescription.classList="fontSize1em"
                editQty.classList="fontSize1em"
                saveBtn.classList="fontSize1em"
                cancelBtn.classList="fontSize1em"
                deleteBtn.classList="fontSize1em"

                // Attach event listener for deleting groceryItem
                delete_line1.addEventListener("click", async (event) => {
                    event.stopPropagation(); // 🛑 prevent parent divC click
                    if (!groceryItem) {
                        //alert("No groceryItem selected.");
                        customConfirm("No grocery item selected", "Grocery Item?", false);
                        return;
                    }
                    const groceryItemDesc = groceryItem.description;
                    const ok = await customConfirm(`Are you sure you want to delete groceryItem, "${groceryItemDesc}"?`, "Delete Grocery")
                    if (ok) {
                        
                        const grocRef = ref(db, "grocery/" + groceryItem.key);
                        
                        remove(grocRef).then(() => {console.log(`🗑️ groceryItem "${groceryItemDesc}" deleted`);});

                        modal.style.display = "none";
                        footer.style.display = "flex";
                    }else{
                        //alert("Delete canceled from top")
                        modal.style.display = "none";
                        footer.style.display = "flex";
                        //alert("Modal hidden");
                    }
                });

                // Attach event listener for editing this comment
                divC.addEventListener("click", () => {
                    
                    // Remember which item we’re editing
                    currentGroceryItem = groceryItem;

                    // Pre-fill editTextDescription with the comment text
                    editTextDescription.value = groceryItem.description;
                    editQty.value = groceryItem.qty;

                    // Show modal
                    modal.style.display = "block";
                    footer.style.display = "none";
                });

                    // Show step3 (Add grocery)
                    

                    if (addGroceryBtn){
                        addGroceryBtn.onclick = () => {
                            addQtyText.value="";
                            addGroceryText.value="";
                            step1.style.display = "none";
                            step2.style.display = "none";
                            step3.style.display = "block";
                        };
                    }
                    
                    if (cancelNewGroceryBtn){
                        cancelNewGroceryBtn.onclick = () => {
                            step1.style.display = "block";
                            step2.style.display = "none";
                            step3.style.display = "none";
                        };
                    }


                    
                //});















    //when saving a meal desc, meal desc needs to be changed in all grocery items also
    // Save new text
                        saveBtn.onclick = () => {
                            if (!currentGroceryItem) {
                                //alert("No groceryItem selected.");
                                customConfirm("No groceryItem selected.", "Grocery Item?", false);
                                return;
                            }
                            const newText = editTextDescription.value.trim();
                            const newQty = editQty.value;
                            //alert("Made it to add grocery2");

                            if (newText && newQty) {
                                const commentRef = ref(db, "grocery/" + currentGroceryItem.key);
                                set(commentRef, {
                                    ...currentGroceryItem,
                                    qty: newQty,
                                    description: newText
                                }).then(() => {
                                    console.log("✏️ currentGroceryItem updated");
                                    
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
                            if (!currentGroceryItem) {
                                ustomConfirm("No groceryItem selected.", "Grocery Item?", false);
                                return;
                            }
                            const groceryDesc = currentGroceryItem.description;
                            const ok = await customConfirm(`Are you sure you want to delete grocery item, "${groceryDesc}"?`, "Delete Grocery");
                            if (ok) {
                                
                                const groceryRef = ref(db, "grocery/" + currentGroceryItem.key);
                                
                                remove(groceryRef).then(() => {console.log(`🗑️ groceryItem "${groceryDesc}" deleted`);});
                                
                                
                                modal.style.display = "none";
                                footer.style.display = "flex";
                            }
                            
                        };


            });

        } else {
            console.log("No groceryItems found");
            document.getElementById("theGroceries").textContent = "No Grocery Items found";
        }
    });
} 
document.addEventListener("DOMContentLoaded", () => {
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    
    const addQtyText = document.getElementById("addQtyText");
    const addGroceryText = document.getElementById("addGroceryText");
    const saveNewGroceryBtn = document.getElementById("saveNewGroceryBtn");
    const cancelNewGroceryBtn = document.getElementById("cancelNewGroceryBtn");

    if (saveNewGroceryBtn){
        saveNewGroceryBtn.onclick = () => {
            
            //populate the text boxes
            alert("Made it to add grocery");
            const newQty = addQtyText.value;//Need to make sure this is a quantity
            const newText = addGroceryText.value;
            const email = localStorage.getItem("email");
            let group = localStorage.getItem(email.toLowerCase()+"_"+"group");

            if (newText && newQty) {

                const commentRef = ref(db, "grocery");
                const newCommentRef = push(commentRef); // generates a unique ID
                set(newCommentRef, {
                    checkedOff: "",
                    description: newText,
                    group: group,
                    mealDesc: groceryItem.description,
                    mealId: groceryItem.key,
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
                customConfirm("You must provide a quantity and a Grocery Item Desription.", "Grocery Item?", false);
            }
        };
       getTheGroceries(); 
    }
});
    

