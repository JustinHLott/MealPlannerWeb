import { auth } from "./firebaseAuth.js";
import { app } from "./firebaseAuth.js";
import { sanitizeInput } from "./functions.js";
// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, push, set//, serverTimestamp
        //, update
        , query, orderByChild, equalTo, get, onValue, remove
        } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";// if using Realtime DB
import { showLoading, hideLoading } from "./loading.js";

var theUser;
var userId;
export let theUserId="";

const db = getDatabase(app);

const idEmail = document.getElementById("emailAddress");
const idPassword = document.getElementById("userPassword");

// Example: Create a new user
export function createUser(){
  var email = sanitizeInput(document.getElementById("emailAddress").value.trim().toLowerCase());
  var password = sanitizeInput(document.getElementById("userPassword").value);
  var emailC = sanitizeInput(document.getElementById("emailAddressCreate").value.trim().toLowerCase());
  var passwordC = sanitizeInput(document.getElementById("userPasswordCreate").value);
  var passwordC2 = sanitizeInput(document.getElementById("userPasswordCreate2").value);
  const theDiv = document.getElementById("divLogInOrCreate");
  

  try{
    if(emailC !="" && passwordC.trim() !="" && passwordC2.trim() !="" && passwordC === passwordC2){
      createUserWithEmailAndPassword(auth, emailC, passwordC)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          theUser = user;
          theUserId = user.uid;
          //alert("email" + user.email.toLowerCase());
          

          //Set the email in local storage:
          localStorage.setItem("email",user.email.toLowerCase());
          localStorage.setItem(user.email.toLowerCase()+"_"+"password", passwordC.trim());

          //create initial group/account for user
          createAccount(user.email.toLowerCase(), theDiv, user.uid);

        })
        .catch((error) => {
          theUserId = error.message;
          console.error("Error:", error.code, error.message);
          document.getElementById("status").textContent = theUserId;
          theDiv.style.display = "block"; // show
        });
    }else if(emailC.trim() ===""){
      document.getElementById("status").textContent = "❌ Error: email cannot be empty!";
    }
    else if(passwordC.trim() ===""){
      document.getElementById("status").textContent = "❌ Error: password cannot be empty!";
    }
    else if(passwordC2.trim() ===""){
      document.getElementById("status").textContent = "❌ Error: password2 cannot be empty!";
    }
    else if(passwordC.trim() != passwordC2.trim()){
      document.getElementById("status").textContent = "❌ Error: passwords must match!";
    }
    else{
      document.getElementById("status").textContent = "❌ Error: input cannot be empty!";
    }
  }
  catch{

  }
  
};


function createAccount(email, theDiv, uid){
  //alert("email" + email);
  const groupRef = ref(db, "groups");
  const newGroupRef = push(groupRef); // generates a unique ID
  set(newGroupRef, {
      date: Date(),
      email: email,
      group: email,
      groupId: newGroupRef.key,
      id: newGroupRef.key
  }).then(() => {
      //alert("+ Initial Group not added yet!");
      //Set the account in local storage:
      localStorage.setItem(email.toLowerCase()+"_"+"group", newGroupRef.key);
      //alert("+ Initial Group added Successfully!");
      document.getElementById("status").textContent = "✅ Logged in as: " + email;
      console.log("User created:", uid);
      theDiv.style.display = "none"; // hide
      window.location.href = "index.html"; // redirect to index page
  })
  .catch((err) => {
    console.error("❌ Error:", err);
  })
}


// Login user
export function logIn(){
  var email = document.getElementById("emailAddress").value.trim().toLowerCase();
  var password = document.getElementById("userPassword").value;
  const theDiv = document.getElementById("divLogInOrCreate");

  var theUserId;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      theUser = user;
      theUserId = user.uid;
      //Set the email in local storage:

          localStorage.setItem("email", user.email.toLowerCase());
          localStorage.setItem(user.email.toLowerCase()+"_"+"password", password);
      document.getElementById("status").textContent = "✅ Logged in as: " + user.email;
      console.log("User logged in:", user);
      theDiv.style.display = "none"; // hide
      window.location.href = "index.html"; // redirect to index page
    })
    .catch((error) => {
      document.getElementById("status").textContent = "❌ Error: " + error.message;
      console.error("Login failed:", error.code, error.message);
      theDiv.style.display = "block"; // show
    });
  };

  export function toggleLogIn() {
  const divCreate = document.getElementById("createUserDiv");
  const divLogIn = document.getElementById("logInDiv");
  const theButton = document.getElementById("chooseNewUser");
  if (divCreate.style.display === "none") {
    divCreate.style.display = "block"; // show
    divLogIn.style.display = "none"; // hide
    theButton.value = "Log In Instead"; //Change button text
  } else {
    divCreate.style.display = "none"; // hide
    divLogIn.style.display = "block"; // show
    theButton.value = "Create New User"; //Change button text
  }
}

