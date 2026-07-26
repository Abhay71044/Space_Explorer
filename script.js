/*============================================================================
   COSMA - SPACE EXPLORATION PLATFORM MAIN CONTROLLER
   Pure Vanilla JavaScript with HTML5 Web Audio and Interactive Canvas
============================================================================*/

// NASA & Unsplash Telemetry Keys
const API_KEY = "oWZH4DKDh4e3WKdHbdSPDxbTVUQchY7GE3QACdhX";
const UNSPLASH_KEY = "-w6nYkKDONpuSxNr4dmsP7cpE-krlAalk5QDU-uoCxU";

//--------------------------------------------------
// 1. GLOBAL STATE & MEMORY
//--------------------------------------------------
let currentImage = "";
let imageCounter = 0;
let soundSynthesized = false;
let audioCtx = null;
let spaceDrone = null;
let isMuted = true;
let searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");

// Map instance for ISS
let issMap = null;
let issMarker = null;
let issPath = [];
let issPathLine = null;

// Space Timeline Milestones
const TIMELINE_DATA = [
    { year: "1969", title: "Apollo 11 Landing", agency: "NASA", desc: "Astronaut Neil Armstrong becomes the first human to step on the Moon, declaring it 'one giant leap for mankind.'", img: "./Assets/timeline/mission_1969.jpg" },
    { year: "1977", title: "Voyager 1 Launch", agency: "NASA", desc: "Voyager 1 launches on a mission to map Jupiter and Saturn, eventually becoming the first human spacecraft to cross into interstellar space.", img: "./Assets/timeline/mission_1977.jpg" },
    { year: "1990", title: "Hubble Deployment", agency: "NASA / ESA", desc: "The Hubble Space Telescope is deployed into Earth orbit, capturing unprecedented deep-space photographs of nebulae and galaxies.", img: "./Assets/timeline/mission_1990.jpg" },
    { year: "2012", title: "Curiosity Mars Touchdown", agency: "NASA", desc: "Curiosity lands safely inside Mars' Gale Crater, beginning over a decade of martian landscape photography and mineral analysis.", img: "./Assets/timeline/mission_2012.jpg" },
    { year: "2021", title: "JWST Launch Control", agency: "NASA / ESA / CSA", desc: "The James Webb Space Telescope launches, utilizing infrared sensors to photograph the universe's oldest stellar structures.", img: "./Assets/timeline/mission_2021.jpg" },
    { year: "2023", title: "Chandrayaan-3 Moon Landing", agency: "ISRO", desc: "ISRO lands Chandrayaan-3 rover near the lunar South Pole, confirming the presence of sulfur and opening new fields of polar research.", img: "./Assets/timeline/mission_2023.jpg" },
    { year: "2026", title: "Artemis Orbit Operations", agency: "NASA & Partners", desc: "Preparing for crewed lunar landings, mapping water deposits at polar craters, and constructing the Gateway orbital station.", img: "./Assets/timeline/mission_2026.jpg" }
];

// Onboard dictionary for APOD AI Facts
const CELESTIAL_DICTIONARY = {
    galaxy: "Galaxies are vast systems containing billions of stars. The Milky Way is orbiting a collision path with Andromeda at 400,000 km/h, expected to merge in 4.5 billion years.",
    nebula: "Nebulae are stellar nurseries made of hydrogen dust. The pillars of creation inside the Eagle Nebula span over 4 light-years in height, sculpted by raw interstellar winds.",
    sun: "The Sun fuses 600 million tons of hydrogen every second. The resulting solar wind travels at 400 km/s, triggering auroras when hitting Earth's magnetic lines.",
    mars: "Mars contains Olympus Mons, the solar system's tallest volcano, standing 3 times taller than Mt. Everest. Liquid water is trapped as solid ice sheets beneath polar caps.",
    moon: "Earth's Moon is moving away from us at 3.8 cm per year. Its gravitation regulates our tidal currents and stabilizes Earth's 23.5-degree axial tilt.",
    eclipse: "Solar eclipses occur only due to a cosmic coincidence: the Sun is 400 times wider than the Moon but is also exactly 400 times further away.",
    asteroid: "Asteroids are rocky remnants from planetary formation 4.6 billion years ago. NASA's DART mission proved we can kinetic-deflect a threat object.",
    aurora: "Auroras are created when solar wind protons collide with oxygen atoms (emitting green light at 100km altitude) and nitrogen atoms (emitting deep violet light)."
};

//--------------------------------------------------
// 2. WEB AUDIO API SYNTHESIZER
//--------------------------------------------------
function initAudioContext() {
    if (soundSynthesized) return;
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        soundSynthesized = true;
    } catch (e) {
        console.error("Web Audio API not supported on this browser.");
    }
}

// Deep Space Ambience Drone
function playSpaceDrone() {
    if (!audioCtx || isMuted) return;
    try {
        // Low Frequency Drone
        let osc1 = audioCtx.createOscillator();
        let osc2 = audioCtx.createOscillator();
        let gainNode = audioCtx.createGain();
        let filter = audioCtx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 55; // A1 Note

        osc2.type = 'sine';
        osc2.frequency.value = 55.5; // Slight detuning for chorus beat

        filter.type = 'lowpass';
        filter.frequency.value = 180;
        filter.Q.value = 5;

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();

        spaceDrone = { osc1, osc2, gainNode };
    } catch (err) {
        console.log(err);
    }
}

function stopSpaceDrone() {
    if (spaceDrone) {
        try {
            spaceDrone.osc1.stop();
            spaceDrone.osc2.stop();
            spaceDrone.osc1.disconnect();
            spaceDrone.osc2.disconnect();
            spaceDrone.gainNode.disconnect();
        } catch (e) { }
        spaceDrone = null;
    }
}

// UI click synthesizer
function playBeep(freq = 600, duration = 0.08, type = 'sine') {
    if (!audioCtx || isMuted) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Rocket Engine rumble
function playRocketLaunchRumble() {
    if (!audioCtx || isMuted) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let osc = audioCtx.createOscillator();
    let noiseFilter = audioCtx.createBiquadFilter();
    let gainNode = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 3);

    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 120;

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);

    osc.connect(noiseFilter);
    noiseFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 3.5);
}

//--------------------------------------------------
// 3. TOAST & NOTIFICATION SYSTEM
//--------------------------------------------------
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.add("show");
    playBeep(880, 0.15); // High pitch notification chime
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

//--------------------------------------------------
// 4. CINEMATIC SPACE LOADER
//--------------------------------------------------
const loaderStatusMsgs = [
    "Establishing link with Deep Space Network...",
    "Aligning telemetry antennas with Lagrange L1...",
    "Querying EPIC spectral imaging cores...",
    "Caching planetary orbital trajectories...",
    "Establishing encrypted chatbot uplink..."
];

