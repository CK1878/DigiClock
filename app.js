let routines = [];

// Default starter dataset if localStorage is blank
const defaultRoutines = [
    { start: "07:00", end: "08:30", theme: "color-sky", text: "Morning Routine ☀️", sectors: true },
    { start: "17:00", end: "18:00", theme: "color-sunset", text: "Tea Time! 🍽️", sectors: true },
    { start: "19:00", end: "19:30", theme: "color-mint", text: "Bedtime Routine 🌙", sectors: true },
    { start: "19:30", end: "20:00", theme: "color-berry", text: "Up the stairs! 🛌", sectors: false }
];

window.onload = function() {
    const saved = localStorage.getItem('family_routine_v2');
    const dataToLoad = saved ? JSON.parse(saved) : defaultRoutines;
    
    dataToLoad.forEach(r => addNewRoutineRow(r.start, r.end, r.theme, r.text, r.sectors));
};

function addNewRoutineRow(start="", end="", theme="color-sky", text="", sectors=false) {
    const container = document.getElementById('routine-list');
    const rowId = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    const rowHtml = `
        <div class="routine-row" id="${rowId}">
            <div class="time-range">
                <input type="time" class="r-start" value="${start}">
                <input type="time" class="r-end" value="${end}">
            </div>
            <input type="text" class="r-text" placeholder="Banner Text (e.g., Party Time! 🎉)" value="${text}">
            <select class="r-theme">
                <option value="color-sky" ${theme === 'color-sky' ? 'selected' : ''}>Sky Blue</option>
                <option value="color-sunset" ${theme === 'color-sunset' ? 'selected' : ''}>Sunset Glow</option>
                <option value="color-mint" ${theme === 'color-mint' ? 'selected' : ''}>Mint Green</option>
                <option value="color-berry" ${theme === 'color-berry' ? 'selected' : ''}>Berry Purple</option>
                <option value="color-midnight" ${theme === 'color-midnight' ? 'selected' : ''}>Midnight Slate</option>
                <option value="color-gold" ${theme === 'color-gold' ? 'selected' : ''}>Sleek Gold (Adult)</option>
            </select>
            <label class="checkbox-container">
                <input type="checkbox" class="r-sectors" ${sectors ? 'checked' : ''}> Teaching Rings
            </label>
            <button class="remove-btn" onclick="document.getElementById('${rowId}').remove()">✕</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
}

function timeToMinutes(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}

function launchClock() {
    routines = [];
    const rows = document.querySelectorAll('.routine-row');
    
    rows.forEach(row => {
        routines.push({
            start: row.querySelector('.r-start').value,
            end: row.querySelector('.r-end').value,
            text: row.querySelector('.r-text').value,
            theme: row.querySelector('.r-theme').value,
            sectors: row.querySelector('.r-sectors').checked
        });
    });

    localStorage.setItem('family_routine_v2', JSON.stringify(routines));

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('clock-screen').classList.remove('hidden');
    
    runClockEngine();
}

function showSettings() {
    document.getElementById('clock-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function runClockEngine() {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const secs = now.getSeconds();
    const currentMins = hrs * 60 + mins;

    // 1. Update Analog Hands
    const secDegrees = (secs / 60) * 360;
    const minDegrees = ((mins / 60) * 360) + ((secs / 60) * 6);
    const hrDegrees = ((hrs % 12) / 12) * 360 + ((mins / 60) * 30);

    document.getElementById('second-hand').style.transform = `translateX(-50%) rotate(${secDegrees}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minDegrees}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hrDegrees}deg)`;

    // 2. Update Digital Values
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hr12 = hrs % 12 || 12;
    const padMins = mins.toString().padStart(2, '0');

    document.getElementById('digital-clock-12').innerText = `${hr12}:${padMins} ${ampm}`;
    document.getElementById('digital-clock-24').innerText = `24h: ${hrs.toString().padStart(2, '0')}:${padMins}`;
    document.getElementById('date-display').innerText = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

    // 3. Process Schedule Overlap
    let activeMatch = null;
    for (const block of routines) {
        if (!block.start || !block.end) continue;
        const start = timeToMinutes(block.start);
        const end = timeToMinutes(block.end);
        
        if (start <= end) {
            if (currentMins >= start && currentMins < end) { activeMatch = block; break; }
        } else {
            if (currentMins >= start || currentMins < end) { activeMatch = block; break; }
        }
    }

    // Default System Fallbacks
    if (!activeMatch) {
        if (hrs >= 20 || hrs < 7) {
            activeMatch = { theme: "color-gold", text: "🌙 Night Mode", sectors: false };
        } else {
            activeMatch = { theme: "color-sky", text: "Free Time ✨", sectors: false };
        }
    }

    // 4. Update Framework Styles
    const screen = document.getElementById('clock-screen');
    screen.className = "display-view " + activeMatch.theme;
    document.getElementById('routine-text').innerText = activeMatch.text;

    if (activeMatch.sectors) {
        screen.classList.add('show-sectors');
    } else {
        screen.classList.remove('show-sectors');
    }
}

setInterval(() => {
    if(!document.getElementById('clock-screen').classList.contains('hidden')) {
        runClockEngine();
    }
}, 1000);
