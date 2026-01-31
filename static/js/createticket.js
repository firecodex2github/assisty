
const ticketForm = document.getElementById('ticketForm');
const screenshotInput = document.getElementById('screenshots');
const pdfInput = document.getElementById('pdfFiles');
const emailInput = document.getElementById("email");
const msgDiv = document.getElementById("msg");
const pdfMsgDiv = document.getElementById("pdfMsg");
const fileListDiv = document.getElementById("fileList");
const pdfListDiv = document.getElementById("pdfFileList");

const MAX_IMG = 3;
const MAX_IMG_SIZE = 4 * 1024 * 1024;
const MAX_PDF = 2;
const MAX_PDF_SIZE = 5 * 1024 * 1024;

let selectedFiles = []; // for images
let selectedPDFs = [];  // for pdfs



//  Ensures the user stays logged in by catching 401 errors and refreshing the token.

async function fetchWithRefresh(url, options = {}) {
    let token = sessionStorage.getItem("access_token");
    if (!token) { logout(); return null; }

    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${token}`;

    let response = await fetch(url, options);

    if (response.status === 401) {
        const refreshToken = sessionStorage.getItem("refresh_token");
        if (refreshToken) {
            const formData = new FormData();
            formData.append("refresh_token", refreshToken);

            const refreshRes = await fetch("http://127.0.0.1:8000/user/refresh", {
                method: "POST",
                body: formData
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                sessionStorage.setItem("access_token", data.access_token);
                // UPDATE: Save the new refresh token (Rotation)
                if (data.refresh_token) {
                    sessionStorage.setItem("refresh_token", data.refresh_token);
                }
                
                if (options.method === "POST") {
                    showNotification("error", "Session refreshed. Please click submit again.");
                    return null;
                }

                options.headers["Authorization"] = `Bearer ${data.access_token}`;
                return await fetch(url, options);
            }
        }
        logout();
    }
    return response;
}



// Page loading time showing on email only..
document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) { 
        window.location.href = "/login"; 
        return; 
    }
    fetchUserEmail();
});


// User email has still showing in this page
async function fetchUserEmail() {
    try {
        const res = await fetchWithRefresh("http://127.0.0.1:8000/user/me/email");
        if (res && res.ok) {
            const data = await res.json();
            emailInput.value = data.email;
        }
    } catch (err) { 
        console.error("Email fetch error:", err);
        logout(); 
    }
}


// Screenshot upload and validation

screenshotInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedFiles.length > MAX_IMG) {
        showInlineError(`You can upload only ${MAX_IMG} screenshots total.`);
        return;
    }

    for (let file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_IMG_SIZE) continue;
        if (selectedFiles.some(f => f.name === file.name)) continue;

        selectedFiles.push(file);
    }

    updateUI();

});





// Pdf validation with upload

pdfInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedPDFs.length > MAX_PDF) {
        showPDFError(`You can upload only ${MAX_PDF} PDFs total.`);
        return;
    }

    for (let file of files) {
        if (file.type !== "application/pdf") continue;
        if (file.size > MAX_PDF_SIZE) continue;
        if (selectedPDFs.some(f => f.name === file.name)) continue;

        selectedPDFs.push(file);
    }

    updateUI();

});




// User seleted files showing on browser in files and pdfs
function updateUI() {
    fileListDiv.innerHTML = "";
    pdfListDiv.innerHTML = "";

    if (selectedFiles.length > 0) {
        fileListDiv.innerHTML = "<strong>Selected Images:</strong><br>";
        selectedFiles.forEach((f, index) => {
            fileListDiv.innerHTML += `
                <div class="text-primary small d-flex justify-content-between align-items-center mb-1">
                    <span><i class="bi bi-image"></i> ${f.name}</span>
                    <i class="bi bi-x-circle text-danger ms-2" style="cursor:pointer" onclick="removeImage(${index})"></i>
                </div>`;
        });
    }

    if (selectedPDFs.length > 0) {
        pdfListDiv.innerHTML = "<strong>Selected PDFs:</strong><br>";
        selectedPDFs.forEach((f, index) => {
            pdfListDiv.innerHTML += `
                <div class="text-danger small d-flex justify-content-between align-items-center mb-1">
                    <span><i class="bi bi-file-earmark-pdf"></i> ${f.name}</span>
                    <i class="bi bi-x-circle text-danger ms-2" style="cursor:pointer" onclick="removePDF(${index})"></i>
                </div>`;
        });
    }
}


// seleted files removing
window.removeImage = (index) => {
    selectedFiles.splice(index, 1);
    updateUI();
};


// seleted pdfs removing
window.removePDF = (index) => {
    selectedPDFs.splice(index, 1);
    updateUI();
};


// Tickets submittin

ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBtn");


    const form = e.target;  // this Event target used for refresh fields once ticket is created
    const formData = new FormData();
    formData.append("category", document.getElementById('issueType').value);
    formData.append("subject", document.getElementById('subject').value);
    formData.append("description", document.getElementById('description').value);
    formData.append("callback_number", document.getElementById('phone').value);

    selectedFiles.forEach(f => formData.append("screenshots", f));
    selectedPDFs.forEach(f => formData.append("pdfs", f));

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        const res = await fetchWithRefresh("http://127.0.0.1:8000/user/createticket", {
            method: "POST",
            body: formData
        });

        if (res && res.ok) {
            showNotification("success", "Ticket Created Successfully!");
            form.reset();
            
            selectedFiles = [];
            selectedPDFs = [];
            updateUI();

        } else if (res) {
            const err = await res.json();
            showNotification("error", err.detail || "Upload failed");
        }
    } catch (err) {
        console.error("Submission error:", err);
        showNotification("error", "Connection error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Ticket";
    }
});



// Model message has showing on Suucess and Failed

function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");
    if (!modalEl) {
        if (type === "success") window.location.href = "/view-tickets";
        return;
    }

    const modal = new bootstrap.Modal(modalEl);
    const modalBox = document.getElementById("modalBox");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = document.getElementById("modalIcon");

    modalMessage.innerText = message;
    modalMessage.style.color = "white";

    if (type === "success") {
        modalBox.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
        modalIcon.className = "bi bi-check-circle-fill fs-1 mb-2 text-white";
        modal.show();
        setTimeout(() => { window.location.href = "/view-tickets"; }, 2000);
    } else {
        modalBox.style.background = "linear-gradient(135deg,#ef4444,#b91c1c)";
        modalIcon.className = "bi bi-exclamation-circle-fill fs-1 mb-2 text-white";
        modal.show();
        setTimeout(() => { modal.hide(); }, 3000);
    }
}


// Inline errors messages showing on #msg
function showInlineError(msg) {
    msgDiv.innerText = msg;
    msgDiv.style.display = "block";
    msgDiv.style.color = "red";
    setTimeout(() => { msgDiv.style.display = "none"; }, 5000);
}

// Inline errors messages showing on #pdfMsg
function showPDFError(msg) {
    pdfMsgDiv.innerText = msg;
    pdfMsgDiv.style.display = "block";
    pdfMsgDiv.style.color = "red";
    setTimeout(() => { pdfMsgDiv.style.display = "none"; }, 5000);
}





// Updated Logout to match Postman logic 
window.logout = async function() {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (refreshToken) {
        try {
            await fetch(`http://127.0.0.1:8000/user/logout?refresh_token=${encodeURIComponent(refreshToken)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        } catch (err) {
            console.error("Logout error:", err);
        }
    }
    sessionStorage.clear();
    window.location.href = "/login";
}