function runCinematicLoader() {
    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loaderBar");
    const loaderStatus = document.getElementById("loaderStatus");
    const loaderCanvas = document.getElementById("loaderCanvas");

    if (!loader || !loaderBar) return;

    // Canvas background starfield during loading
    const ctx = loaderCanvas.getContext("2d");
    let width = loaderCanvas.width = window.innerWidth;
    let height = loaderCanvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2,
            speed: Math.random() * 2 + 1
        });
    }

    let animId;
    function drawLoaderBg() {
        ctx.fillStyle = "rgba(2, 2, 5, 0.15)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speed;
            if (p.y > height) {
                p.y = 0;
                p.x = Math.random() * width;
            }
        });
        animId = requestAnimationFrame(drawLoaderBg);
    }
    drawLoaderBg();

    window.addEventListener("resize", () => {
        width = loaderCanvas.width = window.innerWidth;
        height = loaderCanvas.height = window.innerHeight;
    });

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 100) progress = 100;

        loaderBar.style.width = progress + "%";

        // Update statuses based on progress
        const msgIdx = Math.min(Math.floor(progress / 20), loaderStatusMsgs.length - 1);
        if (loaderStatus) loaderStatus.textContent = loaderStatusMsgs[msgIdx];

        if (progress >= 100) {
            clearInterval(interval);
            cancelAnimationFrame(animId);
            playRocketLaunchRumble();
            setTimeout(() => {
                loader.classList.add("hidden");
                showToast("🛰 SECURE TELEMETRY ESTABLISHED");
            }, 600);
        }
    }, 200);

    // Skip loader listener
    const skipBtn = document.getElementById("skipLoaderBtn");
    if (skipBtn) {
        skipBtn.addEventListener("click", () => {
            clearInterval(interval);
            cancelAnimationFrame(animId);
            loader.classList.add("hidden");
            showToast("🛰 SYSTEM TELEMETRY FORCED OPEN");
        });
    }
}

//--------------------------------------------------
// 5. PARALLAX STARFIELD & NEBULA BACKGROUNDS
//--------------------------------------------------
let starsArray = [];
let meteorsArray = [];
const cosmicBgCanvas = document.getElementById("cosmicBgCanvas");
let mouseX = 0, mouseY = 0;

