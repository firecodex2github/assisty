
function signUp(event) {
    event.preventDefault();

    const fullname = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm_password = document.getElementById("confirmPassword").value.trim();
    const msg = document.getElementById("msg");

    msg.innerText = "";

    const nameRegex = /^[A-Za-z ]{3,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

    if (!fullname || !email || !password || !confirm_password) {
        showInlineError("All fields are required");
        return;
    }

    if (!nameRegex.test(fullname)) {
        showInlineError("Name should contain only letters (min 3 chars)");
        return;
    }

    if (!emailRegex.test(email)) {
        showInlineError("Enter a valid email address");
        return;
    }

    if (!passwordRegex.test(password)) {
        showInlineError("Password must be 8 chars with uppercase, lowercase, number & special character");
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
    //  HANDLE PYDANTIC VALUE ERROR CLEANLY
    if (Array.isArray(data.detail)) {
        const errObj = data.detail[0];

        // CLEANING: Strip "Value error, " from the message
        let cleanMsg = errObj.msg.replace(/^Value error, /i, "");

        if (errObj.type === "value_error") {
            showInlineError(cleanMsg);
            throw "handled";
        }

        // fallback (other validation errors)
        showInlineError(cleanMsg);
        throw "handled";
    }

    if (typeof data.detail === "string") {
        // CLEANING: Strip from string-based detail as well
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


        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";

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


function goBack() { 
    window.location.href = '/';    
}