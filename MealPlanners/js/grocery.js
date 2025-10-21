import { getDatabase, ref, push, set, update //, serverTimestamp
    //, update
    , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB

import { app } from "./firebaseAuth.js";
import { customConfirm } from "./confirmModal.js";


//To update the app hosted in firebase put this in teh powershell terminal:
//   firebase deploy --only hosting:mealplanners
//Then press enter


const db1 = getDatabase(app);

// keep track of the grocery we’re editing
let currentGroceryId = null;

//document.addEventListener("DOMContentLoaded", () => {
//    setupGroceryEditControls(); // 🔄 show immediately when page starts
//});

// hook up edit/save/cancel buttons once (outside of the rendering loop)
export function setupGroceryEditControls() {
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const editGroceryText = document.getElementById("editGroceryText");
    const editQtyText = document.getElementById("editQtyText");
    const saveGroceryBtn = document.getElementById("saveGroceryBtn");
    const cancelGroceryBtn = document.getElementById("cancelGroceryBtn");

    if (saveGroceryBtn) {
        console.log("Made it to saveGroceryBtn");
        saveGroceryBtn.addEventListener("click", () => {
            console.log("Made it in saveGroceryBtn");
            if (!currentGroceryId) return;

            const newQty = editQtyText.value;
            const newText = editGroceryText.value.trim();

            if (newText && newQty) {
                const groceryRef = ref(db1, "grocery/" + currentGroceryId);
                update(groceryRef, {
                    description: newText,
                    qty: newQty,
                }).then(() => console.log("✏️ Grocery updated"));
            }

            // reset UI
            step1.style.display = "block";
            step2.style.display = "none";
            step3.style.display = "none";
            currentGroceryId = null;
        });
    }

    console.log("Made it to grocery");

    if (cancelGroceryBtn) {
        console.log("Made it to cancelGroceryBtn");
        cancelGroceryBtn.addEventListener("click", () => {
            console.log("Made it in cancelGroceryBtn");
            step1.style.display = "block";
            step2.style.display = "none";
            step3.style.display = "none";
            currentGroceryId = null;
        });
    }
}

// call once at page load
//setupGroceryEditControls();

export async function getGroceries(mealId) {
    //alert("getting groceries");
    const email = localStorage.getItem("email");
    const group = localStorage.getItem(email.toLowerCase()+"_"+"group");

    if (!group) {
        window.location.href = "getGroup.html";
        return;
    }

    const groceryRef = ref(db1, 'grocery');
    const q = query(groceryRef, orderByChild("mealId"), equalTo(mealId));

    //const groceryContainer = document.getElementById("groceryDiv");
    let tabIndex = 0;

    onValue(q, (snapshot) => {
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = ""; // clear old rows first
        if (snapshot.exists()) {
            const groceriesArray = [];
            snapshot.forEach((child) => {
                groceriesArray.push({ id: child.key, ...child.val() });
            });

            // sort alphabetically
            groceriesArray.sort((a, b) => a.description.localeCompare(b.description));

            groceriesArray.forEach((item) => {


                const row = document.createElement("tr");
                tableBody.appendChild(row);

                // qty cell
                const qtyCell = document.createElement("td");
                const groceryQty = document.createElement("span");
                groceryQty.textContent = item.qty;
                groceryQty.id = item.id;
                groceryQty.tabIndex = tabIndex++;
                groceryQty.style.fontSize = "1em";
                qtyCell.appendChild(groceryQty);
                row.appendChild(qtyCell);

                // description cell
                const descCell = document.createElement("td");
                const groceryInput = document.createElement("span");
                groceryInput.textContent = item.description
                    .replace(/&#039;/g, "'")
                    .replace(/&quot;/g, '"');
                groceryInput.id = item.id;
                groceryInput.tabIndex = tabIndex++;
                groceryInput.style.fontSize = "1em";
                descCell.appendChild(groceryInput);
                row.appendChild(descCell);

                // actions cell (delete + edit)
                const actionsCell = document.createElement("td");

                // delete button
                const groceryDelete = document.createElement("input");
                groceryDelete.type = "button";
                groceryDelete.value = "🗑️";
                groceryDelete.style.fontSize = ".9em";
                groceryDelete.style.background = "rgba(255, 255, 255, 0.87)";
                groceryDelete.style.border = "none";
                groceryDelete.style.margin = "0";
                groceryDelete.style.padding="0";
                groceryDelete.onclick = async () => {
                    const ok = await customConfirm(`Are you sure you want to delete grocery item, "${item.description}?"`, "Delete Grocery")
                    if (ok) {
                        const groceryRef1 = ref(db1, "grocery/" + item.id);
                        remove(groceryRef1).then(() =>
                            console.log("🗑️ grocery item deleted")
                        );
                    }
                };
                actionsCell.appendChild(groceryDelete);

                // add some spacing
                actionsCell.appendChild(document.createTextNode(" "));

                // edit button
                const groceryEdit = document.createElement("input");
                groceryEdit.type = "button";
                groceryEdit.value = "✏️";
                groceryEdit.style.fontSize = ".9em";
                groceryEdit.style.background = "rgba(255, 255, 255, 0.87)";
                groceryEdit.style.border = "none";
                groceryEdit.style.margin = "0";
                groceryEdit.style.padding="0";
                groceryEdit.addEventListener("click", () => {
                    const step1 = document.getElementById("step1");
                    const step2 = document.getElementById("step2");
                    const step3 = document.getElementById("step3");
                    const editGroceryText = document.getElementById("editGroceryText");
                    const editQtyText = document.getElementById("editQtyText");
//alert("stop here");
                    step1.style.display = "none";
                    step2.style.display = "block";
                    step3.style.display = "none";

                    currentGroceryId = item.id;
                    editQtyText.value = groceryQty.textContent;
                    editGroceryText.value = groceryInput.textContent.trim();
                });
                actionsCell.appendChild(groceryEdit);

                row.appendChild(actionsCell);
                row.style.width = "100%";
            });

        }
    });
}