function initCosmicBackground() {
    if (!cosmicBgCanvas) return;
    const ctx = cosmicBgCanvas.getContext("2d");
    let w = cosmicBgCanvas.width = window.innerWidth;
    let h = cosmicBgCanvas.height = window.innerHeight;

    // Twinkling stars
    for (let i = 0; i < 150; i++) {
        starsArray.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.5,
            opacity: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            sign: 1
        });
    }

    // Occasional Meteors
    for (let i = 0; i < 2; i++) {
        resetMeteor(w, h, i);
    }

    function resetMeteor(width, height, idx) {
        meteorsArray[idx] = {
            x: Math.random() * width * 0.8 + width * 0.2,
            y: -100,
            len: Math.random() * 100 + 50,
            speed: Math.random() * 12 + 6,
            thickness: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            cooldown: Math.floor(Math.random() * 300) + 100
        };
    }

    window.addEventListener("resize", () => {
        w = cosmicBgCanvas.width = window.innerWidth;
        h = cosmicBgCanvas.height = window.innerHeight;
    });

    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX - w / 2) * 0.05;
        mouseY = (e.clientY - h / 2) * 0.05;
    });

    function renderCosmicBg() {
        const isLight = document.body.classList.contains("light");

        if (isLight) {
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(0, 0, w, h);

            // Light atmospheric sky radial gradient
            let nebulaGrad = ctx.createRadialGradient(
                w / 2 + mouseX, h / 2 + mouseY, 10,
                w / 2, h / 2, Math.max(w, h)
            );
            nebulaGrad.addColorStop(0, "rgba(224, 242, 254, 0.8)");
            nebulaGrad.addColorStop(0.4, "rgba(241, 245, 249, 0.6)");
            nebulaGrad.addColorStop(1, "rgba(248, 250, 252, 1)");
            ctx.fillStyle = nebulaGrad;
            ctx.fillRect(0, 0, w, h);

            // Draw Stars (soft blue/slate particle nodes)
            ctx.fillStyle = "#2563eb";
            starsArray.forEach(s => {
                s.opacity += s.twinkleSpeed * s.sign;
                if (s.opacity >= 1 || s.opacity <= 0.15) s.sign *= -1;

                let px = s.x - mouseX * 0.3;
                let py = s.y - mouseY * 0.3;

                if (px < 0) px = w;
                if (px > w) px = 0;
                if (py < 0) py = h;
                if (py > h) py = 0;

                ctx.globalAlpha = s.opacity * 0.5;
                ctx.beginPath();
                ctx.arc(px, py, s.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // Draw Meteors
            meteorsArray.forEach((m, idx) => {
                if (m.cooldown > 0) {
                    m.cooldown--;
                    return;
                }
                ctx.strokeStyle = `rgba(37, 99, 235, ${m.opacity * 0.6})`;
                ctx.lineWidth = m.thickness;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x - m.len, m.y + m.len);
                ctx.stroke();

                m.x -= m.speed;
                m.y += m.speed;

                if (m.y > h + 100 || m.x < -100) {
                    resetMeteor(w, h, idx);
                }
            });
        } else {
            ctx.fillStyle = "#020205";
            ctx.fillRect(0, 0, w, h);

            let nebulaGrad = ctx.createRadialGradient(
                w / 2 + mouseX, h / 2 + mouseY, 10,
                w / 2, h / 2, Math.max(w, h)
            );
            nebulaGrad.addColorStop(0, "rgba(10, 10, 30, 0.6)");
            nebulaGrad.addColorStop(0.3, "rgba(8, 5, 20, 0.4)");
            nebulaGrad.addColorStop(1, "rgba(2, 2, 5, 1)");
            ctx.fillStyle = nebulaGrad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = "#ffffff";
            starsArray.forEach(s => {
                s.opacity += s.twinkleSpeed * s.sign;
                if (s.opacity >= 1 || s.opacity <= 0.1) s.sign *= -1;

                let px = s.x - mouseX * 0.3;
                let py = s.y - mouseY * 0.3;

                if (px < 0) px = w;
                if (px > w) px = 0;
                if (py < 0) py = h;
                if (py > h) py = 0;

                ctx.globalAlpha = s.opacity;
                ctx.beginPath();
                ctx.arc(px, py, s.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            meteorsArray.forEach((m, idx) => {
                if (m.cooldown > 0) {
                    m.cooldown--;
                    return;
                }
                ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity})`;
                ctx.lineWidth = m.thickness;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x - m.len, m.y + m.len);
                ctx.stroke();

                m.x -= m.speed;
                m.y += m.speed;

                if (m.y > h + 100 || m.x < -100) {
                    resetMeteor(w, h, idx);
                }
            });
        }

        requestAnimationFrame(renderCosmicBg);
    }
    renderCosmicBg();
}

//--------------------------------------------------
// 6. HERO INTERACTIVE GLOBE & ORBITS
//--------------------------------------------------
function initHeroGlobe() {
    const canvas = document.getElementById("heroGlobeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let size = canvas.width = canvas.height = 450;
    let cx = size / 2;
    let cy = size / 2;
    let earthRadius = 110;
    let rotationAngle = 0;
    let moonAngle = 0;

    // Draw Earth surface features (continents mock coordinates)
    const continents = [
        [-50, -20, 30], [20, 10, 45], [-10, 30, 20], [60, -30, 15],
        [-70, 50, 25], [10, -50, 35], [50, 40, 20]
    ];

    function drawGlobe() {
        ctx.clearRect(0, 0, size, size);

        // Satellites orbital path ellipse background
        ctx.strokeStyle = "rgba(79, 172, 254, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 210, 70, -Math.PI / 12, 0, Math.PI * 2);
        ctx.stroke();

        // 1. Atmosphere glowing ring
        let glowGrad = ctx.createRadialGradient(cx, cy, earthRadius - 10, cx, cy, earthRadius + 45);
        glowGrad.addColorStop(0, "rgba(0, 242, 254, 0.3)");
        glowGrad.addColorStop(0.3, "rgba(79, 172, 254, 0.15)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius + 45, 0, Math.PI * 2);
        ctx.fill();

        // 2. Earth base ocean sphere
        ctx.fillStyle = "#0c152b";
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
        ctx.fill();

        // Ocean depth inner shadow
        let innerShadow = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, earthRadius);
        innerShadow.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        innerShadow.addColorStop(0.8, "rgba(0, 0, 0, 0.7)");
        innerShadow.addColorStop(1, "#000000");
        ctx.fillStyle = innerShadow;
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Draw continents rotating
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
        ctx.clip(); // Keep continents inside Earth boundaries

        rotationAngle += 0.003;
        ctx.fillStyle = "#10b981"; // Vibrant land green
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#10b981";

        continents.forEach(c => {
            let theta = (c[0] * Math.PI) / 180 + rotationAngle;
            let phi = (c[1] * Math.PI) / 180;

            // Sphere projections orthographic
            let px = cx + earthRadius * Math.cos(phi) * Math.sin(theta);
            let py = cy + earthRadius * Math.sin(phi);
            let depth = Math.cos(phi) * Math.cos(theta); // Visibility depth parameter

            if (depth > 0) { // Only draw front side
                ctx.globalAlpha = depth;
                ctx.beginPath();
                ctx.arc(px, py, c[2] * depth, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // 4. Moon orbiting Earth
        moonAngle += 0.007;
        let moonDistX = 180;
        let moonDistY = 50;
        let mx = cx + moonDistX * Math.cos(moonAngle);
        let my = cy + moonDistY * Math.sin(moonAngle);

        let moonZ = Math.sin(moonAngle); // Positive means behind Earth

        if (moonZ < 0) {
            drawMoon(mx, my);
        }

        // 5. Draw satellites rotating
        let satAngle = -moonAngle * 1.5;
        let sx = cx + 210 * Math.cos(satAngle);
        let sy = cy + 70 * Math.sin(satAngle);
        // Tilt satellite coordinates
        let rotatedSx = cx + (sx - cx) * Math.cos(-Math.PI / 12) - (sy - cy) * Math.sin(-Math.PI / 12);
        let rotatedSy = cy + (sx - cx) * Math.sin(-Math.PI / 12) + (sy - cy) * Math.cos(-Math.PI / 12);

        ctx.fillStyle = "#00f2fe";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00f2fe";
        ctx.beginPath();
        ctx.arc(rotatedSx, rotatedSy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Redraw Moon if it is in front of Earth (depth sorting)
        if (moonZ >= 0) {
            drawMoon(mx, my);
        }

        requestAnimationFrame(drawGlobe);
    }

    function drawMoon(x, y) {
        ctx.fillStyle = "#cbd5e1";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Moon shade layer
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(x + 3, y, 14, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
    }

    drawGlobe();
}

//--------------------------------------------------
// 7. NASA APOD CONTROLLER (IMPROVED)
//--------------------------------------------------
async function getAPOD(selectedDate = "") {
    showLoader();
    try {
        let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
        if (selectedDate) {
            url += `&date=${selectedDate}`;
        }

        // Cache API responses to prevent rate limits
        let cacheKey = "apod_" + (selectedDate || "today");
        let cached = sessionStorage.getItem(cacheKey);
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Unable to fetch APOD payload.");
            data = await response.json();
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        currentImage = data.hdurl || data.url;

        const apodImage = document.getElementById("apodImage");
        const title = document.getElementById("title");
        const description = document.getElementById("description");
        const dateEl = document.getElementById("date");

        if (data.media_type === "image") {
            apodImage.style.display = "block";
            apodImage.src = data.url;

            // Extract dynamic color background glow once image completes load
            apodImage.onload = () => {
                extractImageColor(apodImage);
            };
        } else {
            // Video fallback
            apodImage.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";
            showToast("🎥 Space Video Signal Detected! Click fullscreen to watch.");
        }

        title.textContent = data.title || "Cosmic Telemetry Signal";
        description.textContent = data.explanation || "No scientific explanation recorded for this solar coordinates.";
        dateEl.textContent = data.date;

        updateCounter();
        updateFavoriteButton();
        generateCosmicFact(data.title + " " + data.explanation);
    } catch (error) {
        console.error(error);
        showToast("⚠️ API TELEMETRY HANDSHAKE FAILED");
    } finally {
        hideLoader();
    }
}

// Extract primary pixel color from image to set dynamic glass-glow backdrops
function extractImageColor(imgEl) {
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(imgEl, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));

        const extractedGlow = document.getElementById("apodExtractedGlow");
        if (extractedGlow) {
            extractedGlow.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
    } catch (e) {
        // CORS restriction on local canvas pixel grabs, fallback to default primary color
        const extractedGlow = document.getElementById("apodExtractedGlow");
        if (extractedGlow) extractedGlow.style.backgroundColor = "var(--primary)";
    }
}

// Generate interesting space facts based on keywords detected in image summaries
function generateCosmicFact(fullText) {
    const textLower = fullText.toLowerCase();
    const factTextEl = document.getElementById("aiCosmicFactText");
    if (!factTextEl) return;

    let matchedFact = "Fact: Space is completely silent. Sound wave compressions need atmospheric particles to travel, leaving cosmic structures in absolute silence.";

    // Check keywords
    for (let key in CELESTIAL_DICTIONARY) {
        if (textLower.includes(key)) {
            matchedFact = `Fact Analysis: ${CELESTIAL_DICTIONARY[key]}`;
            break;
        }
    }

    factTextEl.textContent = matchedFact;
}

//--------------------------------------------------
// 8. SEARCH HISTORY MANAGER
//--------------------------------------------------
function saveSearch(date) {
    if (!searchHistory.includes(date)) {
        searchHistory.push(date);
        if (searchHistory.length > 5) searchHistory.shift();
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        renderSearchHistoryBadges();
    }
}

function renderSearchHistoryBadges() {
    const container = document.getElementById("queryHistoryBadges");
    if (!container) return;

    if (searchHistory.length === 0) {
        container.innerHTML = `<span class="log-badge-empty">No recent logs</span>`;
        return;
    }

    container.innerHTML = "";
    searchHistory.forEach(date => {
        const badge = document.createElement("span");
        badge.className = "history-query-badge font-orbitron";
        badge.textContent = date;
        badge.addEventListener("click", () => {
            document.getElementById("dateInput").value = date;
            getAPOD(date);
            playBeep(440, 0.1);
        });
        container.appendChild(badge);
    });
}

//--------------------------------------------------
// 9. MARS ROVER TELEMETRY SCANNER
//--------------------------------------------------
async function loadMarsPhotos() {
    const marsGallery = document.getElementById("marsGallery");
    const selectRover = document.getElementById("marsRoverSelect").value;
    const selectCamera = document.getElementById("marsCameraSelect").value;
    const inputSol = document.getElementById("marsSolInput").value;

    if (!marsGallery) return;
    showLoader();
    marsGallery.innerHTML = "";

    try {
        let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectRover}/photos?sol=${inputSol}&api_key=${API_KEY}`;
        if (selectCamera !== "all") {
            url += `&camera=${selectCamera}`;
        }

        let cacheKey = `mars_${selectRover}_${selectCamera}_${inputSol}`;
        let cached = sessionStorage.getItem(cacheKey);
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Surface signal returned HTTP ${response.status}`);
            data = await response.json();
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        if (!data.photos || data.photos.length === 0) {
            marsGallery.innerHTML = `
                <div class="mars-empty-state font-orbitron">
                    <i class="fa-solid fa-triangle-exclamation text-orange"></i>
                    <p>TRANSMISSION TIMEOUT: NO CAPTURED PHOTOGRAPHS AT THIS SOL COORDINATE.</p>
                </div>
            `;
            return;
        }

        // Display up to 12 photos
        data.photos.slice(0, 12).forEach(photo => {
            const card = document.createElement("div");
            card.className = "mars-card hover-tilt";
            card.innerHTML = `
                <img src="${photo.img_src}" alt="Mars Surface Image" class="mars-image lazy-load">
                <div class="mars-info">
                    <h3>${photo.rover.name} Unit</h3>
                    <p><strong>Camera:</strong> ${photo.camera.full_name}</p>
                    <p><strong>Earth Date:</strong> ${photo.earth_date}</p>
                    <button class="view-btn">Full Telemetry</button>
                </div>
            `;

            card.querySelector(".mars-image").addEventListener("click", () => openModal(photo.img_src));
            card.querySelector(".view-btn").addEventListener("click", () => openModal(photo.img_src));

            marsGallery.appendChild(card);
            updateCounter();
        });

        showToast(`🛰 RECEIVED ${Math.min(data.photos.length, 12)} MARTIAN PICTURES`);

    } catch (err) {
        console.error(err);
        showToast("⚠️ SURFACE TRANSMISSION LINK ERROR");
    } finally {
        hideLoader();
    }
}

//--------------------------------------------------
// 10. EARTH EPIC & CLIMATE DASHBOARD
//--------------------------------------------------
async function loadLatestEarthImage() {
    showLoader();
    const earthImage = document.getElementById("earthImage");
    const earthDate = document.getElementById("earthDate");

    if (!earthImage) return;

    try {
        let cacheKey = "earth_epic_natural";
        let cached = sessionStorage.getItem(cacheKey);
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${API_KEY}`);
            if (!response.ok) throw new Error("EPIC satellite unresponsive.");
            data = await response.json();
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        if (data.length === 0) throw new Error("Null image catalog returned from L1 orbit.");

        const latest = data[0];
        const dateStr = latest.date.split(" ")[0]; // YYYY-MM-DD
        earthDate.textContent = `EPIC Frame: ${latest.date}`;

        earthImage.src = `https://epic.gsfc.nasa.gov/archive/natural/${dateStr.replace(/-/g, "/")}/jpg/${latest.image}.jpg`;
        updateCounter();
        showToast("🌎 EARTH EPIC TELEMETRY FETCHED");

    } catch (e) {
        console.error(e);
        showToast(e.message);
    } finally {
        hideLoader();
    }
}

// Fetch climate disasters feed using NASA EONET API
async function loadClimateAnomalies() {
    const eventList = document.getElementById("climateEventList");
    if (!eventList) return;

    try {
        let cached = sessionStorage.getItem("climate_eonet");
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?limit=8");
            if (!response.ok) throw new Error();
            data = await response.json();
            sessionStorage.setItem("climate_eonet", JSON.stringify(data));
        }

        eventList.innerHTML = "";
        data.events.forEach(ev => {
            const item = document.createElement("div");
            item.className = "event-item";

            // Map category IDs to custom class/badges
            let catColor = "hazard-safe";
            let emoji = "🔥";
            if (ev.categories[0].id === "wildfires") {
                catColor = "hazard-alert";
                emoji = "🔥 Wildfire";
            } else if (ev.categories[0].id === "severeStorms") {
                catColor = "hazard-alert";
                emoji = "🌀 Cyclone";
            } else if (ev.categories[0].id === "volcanoes") {
                catColor = "hazard-alert";
                emoji = "🌋 Volcano";
            } else {
                emoji = "🌊 " + ev.categories[0].title;
            }

            item.innerHTML = `
                <div class="event-meta">
                    <span class="event-name">${ev.title}</span>
                    <span class="event-date-text">Coordinates tracked: ${ev.geometry[0].coordinates.join(", ")}</span>
                </div>
                <span class="event-badge ${catColor}">${emoji}</span>
            `;
            eventList.appendChild(item);
        });

    } catch (err) {
        eventList.innerHTML = `<p class="font-inter" style="font-size:12px;color:var(--text-muted)">Unable to sync planetary disaster grids.</p>`;
    }
}

//--------------------------------------------------
// 11. SPACE CONTROL CENTER trackers (ISS, Asteroid, Rocket, Space Weather)
//--------------------------------------------------

// Live ISS map tracking
async function trackLiveISS() {
    try {
        const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!response.ok) throw new Error();
        const data = await response.json();

        const lat = parseFloat(data.latitude).toFixed(4);
        const lon = parseFloat(data.longitude).toFixed(4);
        const alt = parseFloat(data.altitude).toFixed(1);
        const vel = parseFloat(data.velocity).toFixed(0);

        // Update UI panels
        document.getElementById("issVelocity").textContent = `${Number(vel).toLocaleString()} km/h`;
        document.getElementById("issAltitude").textContent = `${alt} km`;
        document.getElementById("issCoordinates").textContent = `${lat}° N, ${lon}° E`;
        document.getElementById("telemetryISS").textContent = `${alt} km`;

        // Next Pass mockup countdown
        document.getElementById("issNextPass").textContent = "02h 45m 12s";

        // Draw on Leaflet Map
        const pos = [lat, lon];

        if (!issMap) {
            document.getElementById("issMap").innerHTML = ""; // Clear placeholder
            issMap = L.map("issMap").setView(pos, 3);

            // Custom Dark theme tiles (CartoDB Dark Matter tile layer)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CartoDB',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(issMap);

            // Custom ISS marker icon
            const issIcon = L.divIcon({
                html: '<i class="fa-solid fa-satellite" style="font-size:24px;color:var(--secondary);filter:drop-shadow(0 0 8px var(--secondary))"></i>',
                className: 'custom-leaflet-iss-marker',
                iconSize: [24, 24]
            });
            issMarker = L.marker(pos, { icon: issIcon }).addTo(issMap);
        } else {
            issMarker.setLatLng(pos);
            // Auto pan map along with satellite path
            issMap.panTo(pos);
        }

        // Draw orbital trail line
        issPath.push(pos);
        if (issPath.length > 50) issPath.shift(); // Keep only latest 50 segments

        if (issPathLine) {
            issPathLine.setLatLngs(issPath);
        } else {
            issPathLine = L.polyline(issPath, { color: 'var(--primary)', weight: 2, opacity: 0.8 }).addTo(issMap);
        }

    } catch (e) {
        console.warn("Unable to establish handshake with tracking satellite transponder.");
    }
}

// Asteroid radar tracker (NASA NeoWS)
async function fetchAsteroidRadar() {
    const listEl = document.getElementById("asteroidRadarList");
    if (!listEl) return;

    try {
        const today = new Date().toISOString().split("T")[0];

        let cacheKey = "neo_" + today;
        let cached = sessionStorage.getItem(cacheKey);
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`);
            if (!response.ok) throw new Error();
            data = await response.json();
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        const asteroids = data.near_earth_objects[today];
        listEl.innerHTML = "";

        // Sort closest first and limit to top 4
        const sortedNeo = asteroids.sort((a, b) => {
            return parseFloat(a.close_approach_data[0].miss_distance.kilometers) - parseFloat(b.close_approach_data[0].miss_distance.kilometers);
        }).slice(0, 4);

        document.getElementById("heroStatAsteroids").textContent = `0${sortedNeo.length} Passed`;

        sortedNeo.forEach(neo => {
            const name = neo.name;
            const dist = parseFloat(neo.close_approach_data[0].miss_distance.kilometers);
            const hazard = neo.is_potentially_hazardous_asteroid;
            const speed = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0);
            const diameter = ((neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max) / 2).toFixed(0);

            const item = document.createElement("div");
            item.className = "asteroid-item";
            item.innerHTML = `
                <div class="neo-meta">
                    <span class="neo-name">${name}</span>
                    <span class="neo-dist">Distance: ${(dist / 1000000).toFixed(2)}M km | Velocity: ${Number(speed).toLocaleString()} km/h</span>
                    <span class="neo-dist">Dia: ${diameter}m</span>
                </div>
                <span class="neo-shadow-line"></span>
                <span class="neo-hazard-indicator ${hazard ? 'hazard-alert' : 'hazard-safe'} font-orbitron">
                    ${hazard ? '🚨 HAZARD' : 'SAFE'}
                </span>
            `;
            listEl.appendChild(item);
        });

    } catch (e) {
        listEl.innerHTML = `<p class="font-inter" style="font-size:12px;color:var(--text-muted)">Asteroid database offline.</p>`;
    }
}

// Upcoming Rocket Launch Schedule
let launchesDataMock = [
    { title: "Falcon 9 Block 5 | Starlink Group 10-4", pad: "Vandenberg SFB, CA", date: "Jul 15, 2026 14:30:00", targetMs: 0 },
    { title: "GSLV Mk II | INSAT-3DS", pad: "Satish Dhawan Space Centre, Sriharikota", date: "Jul 19, 2026 10:15:00", targetMs: 0 },
    { title: "Ariane 6 | Sentinel-1C Payload", pad: "Guiana Space Centre, Kourou", date: "Jul 28, 2026 18:45:00", targetMs: 0 }
];

function initLaunchSchedule() {
    const listEl = document.getElementById("launchesSubList");
    const nextLaunchTitle = document.getElementById("nextLaunchTitle");
    const nextLaunchPad = document.getElementById("nextLaunchPad");

    if (!listEl) return;

    // Convert date string into timestamp
    launchesDataMock.forEach(l => {
        l.targetMs = new Date(l.date).getTime();
    });

    // Populate upcoming list
    listEl.innerHTML = "";
    launchesDataMock.slice(1).forEach(l => {
        const item = document.createElement("div");
        item.className = "launch-sub-item";
        item.innerHTML = `
            <div class="l-info">
                <span class="l-name">${l.title}</span>
                <span class="l-pad">${l.pad}</span>
            </div>
            <span class="l-date">${l.date.split(" ")[0] + " " + l.date.split(" ")[1]}</span>
        `;
        listEl.appendChild(item);
    });

    // Countdown loop for the nearest launch
    const countdownEl = document.getElementById("nextLaunchCountdown");
    const nextL = launchesDataMock[0];
    nextLaunchTitle.textContent = nextL.title;
    nextLaunchPad.textContent = nextL.pad;

    setInterval(() => {
        const now = new Date().getTime();
        const diff = nextL.targetMs - now;

        if (diff <= 0) {
            countdownEl.textContent = "LAUNCH UNDERWAY 🚀";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.textContent = `
            ${days.toString().padStart(2, '0')}d : 
            ${hours.toString().padStart(2, '0')}h : 
            ${minutes.toString().padStart(2, '0')}m : 
            ${seconds.toString().padStart(2, '0')}s
        `;
    }, 1000);
}

// Space weather telemetry alerts & gauges
function initSpaceWeather() {
    const kpDialFill = document.getElementById("kpDialFill");
    const kpDialNum = document.getElementById("kpDialNum");
    const telemetryKP = document.getElementById("telemetryKP");
    if (!kpDialFill) return;

    // Simulate space weather parameters slightly changing over time
    setInterval(() => {
        const kpVal = (Math.random() * 3 + 1.2).toFixed(2);
        const wind = Math.floor(Math.random() * 150 + 380);
        const spots = Math.floor(Math.random() * 20 + 55);
        const aurora = Math.floor((kpVal / 9) * 100);

        // Update KP Indicator Circle (Stroke Dash offset math)
        // Max stroke dash array = 251.2
        const fillPercent = kpVal / 9;
        const offset = 251.2 - (251.2 * fillPercent);
        kpDialFill.style.strokeDashoffset = offset;
        kpDialNum.textContent = kpVal;
        telemetryKP.textContent = `${kpVal} (Active)`;

        // Update sub values
        document.getElementById("valSolarWind").textContent = `${wind} km/s`;
        document.getElementById("valSunspots").textContent = `${spots} Units`;
        document.getElementById("valAurora").textContent = `${aurora}% Chance`;

        // Update status warning card
        const alertBox = document.getElementById("solarAlertsBox");
        if (kpVal > 4.0) {
            alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-yellow"></i> <strong>GEOMAGNETIC WARNING:</strong> Minor storm activity tracked (Class G1). Auroral oval visibility expanding to sub-polar latitudes.`;
            alertBox.style.backgroundColor = "rgba(250, 204, 21, 0.15)";
            alertBox.style.borderColor = "var(--yellow)";
        } else {
            alertBox.innerHTML = `<i class="fa-solid fa-sun text-yellow"></i> <strong>Telemetry Signal:</strong> Magnetosphere is stable. Solar wind streaming at normal speeds.`;
            alertBox.style.backgroundColor = "rgba(16, 185, 129, 0.05)";
            alertBox.style.borderColor = "var(--green)";
        }
    }, 4000);
}

