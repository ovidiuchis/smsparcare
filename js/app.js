// --- STATE ---
let state = {
    zone: 'I',
    durationValue: '30m',
    plate: '',
    savedPlates: [],
    lastSession: null // { plate, timestamp, durationMins }
};

// --- REFS ---
const els = {
    app: document.getElementById('app'),
    // Note: buttons are selected dynamically or need to be re-queried if DOM changes, 
    // but here they are static.
    get zoneBtns() { return document.querySelectorAll('.zone-btn'); },
    durGrid: document.getElementById('duration-grid'),
    plateIn: document.getElementById('plate-input'),
    history: document.getElementById('history-drawer'),
    price: document.getElementById('price-disp'),
    code: document.getElementById('sms-code-disp'),
    msgPrev: document.getElementById('msg-preview'),
    sendBtn: document.getElementById('send-btn'),
    toast: document.getElementById('toast'),
    statusDot: document.getElementById('status-dot'),
    lastSession: document.getElementById('last-session-chip')
};

// --- INIT ---
(function init() {
    restoreState();
    renderZone();
    renderDuration();
    renderHistory();
    renderHistory();
    renderSession();
    updateUI();

    // Bind Events
    els.plateIn.addEventListener('input', handleInput);
    els.plateIn.addEventListener('blur', saveCurrentPlate);
    
    // "1-Click" Check
    if (isValid(state.plate)) {
        els.statusDot.style.display = 'block';
    }
})();

// --- LOGIC ---

function setZone(z) {
    state.zone = z;
    const valid = PARKING_DATA[z].find(d => d.value === state.durationValue);
    if (!valid) state.durationValue = PARKING_DATA[z][0].value;
    
    saveState();
    renderZone();
    renderDuration(); 
    updateUI();
}

function setDuration(val) {
    state.durationValue = val;
    saveState();
    renderDuration();
    updateUI();
}

function handleInput(e) {
    let raw = e.target.value.toUpperCase();
    const clean = raw.replace(/[^A-Z0-9]/g, '');
    
    if (e.target.value !== clean) {
       e.target.value = clean;
    }
    
    state.plate = clean;
    saveState();
    updateUI();
}

function saveCurrentPlate() {
    if (isValid(state.plate)) {
        if (!state.savedPlates.includes(state.plate)) {
            state.savedPlates.push(state.plate);
            saveState();
            renderHistory();
        }
    }
}

function toggleHistory() {
    els.history.classList.toggle('open');
    renderHistory();
}

function pickHistory(plate) {
    state.plate = plate;
    els.plateIn.value = plate;
    els.history.classList.remove('open');
    saveState();
    updateUI();
}

function deleteHistory(plate, e) {
    e.stopPropagation();
    state.savedPlates = state.savedPlates.filter(p => p !== plate);
    saveState();
    renderHistory();
}

function saveSession(durVal, plate) {
    // Map value to minutes
    const map = { '30m': 30, '1h': 60, '2h': 120, '4h': 240 };
    const mins = map[durVal] || 60;
    
    state.lastSession = {
        timestamp: Date.now(),
        durationMins: mins,
        plate: plate
    };
    saveState();
}

// --- RENDER ---
function renderZone() {
    els.zoneBtns.forEach(b => {
        if (b.dataset.zone === state.zone) b.classList.add('active');
        else b.classList.remove('active');
    });
}

function renderDuration() {
    els.durGrid.innerHTML = '';
    const opts = PARKING_DATA[state.zone];
    opts.forEach(o => {
        const btn = document.createElement('div');
        btn.className = `duration-btn ${state.durationValue === o.value ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="duration-time">${o.label}</span>
            <span class="duration-price">${o.price} lei</span>
        `;
        btn.onclick = () => setDuration(o.value);
        els.durGrid.appendChild(btn);
    });
}

function renderHistory() {
    if (state.savedPlates.length === 0) {
        els.history.innerHTML = '<div style="padding:10px;text-align:center;color:var(--text-muted);font-size:12px;">Nu ai numere salvate.</div>';
        return;
    }
    els.history.innerHTML = '';
    state.savedPlates.forEach(p => {
        const row = document.createElement('div');
        row.className = 'history-item';
        row.innerHTML = `
            <span class="history-plate" onclick="pickHistory('${p}')">${p}</span>
            <span class="history-del" onclick="deleteHistory('${p}', event)">×</span>
        `;
        els.history.appendChild(row);
    });
}

