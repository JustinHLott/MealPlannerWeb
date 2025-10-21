export function customConfirm(message, title = "Confirm", confirmYN = true, HTTP="") {
    
  return new Promise((resolve) => {
    const overlay = document.getElementById("customConfirm");
    const msg = document.getElementById("confirmMessage");
    const ttl = document.getElementById("confirmTitle");
    const btnOk = document.getElementById("confirmOk");
    const btnCancel = document.getElementById("confirmCancel");
    const step1 = document.getElementById("step1");

    msg.textContent = message;
    ttl.textContent = title;
    overlay.style.display = "flex";

    if(confirmYN){
        //This is the default (To show the cancel button)
        btnCancel.style.display = "flex"
    }else{
        btnCancel.style.display = "none"
    }

    // cleanup old listeners
    const cleanup = () => {
      overlay.style.display = "none";
      btnOk.removeEventListener("click", onOk);
      btnCancel.removeEventListener("click", onCancel);
    };

    const onOk = () => {
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    btnOk.addEventListener("click", onOk);
    btnCancel.addEventListener("click", onCancel);
  });
}