//--------------------------------------------------
// 12. CELESTIAL WATCH CALCULATORS (Visibility & Moon)
//--------------------------------------------------

// Geolocation binding
const btnGeolocate = document.getElementById("btnGeolocate");
if (btnGeolocate) {
    btnGeolocate.addEventListener("click", () => {
        playBeep(520, 0.12);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                document.getElementById("latInput").value = position.coords.latitude.toFixed(2);
                document.getElementById("lonInput").value = position.coords.longitude.toFixed(2);
                calculateCelestials();
                showToast("📍 GEOLOCATION HANDSHAKE COMPLETE");
            }, () => {
                showToast("❌ GEOLOCATION REQUEST BLOCKED");
            });
        } else {
            showToast("❌ LOCATION SERVICES NOT SUPPORTED");
        }
    });
}

function calculateCelestials() {
    const lat = parseFloat(document.getElementById("latInput").value);
    const lon = parseFloat(document.getElementById("lonInput").value);
    const planetsCount = document.getElementById("visiblePlanetsCount");
    const photoRating = document.getElementById("photographyRating");
    const checklist = document.getElementById("celestialChecklist");

    if (!planetsCount) return;

    // Simulated celestial alignment formulas based on coordinate grids
    let visibleCount = 2;
    let rating = "Fair";
    let listHTML = "";

    if (lat > 10 && lat < 45) {
        visibleCount = 4;
        rating = "Excellent";
        listHTML = `
            <li><i class="fa-solid fa-circle-check text-green"></i> Jupiter (Visible in East at 21:15, magnitude -2.4)</li>
            <li><i class="fa-solid fa-circle-check text-green"></i> Saturn (Visible overhead at 23:45, rings resolved)</li>
            <li><i class="fa-solid fa-circle-check text-green"></i> Mars (Visible in East horizon at 02:00)</li>
            <li><i class="fa-solid fa-circle-check text-green"></i> Milky Way Core (Excellent visibility, low atmospheric moisture)</li>
            <li><i class="fa-solid fa-circle-xmark text-red"></i> Venus (Below horizon)</li>
        `;
    } else {
        visibleCount = 2;
        rating = "Good";
        listHTML = `
            <li><i class="fa-solid fa-circle-check text-green"></i> Jupiter (Visible in Southeast at 20:00)</li>
            <li><i class="fa-solid fa-circle-check text-green"></i> Saturn (Visible in South at 22:30)</li>
            <li><i class="fa-solid fa-circle-xmark text-red"></i> Mars (Below horizon)</li>
            <li><i class="fa-solid fa-circle-xmark text-red"></i> Milky Way Core (Obscured by horizon angle)</li>
        `;
    }

    planetsCount.textContent = `${visibleCount} Objects`;
    photoRating.textContent = rating;
    checklist.innerHTML = listHTML;
}

