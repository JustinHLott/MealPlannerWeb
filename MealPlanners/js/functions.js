import { getDatabase, get, ref, query, orderByChild, equalTo
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB
import { app } from "./firebaseAuth.js";

const db = getDatabase(app);

export async function getNextDate(account){
    const mealDateRef = ref(db, 'meals3');
    const mealsArray = [];
    const q = await query(mealDateRef, orderByChild("group"), equalTo(account));
    return get(q).then(snapshot => {
        // Collect comments into an array
        
        snapshot.forEach((child) => {
            mealsArray.push({ id: child.key, ...child.val() });
        })
            // Sort by updatedAt descending (latest first)
            mealsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestDate = mealsArray[0]?.date;
            if(latestDate===undefined){
                //alert(new Date());
                return new Date();//The current date
            }else{
                //alert("latestDate: " + latestDate);
                return latestDate;
            }
    });
}

export async function getPreviousDate(account){
    console.log("Made it to GetPreviousDate: "+ account)
    const mealDateRef = ref(db, 'meals3');
    const mealsArray = [];
    const q = await query(mealDateRef, orderByChild("group"), equalTo(account));
    return get(q).then(snapshot => {
        // Collect comments into an array
        
        snapshot.forEach((child) => {
            mealsArray.push({ id: child.key, ...child.val() });
        })
            // Sort by updatedAt ascending (earliest first)
            mealsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
            const earliestDate = mealsArray[0]?.date;
            if(earliestDate===""){
                //alert(new Date());
                return new Date();//The current date
            }else{
                console.log("earliestDate: " + earliestDate);
                return earliestDate;
            }
    });
}

/*
function currentWeek(){
    //alert("Current Week");
}

// Make it available to inline onclick
window.currentWeek = currentWeek;
*/

export function sanitizeInput(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

//load the header and footer and other custom components
export async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (el) {
    const html = await fetch(path).then(r => r.text());
    el.innerHTML = html;
  }
}