function renderSession() {
    const s = state.lastSession;
    if (!s) return;

    const box = els.lastSession;
    const now = Date.now();
    const ageMs = now - s.timestamp;
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Hide if older than 24h
    if (ageMs > oneDayMs) {
        box.style.display = 'none';
        return;
    }

    const expiryTime = s.timestamp + (s.durationMins * 60 * 1000);
    const leftMs = expiryTime - now;
    const leftMins = Math.ceil(leftMs / 60000);

    box.style.display = 'flex';
    
    // Formatting date helper
    const dateObj = new Date(s.timestamp);
    const timeStr = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute:'2-digit' });
    const dateStr = dateObj.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });

    if (leftMs > 0) {
        // Active
        box.className = 'session-chip active';
        box.innerHTML = `
            <span class="sess-icon">🅿️</span>
            <div class="sess-info">
                <strong>${s.plate}</strong> • ${dateStr}, ${timeStr}
                <div class="sess-remain">Expira în ${leftMins} min</div>
            </div>
        `;
    } else {
        // Expired (but < 24h)
        box.className = 'session-chip expired';
        box.innerHTML = `
            <span class="sess-icon">🕒</span>
            <div class="sess-info">
                <strong style="text-decoration:line-through; opacity:0.7;">${s.plate}</strong> • ${dateStr}, ${timeStr}
                <div class="sess-remain">Expirat</div>
            </div>
        `;
    }
}

function updateUI() {
    const data = PARKING_DATA[state.zone].find(d => d.value === state.durationValue);
    if (!data) return;

    // Update Text
    els.price.textContent = `${data.price} lei`;
    els.code.textContent = data.code;
    
    const plateTxt = state.plate || 'NR_MASINA';
    const msg = `${data.code} ${plateTxt}`;
    els.msgPrev.textContent = msg;

    // Button State
    if (isValid(state.plate)) {
        els.sendBtn.classList.remove('disabled');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const sep = isIOS ? '&' : '?';
        els.sendBtn.href = `sms:7480${sep}body=${encodeURIComponent(data.code + ' ' + state.plate)}`;
        
        // Save session on click (approximation)
        els.sendBtn.onclick = () => {
            saveSession(data.value, state.plate);
            setTimeout(renderSession, 500); // delayed update
        };
    } else {
        els.sendBtn.classList.add('disabled');
        els.sendBtn.removeAttribute('href');
    }
}

// --- UTIL ---
function isValid(p) { return p && p.length >= 4; }

function restoreState() {
    try {
        const s = JSON.parse(localStorage.getItem('clujParkingV2'));
        if (s) {
            if (s.zone) state.zone = s.zone;
            if (s.durationValue) state.durationValue = s.durationValue;
            if (s.plate) state.plate = s.plate;
            if (s.savedPlates) state.savedPlates = s.savedPlates;
            if (s.lastSession) state.lastSession = s.lastSession;
            
            // Set input value
            els.plateIn.value = state.plate;
        }
    } catch(e) {}
}

function saveState() {
    localStorage.setItem('clujParkingV2', JSON.stringify(state));
}



function showToast(m) {
    els.toast.textContent = m;
    els.toast.classList.add('visible');
    setTimeout(() => els.toast.classList.remove('visible'), 2000);
}

// --- PWA INSTALL ---
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

window.installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
        installBtn.style.display = 'none';
    }
};

window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    showToast('Aplicație instalată!');
});

// --- iOS DETECTION ---
const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (isIos && !isStandalone) {
    document.getElementById('ios-hint').style.display = 'block';
}

// --- SERVICE WORKER UPDATES ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New update available!
                        showUpdateToast(newWorker);
                    }
                });
            });

        });
    });

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

function showUpdateToast(worker) {
    const t = els.toast;
    t.innerHTML = 'Versiune nouă disponibilă! <br><span style="text-decoration:underline; cursor:pointer;">Apasă pentru actualizare</span>';
    t.classList.add('visible');
    
    // Keep it visible until clicked
    t.onclick = () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
        t.classList.remove('visible');
    };
}
