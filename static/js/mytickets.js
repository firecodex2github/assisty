/**
 * mytickets.js

 1.Authentication handling (access token, refresh token)

 2.Loading and displaying tickets

 3.Chat system ( WebSocket)

 4.UI helpers (typing indicator, unread dot, notifications, logout)

 */

let socket = null;
let activeUserChatTicket = null;   //Which ticket chat is currently open
let userTypingTimer;

<<<<<<< HEAD
/*  AUTH HELPERS  */
=======
/* ========= AUTH HELPERS ========= */
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
async function fetchWithRefresh(url, options = {}) {
    let token = sessionStorage.getItem("access_token");
    if (!token) { logout(); return null; }
    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${token}`; // adding token to header
    let response = await fetch(url, options);
    if (response.status === 401) {
        const refreshToken = sessionStorage.getItem("refresh_token");
        if (refreshToken) {
            const formData = new FormData();
            formData.append("refresh_token", refreshToken);
            const res = await fetch("/user/refresh", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();  //Converts JSON  text "atoken" to JavaScript object  atoken
                sessionStorage.setItem("access_token", data.access_token);
                options.headers["Authorization"] = `Bearer ${data.access_token}`;
                return await fetch(url, options);
            }
        }
        logout();
    }
    return response;
}

function getPriorityClass(p) {
    if (p === "High") return "bg-danger";
    if (p === "Medium") return "bg-warning text-dark";
    return "bg-primary";
}

<<<<<<< HEAD
/*  LOAD TICKETS  */
=======
/* ========= LOAD TICKETS ========= */
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
async function fetchTickets() {
    const grid = document.getElementById("ticketContainer");
    if(!grid) return;
    try {
        const response = await fetchWithRefresh("/api/mytickets");
        if (!response) return ;
        const tickets = await response.json();
        grid.innerHTML = "";

        // Check if the user has any tickets
        if (!tickets || tickets.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="no-tickets-container p-5 bg-white rounded-4 shadow-sm border">
                        <i class="bi bi-ticket-perforated text-muted" style="font-size: 3rem;"></i>
                        <h4 class="mt-3 fw-bold text-dark">No Tickets Found</h4>
                        <p class="text-muted">You haven't created any support tickets yet.</p>
                        <a href="/createticket" class="btn btn-primary rounded-pill px-4 mt-2">
                            Create Your First Ticket
                        </a>
                    </div>
                </div>`;
            return;
        }



        tickets.forEach(t => {
            const status = t.status;
            const priority = t.priority || "Medium";
            const pOpen = status === "Open" ? "bg-info text-white" : "bg-light text-muted";
            const pProgress = status === "In Progress" ? "bg-primary text-white" : "bg-light text-muted";
            const pResolved = status === "Resolved" ? "bg-success text-white" : "bg-light text-muted";
            const pClosed = status === "Closed" ? "bg-danger text-white" : "bg-light text-muted";

            // Unread Indicator Logic
            const hasUnread = localStorage.getItem(`unread_${t.ticket_no}`) === "true";
            const dotHtml = hasUnread ? `<span id="dot-${t.ticket_no}" class="unread-dot"></span>` : `<span id="dot-${t.ticket_no}"></span>`;

            grid.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="ticket-card p-4 shadow-sm border bg-white rounded-4 position-relative">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="text-primary fw-bold">${t.ticket_no}</h6>
                            <h5 class="fw-bold">${t.subject}</h5>
                            <span class="badge ${getPriorityClass(priority)} small mb-2">${priority} Priority</span>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary rounded-pill" onclick="viewIssue('${t.ticket_no}')">View</button>
<<<<<<< HEAD
                        <span class="badge bg-success text-white">${new Date(t.created_at).toLocaleDateString()}</span>
=======
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
                    </div>
                    <div class="d-flex justify-content-between gap-1 my-4">
                        <span class="badge rounded-pill flex-fill ${pOpen}">Open</span>
                        <span class="badge rounded-pill flex-fill ${pProgress}">In Progress</span>
                        <span class="badge rounded-pill flex-fill ${pResolved}">Resolved</span>
                        <span class="badge rounded-pill flex-fill ${pClosed}">Closed</span>
                    </div>
                    <button class="btn btn-outline-primary w-100 rounded-pill" onclick="openChat('${t.ticket_no}')" ${status === 'Closed' ? 'disabled' : ''}>
                        <i class="bi bi-chat-dots"></i> ${status === 'Closed' ? 'Chat Closed' : 'Open Chat'} ${dotHtml}
                    </button>
                </div>
            </div>`;
        });
    } catch (e) { console.error(e); }
}

<<<<<<< HEAD
/*  CHAT LOGIC  */
=======
/* ========= CHAT LOGIC ========= */
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
window.openChat = async function(ticketNo) {
    // 1. Clear unread indicator
    localStorage.removeItem(`unread_${ticketNo}`);
    const dot = document.getElementById(`dot-${ticketNo}`);
    if (dot) dot.className = "";

    activeUserChatTicket = ticketNo;
    const token = sessionStorage.getItem("access_token");
    document.getElementById("chatPopup").style.display = "flex";
    document.getElementById("chatTicketId").innerText = ticketNo;

    // 2. Load History
    try {
        const res = await fetchWithRefresh(`/api/messages/${ticketNo}`);
        const history = await res.json();
        const chatBody = document.getElementById("chatMessages");
        chatBody.innerHTML = ''; 
        history.forEach(msg => appendChatMessage(msg.sender, msg.content));
    } catch (e) { console.error(e); }

    // 3. Reconnect WebSocket
    if (socket) socket.close();
    
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${ticketNo}/user?token=${token}`);
    
    // 4. Input Listener for Typing
    const inputField = document.getElementById("chatInput");
    if (inputField) {
        inputField.oninput = () => {        //hits every time input value changes even one letter type
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ "type": "typing", "sender": "user" }));
            }
        };
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle Typing Indicator
        if (data.type === "typing") {
            if (data.sender !== "user") handleUserTypingIndicator(data.sender);
            return;
        }

        const isChatVisible = document.getElementById("chatPopup").style.display === "flex";
        
        if (!isChatVisible || activeUserChatTicket !== ticketNo) {   //Chat window is closed  or Chat is open, but for another ticket
            if (data.sender !== "user") {      // Ignore your own messages
                localStorage.setItem(`unread_${ticketNo}`, "true");
                const targetDot = document.getElementById(`dot-${ticketNo}`);
                if (targetDot) targetDot.className = "unread-dot";
                showNotification("success", `New message on Ticket ${ticketNo}`);
            }
        } else {
            if (data.sender !== "user") {
                appendChatMessage(data.sender, data.message || data.content);
                const indicator = document.getElementById("typingIndicator");
                if(indicator) indicator.innerText = ""; //Removes Agent is typing  Because message has arrived
            }
        }
    };
};

