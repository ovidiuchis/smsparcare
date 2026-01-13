// --- STATE ---
let state = {
    zone: 'I',
    durationValue: '30m',
    plate: '',
    savedPlates: []
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
    statusDot: document.getElementById('status-dot')
};

// --- INIT ---
(function init() {
    restoreState();
    renderZone();
    renderDuration();
    renderHistory();
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
