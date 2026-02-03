
/**
 * adminlogin.js
 * Handles Agent/Admin authentication and token storage
 */

function logIn(event) {
    event.preventDefault();

    const username = document.getElementById("uname").value.trim();
    const password = document.getElementById("pass").value.trim();
    const msg = document.getElementById("msg");

<<<<<<< HEAD
    msg.innerText = "";


    const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;


=======
    if (msg) msg.innerText = "";
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467

    if (!username || !password) {
        showInlineError("All fields are required");
        return;
    }

<<<<<<< HEAD

    if (!usernameRegex.test(username)) {
        showInlineError("Username must be min 4 letters (no spaces)");
        return;
    }

    if (!passwordRegex.test(password)) {
        showInlineError("Password must be 8 chars, 1 uppercase, 1 lowercase & 1 number");
        return;
    }



=======
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
    fetch("/agent/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) {
            if (data.detail) {
                showInlineError(typeof data.detail === 'string' ? data.detail : data.detail[0].msg);
                throw "handled";
            }
            throw "server";
        }
        return data;
    })
    .then(data => {
        console.log("Admin Login successful");

        // 1. Save both tokens to sessionStorage
        // Using 'access_token' and 'refresh_token' keys consistently
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);

        showNotification("success", "Agent Login Successfully!..");

<<<<<<< HEAD
        document.getElementById("uname").value = "";
        document.getElementById("pass").value = "";
=======
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
        // 2. Redirect to the admin dashboard after a short delay
        setTimeout(() => {
            window.location.href = '/admin-dashboard';
        }, 1000);
    })
    .catch(err => {
        console.error("Login Error:", err);
        if (err === "handled") return;
        showNotification("error", "Agent Login Failed. Check credentials.");
    });
}

/**
 * UI HELPER FUNCTIONS
 */

function togglePassword() {
    const passwordInput = document.getElementById("pass");
    const icon = document.getElementById("toggleIcon");
    if (!passwordInput || !icon) return;

    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    icon.classList.toggle("bi-eye", !isPassword);
    icon.classList.toggle("bi-eye-slash", isPassword);
}

function showInlineError(message) {
    const msg = document.getElementById("msg");
    if (!msg) return;

    msg.innerText = message;
    msg.style.color = "red";
    msg.style.opacity = "1";
    setTimeout(() => { 
        msg.style.opacity = '0'; 
    }, 5000);
}

function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");
    if (!modalEl) {
        alert(message); // Fallback if modal doesn't exist
        return;
    }

    const modal = new bootstrap.Modal(modalEl);
    const modalBox = document.getElementById("modalBox");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");

    if (modalMessage) modalMessage.innerText = message;

    if (type === "success") {
        if (modalBox) modalBox.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
        if (modalIcon) modalIcon.className = "bi bi-check-circle-fill fs-1 mb-2 text-white";
    } else {
        if (modalBox) modalBox.style.background = "linear-gradient(135deg,#ef4444,#b91c1c)";
        if (modalIcon) modalIcon.className = "bi bi-exclamation-circle-fill fs-1 mb-2 text-white";
    }
    
    if (modalMessage) modalMessage.style.color = "white";
    modal.show();
    setTimeout(() => { modal.hide(); }, 2000);
}

function goBack() { 
    window.location.href = '/'; 
}