<<<<<<< HEAD


=======
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
function appendChatMessage(sender, text) {
    const box = document.getElementById("chatMessages");
    if(!box) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${(sender === "user" || sender === "You") ? "user-msg" : "agent-msg"}`;  //right side (user bubble)   else- left side (agent bubble)
    msgDiv.innerText = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;  //Shows latest message automatically
}

window.sendMessage = function() {
    const input = document.getElementById("chatInput");
    if (!input || !input.value.trim()) return;      //Stops if  input element missing  or message is empty or spaces

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification("error", "Connection lost. Please reopen the chat.");
        return;
    }

    socket.send(JSON.stringify({ "message": input.value.trim() })); //convert text to JSON string and send to server
    appendChatMessage("user", input.value.trim());
    input.value = "";
};

<<<<<<< HEAD
/*  TYPING INDICATOR  */
=======
/* ========= TYPING INDICATOR ========= */
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
function handleUserTypingIndicator(sender) {
    const indicator = document.getElementById("typingIndicator");
    if (!indicator) return;
    indicator.innerText = "Agent is typing...";
    clearTimeout(userTypingTimer);
    userTypingTimer = setTimeout(() => { indicator.innerText = ""; }, 3000);
}

<<<<<<< HEAD
/*  ISSUE DETAILS & UTILS  */
=======
/* ========= ISSUE DETAILS & UTILS ========= */
>>>>>>> ef7ca403f233ce7b09fa19288effc38235f45467
window.viewIssue = async function(ticketNo) {
    const detailsBody = document.getElementById('issueDetailsBody');
    const modalElement = document.getElementById("viewIssuePopup");
    if (!modalElement || !detailsBody) return;
    modalElement.style.display = "flex";
    detailsBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';
    try {
        const response = await fetchWithRefresh(`/api/ticket-details/${ticketNo}`);
        const t = await response.json();
        const priority = t.priority || "Medium";
        let imagesHtml = '', pdfsHtml = '';
        if (t.attachments) {
            t.attachments.forEach(url => {
                if (url.toLowerCase().endsWith('.pdf')) pdfsHtml += `<a href="${url}" target="_blank" class="btn btn-sm btn-outline-danger mb-2 p-2 w-auto d-block"><i class="bi bi-file-earmark-pdf"></i> PDF</a>`;
                else imagesHtml += `<img src="${url}" class="attachment-preview me-2 mb-2" onclick="window.open('${url}', '_blank')">`;
            });
        }
        detailsBody.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4"><label class="detail-label">TICKET</label><p class="fw-bold">${t.ticket_no}</p></div>
                <div class="col-md-4"><label class="detail-label">PRIORITY</label><br><span class="badge ${getPriorityClass(priority)}">${priority}</span></div>
                <div class="col-md-4"><label class="detail-label">STATUS</label><br><span class="badge bg-primary text-white">${t.status}</span></div>
                <div class="col-12"><label class="detail-label">SUBJECT</label><h5>${t.subject}</h5></div>
                <div class="col-12"><label class="detail-label">DESCRIPTION</label><div class="bg-light p-3 border rounded">${t.description || 'No description.'}</div></div>
                <div class="col-12 mt-2">${imagesHtml}</div>
                <div class="col-12 mt-2">${pdfsHtml}</div>
            </div>`;
    } catch (e) { detailsBody.innerHTML = "Error loading."; }
};

function showNotification(type, message) {
    const modalEl = document.getElementById("notifyModal");
    if(!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    document.getElementById("modalMessage").innerText = message;
    const box = document.getElementById("modalBox");
    box.style.background = type === "success" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#b91c1c)";
    modal.show();
    setTimeout(() => modal.hide(), 2500);
}

window.closeChat = () => { 
    activeUserChatTicket = null; 
    document.getElementById("chatPopup").style.display = "none"; 
};

window.closeIssueModal = () => document.getElementById("viewIssuePopup").style.display = "none";

window.logout = async function() {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (refreshToken) {
        try {
            await fetch(`/user/logout?refresh_token=${encodeURIComponent(refreshToken)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        } catch (err) { console.error("Logout error:", err); }
    }
    sessionStorage.clear();
    window.location.href = "/login";
}

window.goBack = () => window.history.back();
document.addEventListener("DOMContentLoaded", fetchTickets);