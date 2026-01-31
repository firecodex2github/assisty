/*
  admindashboard.js

 */

//  GLOBAL VARIABLES
let agentSocket = null; 
let activeAgentChatTicket = null;
let agentTypingTimer = null;
let pendingStatusData = null;
let allTicketsCache = []; 

/* AUTH HELPERS */
function getAuthHeader() {
    const token = sessionStorage.getItem("access_token");
    if (!token) { 
        window.location.href = "/agentlogin"; 
        return null; 
    }
    return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
}

async function fetchWithRefresh(url, options = {}) {
    let headers = getAuthHeader();
    if (!headers) return null;
    options.headers = { ...options.headers, ...headers };
    try {
        let response = await fetch(url, options);
        if (response.status === 401) {
            const refreshToken = sessionStorage.getItem("refresh_token");
            if (refreshToken) {
                const formData = new FormData();
                formData.append("refresh_token", refreshToken);
                const refreshRes = await fetch("/agent/refresh", { method: "POST", body: formData });
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    sessionStorage.setItem("access_token", data.access_token);
                    options.headers["Authorization"] = `Bearer ${data.access_token}`;
                    return await fetch(url, options);
                }
            }
            logout(); 
            return null;
        }
        return response;
    } catch (err) {
        console.error("Fetch API Error:", err);
        return null;
    }
}

