

// login
function logIn(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    if (msg) msg.innerText = "";

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
                showInlineError(data.detail[0].msg);
                return null;
            }
            if (typeof data.detail === "string") {
                showInlineError(data.detail);
                return null;
            }
            showInlineError("Login failed");
            return null;
        }
        return data;
    })
    .then(data => {
        if (!data) return;

        // Save tokens to sessionStorage
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token); 
        
        console.log("Tokens saved successfully");
        
        showNotification("success", "Login Successfully!..");
    })
    .catch(err => {
        console.error("Fetch error:", err);
        showNotification("error", "Server error. Try again later.");
    });
}


// inline errors message on #msg

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


// password hide and show functionaly in login


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


// Model message showing on Success or Failed..

function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");

    if (!modalEl) {
        console.warn("notifyModal not found in HTML");
        if (type === "success") window.location.href = "/createticket";
        return;
    }

    const modal = new bootstrap.Modal(modalEl);
    const modalBox = document.getElementById("modalBox");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");

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
    }

    modal.show();

    if (type === "success") {
        setTimeout(() => {
            window.location.href = "/createticket"; 
        }, 2000);
    } else {
        setTimeout(() => {
            modal.hide();
        }, 2500);
    }
}

// back button
function goBack() { 
    window.location.href = '/'; 
}


