// Global active structure state built from form inputs
let timeBlocks = [];

// Pull configurations from localStorage if they already exist
window.onload = function() {
    const cached = localStorage.getItem('routine_clock_config');
    if (cached) {
        const parsed = JSON.parse(cached);
        document.getElementById('morning-start').value = parsed.morningStart;
        document.getElementById('morning-end').value = parsed.morningEnd;
        document.getElementById('tea-start').value = parsed.teaStart;
        document.getElementById('tea-end').value = parsed.teaEnd;
        document.getElementById('bedtime-start').value = parsed.bedtimeStart;
        document.getElementById('bedtime-end').value = parsed.bedtimeEnd;
        document.getElementById('stairs-start').value = parsed.stairsStart;
        document.getElementById('stairs-end').value = parsed.stairsEnd;
    }
}

function timeToMinutes(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}

function launchClock() {
    const conf = {
        morningStart: document.getElementById('morning-start').value,
        morningEnd: document.getElementById('morning-end').value,
        teaStart: document.getElementById('tea-start').value,
        teaEnd: document.getElementById('tea-end').value,
        bedtimeStart: document.getElementById('bedtime-start').value,
        bedtimeEnd: document.getElementById('bedtime-end').value,
        stairsStart: document.getElementById('stairs-start').value,
        stairsEnd: document.getElementById('stairs-end').value,
    };

    // Cache parameters safely
    localStorage.setItem('routine_clock_config', JSON.stringify(conf));

    // Construct array sorting rule matrices
    timeBlocks = [
        { start: conf.morningStart, end: conf.morningEnd, theme: "theme-morning", text: "Good Morning! ☀️" },
        { start: conf.teaStart, end: conf.teaEnd, theme: "theme-tea", text: "Tea Time! 🍽️" },
        { start: conf.bedtimeStart, end: conf.bedtimeEnd, theme: "theme-bedtime", text: "Bedtime Routine 🌙" },
        { start: conf.stairsStart, end: conf.stairsEnd, theme: "theme-stairs", text: "Up the stairs! 🛌" }
    ];

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('clock-screen').classList.remove('hidden');
    
    // Fire clock logic immediately
    runEngine();
}

function showSettings() {
    document.getElementById('clock-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function runEngine() {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const secs = now.getSeconds();
    const activeMinutes = hrs * 60 + mins;

    // 1. Move Hands
    const secDegrees = (secs / 60) * 360;
    const minDegrees = ((mins / 60) * 360) + ((secs / 60) * 6);
    const hrDegrees = ((hrs % 12) / 12) * 360 + ((mins / 60) * 30);

    document.getElementById('second-hand').style.transform = `translateX(-50%) rotate(${secDegrees}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minDegrees}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hrDegrees}deg)`;

    // 2. Format Digital Readouts
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hr12 = hrs % 12 || 12;
    const padMins = mins.toString().padStart(2, '0');

    document.getElementById('digital-clock-12').innerText = `${hr12}:${padMins} ${ampm}`;
    document.getElementById('digital-clock-24').innerText = `24h: ${hrs.toString().padStart(2, '0')}:${padMins}`;
    
    const localeConfig = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('date-display').innerText = now.toLocaleDateString('en-GB', localeConfig);

    // 3. Process Active Theme Layer
    let activeMatch = null;

    // Check custom blocks
    for (const block of timeBlocks) {
        const start = timeToMinutes(block.start);
        const end = timeToMinutes(block.end);
        if (activeMinutes >= start && activeMinutes < end) {
            activeMatch = block;
            break;
        }
    }

    // Default Fallbacks based on rules if not within a custom input window
    if (!activeMatch) {
        if (hrs >= 20 || hrs < 7) {
            // After 8:00 PM or before 7:00 AM -> Minimalist Adult Gold Slate
            activeMatch = { theme: "theme-adult", text: "🌙 MIDNIGHT LOUNGE" };
        } else {
            // General daytime downtime
            activeMatch = { theme: "theme-freetime", text: "Free Time ✨" };
        }
    }

    // Apply classes safely
    document.getElementById('clock-screen').className = "display-view " + activeMatch.theme;
    document.getElementById('routine-text').innerText = activeMatch.text;
}

// Tick loop
setInterval(() => {
    // Check if display layout is hidden to save performance overhead
    if(!document.getElementById('clock-screen').classList.contains('hidden')) {
        runEngine();
    }
}, 1000);