// Moon Phase mathematics
function calculateMoonPhase() {
    const nameEl = document.getElementById("moonPhaseName");
    const illuminationEl = document.getElementById("moonIllumination");
    const riseSetEl = document.getElementById("moonRiseSet");
    const nextFullEl = document.getElementById("moonNextFull");
    const shadowLayer = document.getElementById("moonShadowLayer");

    if (!nameEl) return;

    // Compute simple lunar cycle phase
    const cyclePeriod = 29.53;
    const baseDate = new Date("2026-07-06"); // Mock New Moon base
    const today = new Date();
    const diffDays = (today - baseDate) / (1000 * 60 * 60 * 24);
    const age = diffDays % cyclePeriod;

    let phase = "";
    let illumination = 0;
    let clipOffset = 0; // translation parameter for shadow overlay SVG

    if (age < 1.84) {
        phase = "New Moon";
        illumination = 0;
        clipOffset = 100;
    } else if (age < 5.53) {
        phase = "Waxing Crescent";
        illumination = 25;
        clipOffset = 75;
    } else if (age < 9.22) {
        phase = "First Quarter";
        illumination = 50;
        clipOffset = 50;
    } else if (age < 12.91) {
        phase = "Waxing Gibbous";
        illumination = 75;
        clipOffset = 25;
    } else if (age < 16.61) {
        phase = "Full Moon";
        illumination = 100;
        clipOffset = 0;
    } else if (age < 20.3) {
        phase = "Waning Gibbous";
        illumination = 75;
        clipOffset = -25;
    } else if (age < 23.99) {
        phase = "Third Quarter";
        illumination = 50;
        clipOffset = -50;
    } else {
        phase = "Waning Crescent";
        illumination = 25;
        clipOffset = -75;
    }

    nameEl.textContent = phase;
    illuminationEl.textContent = `${illumination}% Illumination`;
    riseSetEl.textContent = "18:45 / 05:22";

    const daysToFull = Math.ceil((14.76 - age + cyclePeriod) % cyclePeriod);
    nextFullEl.textContent = `${daysToFull} Days (August ${new Date(today.getTime() + daysToFull * 24 * 60 * 60 * 1000).getDate()})`;

    // Rotate/shift the clip mask layer overlay
    if (shadowLayer) {
        shadowLayer.style.transform = `translateX(${clipOffset}%)`;
    }
}

