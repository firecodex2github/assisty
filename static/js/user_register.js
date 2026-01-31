
// signup
function signUp(event) {
    event.preventDefault();

    const fullname = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm_password = document.getElementById("confirmPassword").value.trim();
    const msg = document.getElementById("msg");

    msg.innerText = "";

    if (!fullname || !email || !password || !confirm_password) {
        showInlineError("All fields are required");
        return;
    }

    if (password !== confirm_password) {
        showInlineError("Password and Confirm Password do not match");
        return;
    }

    fetch("http://127.0.0.1:8000/user/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullname,
            email,
            password,
            confirm_password
        })
    })
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
    
    if (Array.isArray(data.detail)) {
        const errObj = data.detail[0];

        
        let cleanMsg = errObj.msg.replace(/^Value error, /i, "");

        if (errObj.type === "value_error") {
            showInlineError(cleanMsg);
            throw "handled";
        }

        showInlineError(cleanMsg);
        throw "handled";
    }

    if (typeof data.detail === "string") {
        
        let cleanMsg = data.detail.replace(/^Value error, /i, "");
        showInlineError(cleanMsg);
        throw "handled";
    }

    throw "server";
}

        return data;
    })
    .then(() => {
        showNotification("success", "Registration Successfully!..");

        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
    })
    .catch(err => {
        console.error(err);
        if (err === "handled") return;
        showNotification("error", "Registration Failed!");
    });
}

// inline errors showing on #msg
function showInlineError(message) {
    const msg = document.getElementById("msg");

    msg.innerText = message;
    msg.style.color = "red";
    msg.style.opacity = "1";

    setTimeout(() => {
        msg.style.opacity = "0";
        msg.innerText = "";
    }, 5000);
}


// password hide and show functionaly

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const icon = document.getElementById("toggleIcon");

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


// confirm-password hide and show functionaly

function toggleConfirmPassword() {
    const confirmInput = document.getElementById("confirmPassword");
    const icon = document.getElementById("toggleConfirmIcon");

    if (confirmInput.type === "password") {
        confirmInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        confirmInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
}

// Model message showing on Success or Failed..
function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");
    const modal = new bootstrap.Modal(modalEl);

    const modalBox = document.getElementById("modalBox");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");

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
    }

    modal.show();

    setTimeout(() => {
        modal.hide();
    }, 2000);
}



// back button
function goBack() { 
    window.location.href = '/'; 
}