window.logout = async function() {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (refreshToken) {
        try {
            await fetch(`/agent/logout?refresh_token=${encodeURIComponent(refreshToken)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        } catch (err) { console.error("Server logout request failed:", err); }
    }
    sessionStorage.clear();
    window.location.href = "/agentlogin";
}

/*  UI HELPERS  */
function getStatusClass(status) {
    switch (status) {
        case "Open": return "bg-info text-dark";
        case "In Progress": return "bg-primary text-white";
        case "Resolved": return "bg-success text-white";
        case "Closed": return "bg-secondary text-white";
        default: return "bg-dark text-white";
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case "High": return "bg-danger";
        case "Medium": return "bg-warning text-dark";
        default: return "bg-primary";
    }
}

/*  LOAD TICKETS  */
window.loadAllTickets = async function() {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;
    try {
        const response = await fetchWithRefresh("/agent/all-tickets");
        if (!response) return;
        allTicketsCache = await response.json(); 
        allTicketsCache.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderTickets(allTicketsCache); 
    } catch (err) { console.error("Error loading tickets:", err); }
}

window.filterTickets = function() {
    const filterValue = document.getElementById("statusFilter").value;
    if (filterValue === "All") { renderTickets(allTicketsCache); } 
    else { renderTickets(allTicketsCache.filter(t => t.status === filterValue)); }
}

function renderTickets(tickets) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    tickets.forEach(ticket => {
        const status = ticket.status;
        const priority = ticket.priority || "Medium";
        const isClosed = status.toLowerCase() === "closed";
        
        const hasUnread = localStorage.getItem(`unread_${ticket.ticket_no}`) === "true";
        const dotHtml = hasUnread ? `<span id="dot-${ticket.ticket_no}" class="unread-dot"></span>` : `<span id="dot-${ticket.ticket_no}"></span>`;

        let nextStatus = "", btnClass = "";
        if (status === "Open") { nextStatus = "In Progress"; btnClass = "btn-info text-white"; }
        else if (status === "In Progress") { nextStatus = "Resolved"; btnClass = "btn-success"; }
        else if (status === "Resolved") { nextStatus = "Closed"; btnClass = "btn-danger"; }

        tableBody.innerHTML += `
            <tr>
                <td><strong>${ticket.ticket_no}</strong></td>
                <td>${ticket.subject}</td>
                <td>${ticket.issue_type}</td>
                <td>
                    <select class="form-select form-select-sm border-0 fw-bold ${getPriorityClass(priority)}" 
                            onchange="updatePriority('${ticket.ticket_no}', this.value)" style="width:100px;">
                        <option value="Low" ${priority === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${priority === 'High' ? 'selected' : ''}>High</option>
                    </select>
                </td>
                <td><span class="badge ${getStatusClass(status)}">${status}</span></td>
                <td>${new Date(ticket.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-primary btn-sm rounded-pill" onclick="viewIssue('${ticket.ticket_no}')"><i class="bi bi-eye"></i> View</button></td>
                <td>${!isClosed ? `<button class="btn btn-sm rounded-pill ${btnClass}" onclick="requestStatusChange('${ticket.ticket_no}', '${nextStatus}')">Move to ${nextStatus}</button>` : `<button class="btn btn-sm btn-light border rounded-pill" disabled>Closed</button>`}</td>
                <td><button class="btn btn-success btn-sm rounded-pill" onclick="openAgentChat('${ticket.ticket_no}')"><i class="bi bi-chat-dots"></i> Chat ${dotHtml}</button></td>
            </tr>`;
    });
}

/*  CHAT LOGIC  */
window.openAgentChat = async function(ticketNo) {
    localStorage.removeItem(`unread_${ticketNo}`);
    const dot = document.getElementById(`dot-${ticketNo}`);
    if (dot) dot.className = "";

    activeAgentChatTicket = ticketNo;
    const token = sessionStorage.getItem("access_token");
    document.getElementById("chatTicketId").innerText = ticketNo;
    document.getElementById("chatPopup").style.display = "block";

    try {
        const response = await fetchWithRefresh(`/api/messages/${ticketNo}`);
        const history = await response.json();
        const chatBody = document.getElementById("chatMessages");
        chatBody.innerHTML = ''; 
        history.forEach(msg => appendAgentChatMessage(msg.sender, msg.content));
    } catch (err) { console.error(err); }

    const inputField = document.getElementById("chatInput");
    if (inputField) {
        inputField.oninput = () => {
            if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
                agentSocket.send(JSON.stringify({ "type": "typing", "sender": "agent" }));
            }
        };
    }

    if (agentSocket) agentSocket.close();
    
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    agentSocket = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${ticketNo}/agent?token=${token}`);
    
    agentSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        // Restore Typing Indicator Logic
        if (data.type === "typing") {
            if (data.sender !== "agent") handleAgentTypingIndicator("User");
            return;
        }
        
        const chatWindow = document.getElementById("chatPopup");
        const isVisible = chatWindow && chatWindow.style.display === "block";

        if (!isVisible || activeAgentChatTicket !== ticketNo) {
            if (data.sender !== "agent") {
                localStorage.setItem(`unread_${ticketNo}`, "true");
                const targetDot = document.getElementById(`dot-${ticketNo}`);
                if (targetDot) targetDot.className = "unread-dot";
                showNotification("success", `New message on Ticket ${ticketNo}`);
            }
        } else {
            if (data.sender !== "agent") {
                appendAgentChatMessage(data.sender, data.message || data.content);
                const indicator = document.getElementById("typingIndicator");
                if(indicator) indicator.innerText = "";
            }
        }
    };
};

window.sendAgentMessage = function() {
    const input = document.getElementById("chatInput");
    if (!input || !input.value.trim()) return;
    
    if (!agentSocket || agentSocket.readyState !== WebSocket.OPEN) {
        showNotification("error", "Chat connection lost. Please reopen the chat.");
        return;
    }

    const messageText = input.value.trim();
    agentSocket.send(JSON.stringify({ "message": messageText }));
    appendAgentChatMessage("agent", messageText);
    input.value = "";
};

function appendAgentChatMessage(sender, text) {
    const box = document.getElementById("chatMessages");
    if(!box) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${sender === "agent" ? "user-msg" : "agent-msg"}`;
    msgDiv.textContent = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
}

// Restore Typing Indicator Function
function handleAgentTypingIndicator(sender) {
    const indicator = document.getElementById("typingIndicator");
    if (!indicator) return;
    indicator.innerText = sender + " is typing...";
    clearTimeout(agentTypingTimer);
    agentTypingTimer = setTimeout(() => { indicator.innerText = ""; }, 3000);
}

/*  PRIORITY & STATUS UPDATES  */
window.updatePriority = async function(ticketNo, newPriority) {
    const res = await fetchWithRefresh(`/api/tickets/${ticketNo}/priority`, { 
        method: "POST", 
        body: JSON.stringify({ priority: newPriority }) 
    });
    if (res && res.ok) {
        showNotification("success", `Ticket ${ticketNo} updated`);
        loadAllTickets(); 
    }
};

window.viewIssue = async function(ticketNo) {
    const detailsBody = document.getElementById('issueDetailsBody');
    const modalElement = document.getElementById("viewIssuePopup");
    if (!modalElement || !detailsBody) return;
    modalElement.style.display = "flex";
    detailsBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';
    try {
        const response = await fetchWithRefresh(`/api/ticket-details/${ticketNo}`);
        const t = await response.json();
        let imagesHtml = '', pdfsHtml = '';
        if (t.attachments) {
            t.attachments.forEach(url => {
                if (url.toLowerCase().endsWith('.pdf')) pdfsHtml += `<a href="${url}" target="_blank" class="btn btn-sm btn-outline-danger mb-2 p-2 w-auto d-block"><i class="bi bi-file-earmark-pdf"></i> PDF</a>`;
                else imagesHtml += `<img src="${url}" class="attachment-preview me-2 mb-2" onclick="window.open('${url}', '_blank')">`;
            });
        }
        detailsBody.innerHTML = `<div class="row g-3">
        <div class="col-md-6"><label class="detail-label">TICKET</label><p class="fw-bold">${t.ticket_no}</p></div>
        <div class="col-md-6"><label class="detail-label">STATUS</label><br><span class="badge ${getStatusClass(t.status)}">${t.status}</span></div>
        <div class="col-12"><label class="detail-label">SUBJECT</label><h5>${t.subject}</h5></div>
        <div class="col-12"><label class="detail-label">DESCRIPTION</label><div class="bg-light p-3 border rounded">${t.description || 'No description.'}</div></div>
        <div class="col-12 mt-2">${imagesHtml}</div><div class="col-12 mt-2">${pdfsHtml}</div></div>`;
    } catch (e) { detailsBody.innerHTML = "Error loading."; }
};

window.closeIssueModal = () => document.getElementById("viewIssuePopup").style.display = "none";

window.requestStatusChange = function(ticketNo, newStatus) {
    pendingStatusData = { ticketNo, newStatus };
    const textEl = document.getElementById("statusConfirmText");
    if (textEl) textEl.innerText = `Confirm changing Ticket ${ticketNo} to ${newStatus}?`;
    const modalEl = document.getElementById('statusConfirmModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

window.confirmStatusUpdate = async function() {
    if(!pendingStatusData) return;
    const { ticketNo, newStatus } = pendingStatusData;
    const res = await fetchWithRefresh(`/api/tickets/${ticketNo}/status`, { method: "POST", body: JSON.stringify({ status: newStatus }) });
    if (res && res.ok) {
        const inst = bootstrap.Modal.getInstance(document.getElementById('statusConfirmModal'));
        if(inst) inst.hide();
        showNotification("success", `Updated to ${newStatus}`);
        loadAllTickets();
    }
}

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
    activeAgentChatTicket = null; 
    document.getElementById("chatPopup").style.display = "none"; 
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const filterDropdown = document.getElementById("statusFilter");
        if (filterDropdown) { filterDropdown.addEventListener("change", filterTickets); }
        loadAllTickets();
    }, 100);
});