//--------------------------------------------------
// 13. INTERACTIVE HISTORY TIMELINE SLIDER
//--------------------------------------------------
function initHistoryTimeline() {
    const nodesContainer = document.getElementById("timelineNodes");
    if (!nodesContainer) return;

    nodesContainer.innerHTML = "";
    TIMELINE_DATA.forEach((data, index) => {
        const node = document.createElement("div");
        node.className = `timeline-node ${index === 4 ? 'active' : ''}`;
        node.setAttribute("data-idx", index);
        node.innerHTML = `
            <span class="node-year font-orbitron">${data.year}</span>
            <span class="node-circle"></span>
        `;
        node.addEventListener("click", () => {
            playBeep(660, 0.08);
            document.querySelectorAll(".timeline-node").forEach(n => n.classList.remove("active"));
            node.classList.add("active");
            updateTimelineDrawer(index);
        });
        nodesContainer.appendChild(node);
    });

    updateTimelineDrawer(4); // Default to JWST Year
}

function updateTimelineDrawer(index) {
    const data = TIMELINE_DATA[index];
    if (!data) return;

    const yearEl = document.getElementById("drawerYear");
    const titleEl = document.getElementById("drawerTitle");
    const agencyEl = document.getElementById("drawerAgency");
    const descEl = document.getElementById("drawerDesc");
    const imgEl = document.getElementById("drawerImage");

    if (yearEl) yearEl.textContent = data.year;
    if (titleEl) titleEl.textContent = data.title;
    if (agencyEl) agencyEl.textContent = `Operations Agency: ${data.agency}`;
    if (descEl) descEl.textContent = data.desc;

    if (imgEl) {
        imgEl.style.transition = "opacity 0.3s ease";
        imgEl.onerror = function() {
            this.onerror = null;
            this.src = "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80";
            this.style.opacity = "1";
        };
        imgEl.onload = function() {
            this.style.opacity = "1";
        };
        imgEl.src = data.img;
        imgEl.alt = data.title;

        if (imgEl.complete) {
            imgEl.style.opacity = "1";
        }
    }
}

//--------------------------------------------------
// 14. ONBOARD AI ASSISTANT CHATBOT (T.A.R.S.)
//--------------------------------------------------
const BOT_REPLIES = {
    hello: "Greetings, voyager. Encryption pipelines clear. Telemetry channels fully synchronized. How may I assist your coordinates today?",
    apod: "APOD stands for Astronomy Picture of the Day. Our platform coordinates a secure uplink with NASA's space catalogs to download HD snapshots daily.",
    saturn: "Saturn is currently in orbital transit. Peak visibility occurs in the early morning sky at a 32-degree elevation. A telescope of minimum 4.5\" aperture is required to resolve ring lines clearly.",
    galaxy: "Galaxies are gargantuan star wheels held by dark matter. The nearest major structure, Andromeda, contains double the stars of the Milky Way and is approaching us at orbital speeds.",
    iss: "The International Space Station orbits at an altitude of approximately 420km, circling Earth every 90 minutes at a speed of 27,600 km/h. Check our live control center map widget to see its footprint.",
    eclipse: "Eclipses are precise alignments of planetary shadows. Our Astronomical Events calendar tracks the next Annular Solar Eclipse on October 14, 2026.",
    moon: "The Moon phase calculator computes that we are in a Gibbous stage. Next full illumination is expected in several solar rotations.",
    help: "I can process queries concerning: 'APOD', 'Saturn visibility', 'Galaxies', 'ISS tracking coordinate logs', and 'Space Calendar schedules'."
};

function initChatbot() {
    const toggleBtn = document.getElementById("chatbotToggle");
    const windowEl = document.getElementById("chatbotWindow");
    const inputEl = document.getElementById("chatbotInput");
    const sendBtn = document.getElementById("chatbotSendBtn");
    const clearBtn = document.getElementById("clearChatBtn");

    if (!toggleBtn || !windowEl) return;

    // Toggle expand
    toggleBtn.addEventListener("click", () => {
        playBeep(440, 0.1, 'triangle');
        windowEl.classList.toggle("hidden");
        document.querySelector(".chatbot-icon-closed").classList.toggle("hidden");
        document.querySelector(".chatbot-icon-opened").classList.toggle("hidden");

        // Hide badge ping
        const badge = document.querySelector(".chatbot-badge-ping");
        if (badge) badge.style.display = "none";
    });

    // Clear chats
    clearBtn.addEventListener("click", () => {
        playBeep(330, 0.1);
        const msgs = document.getElementById("chatbotMessages");
        msgs.innerHTML = `
            <div class="msg bot-msg font-inter">
                <p>Chat cache flushed. Telemetry re-initialized. Ask me anything about planetary coordinates:</p>
            </div>
        `;
    });

    // Send click
    sendBtn.addEventListener("click", processChatInput);
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") processChatInput();
    });

    // Preset keyword clicks
    document.querySelectorAll(".chat-kw-trigger").forEach(el => {
        el.addEventListener("click", () => {
            inputEl.value = el.textContent.replace(/"/g, "");
            processChatInput();
        });
    });
}

