/**
 * user_login.js
 */

function logIn(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

<<<<<<< HEAD
    msg.innerText = "";


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!emailRegex.test(email)) {
        showInlineError("Please enter a valid email address");
        return;
    }

    if (!passwordRegex.test(password)) {
        showInlineError("Password must be at least 8 characters with uppercase, lowercase and number");
        return;
    }

=======
    if (msg) msg.innerText = "";
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467

    if (!email || !password) {
        showInlineError("All fields are required");
        return;
    }

    fetch("http://127.0.0.1:8000/user/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            if (Array.isArray(data.detail)) {
<<<<<<< HEAD
                
                const errObj = data.detail[0];
                let cleanMsg = errObj.msg.replace(/^Value error, /i,"");

                if (errObj.type === "value_error") {
                showInlineError(cleanMsg);
                throw "handled";
            }

                //other validation errors
                showInlineError(cleanMsg);
                throw "handled";
            }


            if (typeof data.detail === "string") {
                let cleanMsg = data.detail.replace(/^Value error, /i, "");
                showInlineError(cleanMsg);
                throw "handled";
            }

            // Unkown server err
            throw "server";
=======
                showInlineError(data.detail[0].msg);
                return null;
            }
            if (typeof data.detail === "string") {
                showInlineError(data.detail);
                return null;
            }
            showInlineError("Login failed");
            return null;
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
        }
        return data;
    })
    .then(data => {
        if (!data) return;

        // Save tokens to sessionStorage
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token); 
        
        console.log("Tokens saved successfully");
        // This call will now work because the function is defined below
        showNotification("success", "Login Successfully!..");
<<<<<<< HEAD


        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        setTimeout(()=>{
            window.location.href ="/createticket"
        },2000)
    })
    .catch(err => {
        console.error("Fetch error:", err);
        if(err === "handled") return;
        showNotification("error", "Server error. Login Failed!");
    });

=======
    })
    .catch(err => {
        console.error("Fetch error:", err);
        showNotification("error", "Server error. Try again later.");
    });
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
}

/**
 * UI HELPER FUNCTIONS - Defined outside logIn to avoid ReferenceErrors
 */

function showInlineError(message) {
    const msg = document.getElementById("msg");
    if (!msg) return;

    msg.innerText = message;
    msg.style.color = "red";
    msg.style.opacity = "1";

    setTimeout(() => {
        msg.style.opacity = '0';
        msg.innerText = "";
    }, 5000);
}

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const icon = document.getElementById("toggleIcon");
    if (!passwordInput || !icon) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
}

function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");
<<<<<<< HEAD
    const modal = new bootstrap.Modal(modalEl);

=======
    
    // Safety check: if the modal doesn't exist in HTML, redirect immediately
    if (!modalEl) {
        console.warn("notifyModal not found in HTML");
        if (type === "success") window.location.href = "/createticket";
        return;
    }

    const modal = new bootstrap.Modal(modalEl);
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
    const modalBox = document.getElementById("modalBox");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");

<<<<<<< HEAD
    modalMessage.innerText = message;

    if (type === "success") {
        modalBox.className = "modal-content text-center p-4 custom-notify border-0";
        modalBox.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
        modalMessage.style.color = "white";
        modalIcon.className = "bi bi-check-circle-fill fs-1 mb-2 text-white";
    } else {
        modalBox.className = "modal-content text-center p-4 border-0";
        modalBox.style.background = "linear-gradient(135deg,#ef4444,#b91c1c)";
        modalMessage.style.color = "white";
        modalIcon.className = "bi bi-exclamation-circle-fill fs-1 mb-2 text-white";
=======
    if (modalMessage) modalMessage.innerText = message;

    if (type === "success") {
        if (modalBox) {
            modalBox.className = "modal-content text-center p-4 custom-notify border-0";
            modalBox.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
        }
        if (modalMessage) modalMessage.style.color = "white";
        if (modalIcon) modalIcon.className = "bi bi-check-circle-fill fs-1 mb-2 text-white";
    } else {
        if (modalBox) {
            modalBox.className = "modal-content text-center p-4 border-0";
            modalBox.style.background = "linear-gradient(135deg,#ef4444,#b91c1c)";
        }
        if (modalMessage) modalMessage.style.color = "white";
        if (modalIcon) modalIcon.className = "bi bi-exclamation-circle-fill fs-1 mb-2 text-white";
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
    }

    modal.show();

<<<<<<< HEAD
    setTimeout(() => {
        modal.hide();
    }, 2000);
=======
    if (type === "success") {
        setTimeout(() => {
            window.location.href = "/createticket"; 
        }, 2000);
    } else {
        setTimeout(() => {
            modal.hide();
        }, 2500);
    }
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
}


function goBack() { 
    window.location.href = '/'; 
}