export function turnOnLogInAndCreate() {
  const theDiv = document.getElementById("divLogInOrCreate");

  theDiv.style.display = "block"; // show
  theDiv.style.display = "none"; // hide

}


document.addEventListener("DOMContentLoaded", () => {
  showLoading(); // 🔄 show immediately when page starts

  // Listen for auth state (to check if logged in or logged out)
  onAuthStateChanged(auth, (user) => {
    //const theDiv = document.getElementById("divLogInOrCreate");
    if (user) {
      theUserId = user.uid;
      if(document.getElementById("status")){
        document.getElementById("status").textContent = `✅ Logged in as ${user.email}`;
      }
      

      const myDiv = document.getElementById("divLogInOrCreate")
      if(myDiv){
        myDiv.style.display = "none";
      } else {
      console.warn("myDiv not found in the DOM yet!");
      }


      const myDiv2 = document.getElementById("logoutBtn")
      if(myDiv2){
        myDiv2.style.display = "block"; // show
      }
      //theDiv.style.display = "none"; // hide
    } else {
      if(document.getElementById("status")){
        document.getElementById("status").textContent = "❌ Not logged in";
      }
      
      const myDiv3 = document.getElementById("logoutBtn")
      if(myDiv3){
        myDiv3.style.display = "none"; // hide
      }
      //theDiv.style.display = "block"; // show
    }
    hideLoading(); // ✅ hide when ready
  });


  if (document.getElementById("togglePassword")) {
    togglePass("userPasswordCreate", "togglePassword");
  }

  if (document.getElementById("togglePassword2")) {
    togglePass("userPasswordCreate2", "togglePassword2");
  }

  if (document.getElementById("togglePasswordLogin")) {
    togglePass("userPassword", "togglePasswordLogin");
  }
//reset
  if (document.getElementById("togglePasswordReset")) {
    togglePass("inputPasswordReset", "togglePasswordReset");
  }
  
});

function togglePass(txt, btn) {
  const button = document.getElementById(btn);
  const pwd = document.getElementById(txt);

  console.log("Looking for:", { txt, btn, button, pwd });

  if (button && pwd) {
    button.addEventListener("click", () => {
      pwd.type = pwd.type === "password" ? "text" : "password";
    });
  } else {
    console.warn("❌ Missing element:", { txt, btn });
  }
}


// Logout button action
export function logOut() {
  const theDiv = document.getElementById("divLogInOrCreate");
  document.getElementById("emailAddress").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("emailAddressCreate").value = "";
  document.getElementById("userPasswordCreate").value = "";
  signOut(auth)
    .then(() => {
      document.getElementById("status").textContent = "✅ Successfully logged out";
      theDiv.style.display = "block"; // show
      theUser = null;
      const email=localStorage.getItem("email");
      localStorage.removeItem(email.toLowerCase()+"_"+"password");
      localStorage.removeItem("email");
      
      console.log("User signed out.");
    })
    .catch((error) => {
      document.getElementById("status").textContent = "❌ Error logging out: " + error.message;
      console.error("Logout error:", error);
    });
    
  };

  //send reset password email
  function resetPassword() {
    const email = document.getElementById("emailInput").value;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        //alert("✅ Password reset email sent! Check your inbox.");
        customConfirm("✅ Password reset email sent! Check your inbox.", "Notification", false);
      })
      .catch((error) => {
        console.error("❌ Error sending reset email:", error.message);
      });
  }

  // Parse the `oobCode` from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get("oobCode");

  // Example: when user submits a new password
  function updatePassword() {
    const newPassword = document.getElementById("newPasswordInput").value;

    confirmPasswordReset(auth, oobCode, newPassword)
      .then(() => {
        //alert("✅ Password has been reset successfully!");
        customConfirm("✅ Password has been reset successfully!", "Notification", false);
        // Redirect user to login page
        window.location.href = "/login.html";
      })
      .catch((error) => {
        console.error("❌ Error resetting password:", error.message);
      });
  }

// Bind to button in JS
const btn1 = document.getElementById("chooseNewUser");
if (btn1){
  btn1.addEventListener("click", () => {
  toggleLogIn();
});}
const btn2 = document.getElementById("createUser");
if (btn2){
  btn2.addEventListener("click", () => {
  createUser();
});}
const btn3 = document.getElementById("logIn")
if (btn3){
  btn3.addEventListener("click", () => {
  logIn();
});}
const btn4 = document.getElementById("logoutBtn")
if (btn4){
  btn4.addEventListener("click", () => {
  logOut();
});}