// Helper to escape HTML and format simple markdown (bold, italic, code, line breaks)
function formatMarkdown(text) {
    const div = document.createElement("div");
    div.textContent = text;
    let escaped = div.innerHTML;

    // Convert **bold** to <strong>bold</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Convert *italic* to <em>italic</em>
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert `code` to code tags
    escaped = escaped.replace(/`(.*?)`/g, '<code style="background: rgba(255, 255, 255, 0.15); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

    // Convert newlines to breaks
    escaped = escaped.replace(/\n/g, "<br>");

    return escaped;
}

async function processChatInput() {
    const inputEl = document.getElementById("chatbotInput");
    const messagesEl = document.getElementById("chatbotMessages");
    const query = inputEl.value.trim();

    if (!query) return;
    playBeep(580, 0.05);

    // 1. Append User Message (safely escaping content)
    const userDiv = document.createElement("div");
    userDiv.className = "msg user-msg font-inter";
    userDiv.innerHTML = `<p></p>`;
    userDiv.querySelector("p").textContent = query;
    messagesEl.appendChild(userDiv);
    inputEl.value = "";

    // Scroll
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // 2. Append Typing Indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "msg bot-msg font-inter typing-indicator";
    typingDiv.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin-pulse text-cyan"></i> T.A.R.S. is calculating orbit parameters...</p>`;
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // 3. Compute Bot Response
    const qLower = query.toLowerCase();
    let replyText = "";

    // Check if we should use local replies for basic instant greetings or help
    if (qLower === "hello" || qLower === "hi" || qLower === "hey") {
        replyText = BOT_REPLIES.hello;
    } else if (qLower === "help") {
        replyText = BOT_REPLIES.help;
    }

    if (replyText) {
        // Local reply with short delay to feel natural
        setTimeout(() => {
            typingDiv.remove();
            const botDiv = document.createElement("div");
            botDiv.className = "msg bot-msg font-inter";
            botDiv.innerHTML = `<p>${formatMarkdown(replyText)}</p>`;
            messagesEl.appendChild(botDiv);
            playBeep(700, 0.08, 'square');
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 500);
        return;
    }

    // Call Pollinations.ai text generation endpoint for space questions
    try {
        const systemPrompt = "You are T.A.R.S., an advanced space exploration AI assistant onboard the COSMA platform. Keep your answers scientific, highly advanced, and focused on space, physics, astronomy, and planetary science. Keep answers relatively concise (1-3 paragraphs max). Address the user as explorer or voyager.";
        
        const response = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query }
                ],
                model: "openai"
            })
        });

        if (!response.ok) {
            throw new Error("API downlink error");
        }

        replyText = await response.text();
    } catch (error) {
        console.error("Chatbot API Error:", error);
        // Fallback logic on network/API failure
        if (qLower.includes("apod")) {
            replyText = BOT_REPLIES.apod;
        } else if (qLower.includes("saturn")) {
            replyText = BOT_REPLIES.saturn;
        } else if (qLower.includes("galaxy") || qLower.includes("galaxies")) {
            replyText = BOT_REPLIES.galaxy;
        } else if (qLower.includes("iss") || qLower.includes("satellite")) {
            replyText = BOT_REPLIES.iss;
        } else if (qLower.includes("eclipse")) {
            replyText = BOT_REPLIES.eclipse;
        } else if (qLower.includes("moon")) {
            replyText = BOT_REPLIES.moon;
        } else {
            replyText = "⚠️ Downlink connection degraded. " + BOT_REPLIES.help;
        }
    }

    // Remove typing indicator and append bot response
    typingDiv.remove();
    const botDiv = document.createElement("div");
    botDiv.className = "msg bot-msg font-inter";
    botDiv.innerHTML = `<p>${formatMarkdown(replyText)}</p>`;
    messagesEl.appendChild(botDiv);
    
    playBeep(700, 0.08, 'square');
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

//--------------------------------------------------
// 15. CUSTOM GLOW CURSOR & TILT WIDGETS
//--------------------------------------------------
function initCursorGlowAndTilts() {
    const glowCursor = document.getElementById("glowCursor");
    if (!glowCursor) return;

    window.addEventListener("mousemove", (e) => {
        glowCursor.style.left = e.clientX + "px";
        glowCursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("button, a, input, select").forEach(item => {
        item.addEventListener("mouseenter", () => glowCursor.classList.add("active"));
        item.addEventListener("mouseleave", () => glowCursor.classList.remove("active"));
    });

    // Tilt Effect on elements (SpaceX card perspective style)
    const elementsToTilt = document.querySelectorAll(".hover-tilt");
    elementsToTilt.forEach(el => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;

            const rotX = ((py - 50) / 50) * -12; // tilt offset range
            const rotY = ((px - 50) / 50) * 12;

            el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    });
}

//--------------------------------------------------
// 16. ACCESSIBILITY ACCESS TOOLBAR & SOUND TOGGLES
//--------------------------------------------------
function initAccessibilityControls() {
    const soundToggle = document.getElementById("soundToggle");
    const contrastToggle = document.getElementById("contrastToggle");
    const themeBtn = document.getElementById("themeBtn");

    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener("click", () => {
            isMuted = !isMuted;
            soundToggle.classList.toggle("active");

            const mutedIcon = soundToggle.querySelector(".sound-muted-icon");
            const activeIcon = soundToggle.querySelector(".sound-active-icon");

            initAudioContext();

            if (!isMuted) {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                mutedIcon.classList.add("hidden");
                activeIcon.classList.remove("hidden");
                playSpaceDrone();
                showToast("🔊 AMBIENT CODES ACTIVE");
            } else {
                mutedIcon.classList.remove("hidden");
                activeIcon.classList.add("hidden");
                stopSpaceDrone();
                showToast("🔇 AMBIENT SOUND MUTED");
            }
        });
    }

    // High Contrast Mode toggle
    if (contrastToggle) {
        contrastToggle.addEventListener("click", () => {
            document.body.classList.toggle("high-contrast");
            playBeep(440, 0.12);
            showToast("👁 HIGH CONTRAST SIGNAL");
        });
    }

    // Light Theme toggle
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("light");
            const isLight = document.body.classList.contains("light");
            localStorage.setItem("theme", isLight ? "light" : "dark");

            themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            playBeep(600, 0.08);
            showToast(isLight ? "☀️ LIGHT TELEMETRY MODE" : "🌙 DEEP COSMIC DARK MODE");
        });
    }
}

// Load Theme status on start
function loadSavedTheme() {
    const saved = localStorage.getItem("theme");
    const themeBtn = document.getElementById("themeBtn");
    if (saved === "light") {
        document.body.classList.add("light");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove("light");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

//--------------------------------------------------
// 17. NAV LOGIC, PROGRESS BARS, SCROLL SCANS
//--------------------------------------------------
function initNavbarLogic() {
    const header = document.querySelector(".navbar-wrapper");
    const scrollProgress = document.getElementById("scrollProgress");

    // Add scroll shrink style
    window.addEventListener("scroll", () => {
        // Nav shrink
        if (window.scrollY > 50) {
            header.style.top = "5px";
        } else {
            header.style.top = "20px";
        }

        // Scroll Progress indicator line
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        if (scrollProgress) scrollProgress.style.width = `${progress}%`;

        // Active Section Navigation highlights
        const sections = document.querySelectorAll("section[id]");
        let currentSecId = "hero";
        sections.forEach(sec => {
            const top = sec.offsetTop - 140;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                currentSecId = sec.getAttribute("id");
            }
        });

        document.querySelectorAll(".nav-link").forEach(link => {
            if (link.getAttribute("data-sec") === currentSecId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Reading progress calculation on description
        const textScroll = document.getElementById("apodTextScrollContainer");
        const readProgress = document.getElementById("apodReadingProgress");
        if (textScroll && readProgress) {
            const scrollPercent = (textScroll.scrollTop / (textScroll.scrollHeight - textScroll.clientHeight)) * 100;
            readProgress.style.width = `${scrollPercent}%`;
        }
    });

    // Navbar Hamburger mobile toggle
    const mobileToggle = document.getElementById("mobileNavToggle");
    const navMenu = document.getElementById("navMenu");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
            playBeep(400, 0.05);
        });

        // Auto close when link is clicked
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                mobileToggle.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // Scroll to Top buttons
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    window.addEventListener("scroll", () => {
        if (scrollTopBtn) {
            scrollTopBtn.style.display = window.scrollY > 400 ? "flex" : "none";
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            playBeep(600, 0.08);
        });
    }
}

//--------------------------------------------------
// 18. MODAL WINDOWS & LOADER UI TOGGLES
//--------------------------------------------------
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalImageTitle = document.getElementById("modalImageTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalBtnText = document.getElementById("closeModalBtnText");

function openModal(imageUrl) {
    if (!imageModal || !modalImage) return;
    modalImage.src = imageUrl;

    // Map captions if present in dataset
    modalImageTitle.textContent = "Expanded Lossless Telemetry";
    imageModal.classList.add("active");
    playBeep(520, 0.1);
}

function closeImageModal() {
    if (imageModal) {
        imageModal.classList.remove("active");
        playBeep(380, 0.08);
    }
}

if (closeModalBtn) closeModalBtn.addEventListener("click", closeImageModal);
if (closeModalBtnText) closeModalBtnText.addEventListener("click", closeImageModal);
window.addEventListener("click", (e) => {
    if (e.target === imageModal) closeImageModal();
});

// Keyboard binds (ESC to close dialog, F to fullscreen)
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeImageModal();
    if (e.key.toLowerCase() === "f" && currentImage) openModal(currentImage);
});

// Downloader script with robust blob download + cross-origin fallback
async function downloadImage(url) {
    playBeep(650, 0.1);
    showToast("📥 PREPARING TELEMETRY DOWNLOAD...");
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP error");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `NASA_HD_Telemetry_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        showToast("🛰️ DOWNLOAD COMPLETE");
    } catch (e) {
        console.warn("CORS/blob download failed, falling back to direct link:", e);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = `NASA_HD_Telemetry_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 TRANSMITTING FILE DOWNLINK...");
    }
}

const dlBtn = document.getElementById("downloadBtn");
if (dlBtn) {
    dlBtn.addEventListener("click", () => {
        if (currentImage) openModal(currentImage);
    });
}
const fullscreenBtn = document.getElementById("fullscreenBtn");
if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
        if (currentImage) openModal(currentImage);
    });
}
const mDlBtn = document.getElementById("modalDownload");
if (mDlBtn) {
    mDlBtn.addEventListener("click", () => {
        if (modalImage.src) downloadImage(modalImage.src);
    });
}

//--------------------------------------------------
// 19. LOCAL SYSTEM FAVORITES (APOD)
//--------------------------------------------------
function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
}

const favBtn = document.getElementById("favoriteBtn");
if (favBtn) {
    favBtn.addEventListener("click", () => {
        if (!currentImage) return;
        let favorites = getFavorites();
        if (favorites.includes(currentImage)) {
            // Unfavorite
            favorites = favorites.filter(url => url !== currentImage);
            saveFavorites(favorites);
            showToast("💔 REMOVED FROM FAVORITES");
        } else {
            // Favorite
            favorites.push(currentImage);
            saveFavorites(favorites);
            showToast("❤️ ADDED TO FAVORITES LIST");
        }
        updateFavoriteButton();
    });
}

function updateFavoriteButton() {
    const favorites = getFavorites();
    if (!favBtn) return;

    if (favorites.includes(currentImage)) {
        favBtn.innerHTML = '<i class="fa-solid fa-heart-crack"></i> Unfavorite';
        favBtn.style.background = "#10b981";
    } else {
        favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorite Picture';
        favBtn.style.background = "#ef4444";
    }
}

// Increments Captured Signals Counter
function updateCounter() {
    imageCounter++;
    const countEl = document.getElementById("imageCount");
    if (countEl) countEl.innerHTML = imageCounter;
}

// Share button wire
const shareApodBtn = document.getElementById("shareApodBtn");
if (shareApodBtn) {
    shareApodBtn.addEventListener("click", () => {
        if (navigator.share && currentImage) {
            navigator.share({
                title: "NASA Space Explorer Portal",
                text: "Capturing telemetry signals from outer space!",
                url: currentImage
            }).then(() => showToast("📤 Uplink Shared!"))
                .catch(console.error);
        } else if (currentImage) {
            navigator.clipboard.writeText(currentImage);
            showToast("📋 Uplink copied to clipboard!");
        }
    });
}

// Show/Hide loader utility
const loaderEl = document.getElementById("loader");
function showLoader() {
    if (loaderEl) {
        loaderEl.classList.remove("hidden");
        loaderEl.style.opacity = "1";
    }
}
function hideLoader() {
    if (loaderEl) {
        loaderEl.style.opacity = "0";
        setTimeout(() => {
            loaderEl.classList.add("hidden");
        }, 400);
    }
}

//--------------------------------------------------
// 20. INITIAL LOAD & TIMED LOOPS
//--------------------------------------------------
window.addEventListener("load", () => {
    // 1. Run space loader
    runCinematicLoader();

    // 2. Init Canvas backgrounds
    initCosmicBackground();
    initHeroGlobe();

    // 3. Load Theme and Navbar active indicators
    loadSavedTheme();
    initNavbarLogic();

    // 4. Initial APOD loads
    setTimeout(() => {
        getAPOD();
        loadLatestEarthImage();
        loadClimateAnomalies();

        // 5. Init dynamic trackers
        initLaunchSchedule();
        fetchAsteroidRadar();
        initSpaceWeather();

        // Loop ISS tracking coordinates every 5 seconds
        trackLiveISS();
        setInterval(trackLiveISS, 5000);

        calculateCelestials();
        calculateMoonPhase();
        initHistoryTimeline();
        initChatbot();

        // 6. Bind scroll / tilt widgets
        initCursorGlowAndTilts();
        initAccessibilityControls();
        renderSearchHistoryBadges();

    }, 800);

    // Search dates binding
    const searchBtn = document.getElementById("searchBtn");
    const clearBtn = document.getElementById("clearBtn");
    const todayBtn = document.getElementById("todayBtn");
    const dateInput = document.getElementById("dateInput");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            playBeep(440, 0.1);
            if (!dateInput.value) {
                showToast("⚠️ SELECT SCANS TARGET DATE");
                return;
            }
            getAPOD(dateInput.value);
            saveSearch(dateInput.value);
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            playBeep(440, 0.1);
            dateInput.value = "";
            getAPOD();
            showToast("🚀 TELEMETRY ALIGNED TO CURRENT DATE");
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            playBeep(300, 0.08);
            dateInput.value = "";
        });
    }

    // Mars rover manual trigger
    const marsBtn = document.getElementById("marsBtn");
    if (marsBtn) {
        marsBtn.addEventListener("click", () => {
            playBeep(440, 0.1);
            loadMarsPhotos();
        });
    }

    // Earth EPIC manual trigger
    const earthBtn = document.getElementById("loadEarth");
    if (earthBtn) {
        earthBtn.addEventListener("click", () => {
            playBeep(440, 0.1);
            loadLatestEarthImage();
        });
    }

    // Connect chatbot preset click delegates on creation
    const msgs = document.getElementById("chatbotMessages");
    if (msgs) {
        msgs.addEventListener("click", (e) => {
            if (e.target.classList.contains("chat-kw-trigger")) {
                document.getElementById("chatbotInput").value = e.target.textContent.replace(/"/g, "");
                processChatInput();
            }
        });
    }

    // Console logs telemetry diagnostics
    console.log("%c🚀 COSMA DEEP SPACE TRANSMITTER - DIAGNOSTIC CHECK CLEAR", "color:#4facfe;font-size:16px;font-weight:bold;");
});