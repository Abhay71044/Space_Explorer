/*============================================================================
   COSMA - EARTH WONDERS GALLERY CONTROLLER
   Pure Vanilla Javascript with High-Fidelity Filters & Infinite Scroll
============================================================================*/

const ACCESS_KEY = "-w6nYkKDONpuSxNr4dmsP7cpE-krlAalk5QDU-uoCxU";
const BASE_URL = "https://api.unsplash.com/search/photos";

// DOM Registry
const gallery = document.getElementById("gallery");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const exploreBtn = document.getElementById("exploreBtn");
const featuredExploreBtn = document.getElementById("featuredExploreBtn");

let currentQuery = "waterfall";
let currentPage = 1;
let isLoading = false;
let totalPages = 1;
let currentPhoto = "";

// UI Chime Sound Synthesizer (Web Audio API)
let audioCtx = null;
function playBeep(freq = 600, duration = 0.08) {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
}

// Toast Alert System
function showToast(message) {
    let toast = document.createElement("div");
    toast.className = "toast font-orbitron";
    toast.innerText = message;
    document.body.appendChild(toast);
    playBeep(880, 0.12);
    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

// Show/Hide loaders
function showLoader() { if (loader) loader.classList.remove("hidden"); }
function hideLoader() { if (loader) loader.classList.add("hidden"); }

// Fetch images from Unsplash (with randomized offsets to prevent catalog boredom)
async function loadImages(query = "waterfall", page = 1) {
    if (isLoading) return;
    isLoading = true;
    showLoader();

    try {
        const randomPage = page === 1 ? Math.floor(Math.random() * 20) + 1 : page;
        const response = await fetch(
            `${BASE_URL}?query=${query}&page=${randomPage}&per_page=12&orientation=landscape&client_id=${ACCESS_KEY}`
        );

        if (!response.ok) throw new Error("Unable to contact Unsplash imaging node.");

        const data = await response.json();
        totalPages = data.total_pages;

        if (page === 1) gallery.innerHTML = "";

        if (data.results.length === 0) {
            gallery.innerHTML = `
                <div class="mars-empty-state font-orbitron" style="grid-column:1/-1">
                    <i class="fa-solid fa-triangle-exclamation text-yellow"></i>
                    <p>NO GEOGRAPHIC RECORDS DETECTED IN THIS CATEGORY QUERY.</p>
                </div>
            `;
            return;
        }

        data.results.forEach(photo => createCard(photo));

    } catch (error) {
        console.error(error);
        showToast("⚠️ FAILED TO DECODE PLANETARY PHOTOGRAPHS");
    } finally {
        hideLoader();
        isLoading = false;
    }
}

// Create premium visual card templates
function createCard(photo) {
    const card = document.createElement("div");
    card.className = "image-card hover-tilt";

    const location = photo.location?.name || photo.alt_description || "Vibrant Landscape";
    const author = photo.user.name || "Agency Photographer";
    const country = photo.location?.country || "Earth Coordinates";

    card.innerHTML = `
        <div class="skeleton-loader" style="height: 65%;">
            <img src="${photo.urls.regular}" alt="${location}" data-full="${photo.urls.full}" class="lazy-load" onload="this.parentNode.classList.remove('skeleton-loader')">
        </div>
        <div class="image-info">
            <h3 class="font-orbitron" title="${location}">${location}</h3>
            <p>📷 ${author} | 📍 ${country}</p>
            <div class="image-actions font-orbitron">
                <button class="favorite-btn" aria-label="Save this location to favorites">❤️ Favorite</button>
                <button class="download-btn" aria-label="Download high resolution copy">📥 Downlink</button>
                <button class="view-btn" aria-label="Expand image to fullscreen">🔍 Expand</button>
                <button class="share-btn" aria-label="Copy photo link to clipboard">📤 Share</button>
            </div>
        </div>
    `;

    gallery.appendChild(card);
    initTiltOnCard(card);
}

// Live tilt card calculations
function initTiltOnCard(el) {
    el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        const rotX = ((py - 50) / 50) * -10;
        const rotY = ((px - 50) / 50) * 10;
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });
    el.addEventListener("mouseleave", () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
}

// Card action delegates
if (gallery) {
    gallery.addEventListener("click", (e) => {
        const card = e.target.closest(".image-card");
        if (!card) return;

        const img = card.querySelector("img");
        if (!img) return;

        const fullUrl = img.dataset.full;
        const regularUrl = img.src;
        const title = card.querySelector("h3").innerText;

        // View Trigger
        if (e.target.classList.contains("view-btn") || e.target.tagName === "IMG") {
            currentPhoto = fullUrl;
            const modalImage = document.getElementById("modalImage");
            const modalLabel = document.getElementById("modalLabel");
            if (modalImage) modalImage.src = fullUrl;
            if (modalLabel) modalLabel.textContent = title;
            document.getElementById("imageModal").classList.add("active");
            playBeep(520, 0.1);
        }

        // Download Trigger
        if (e.target.classList.contains("download-btn")) {
            downloadImage(fullUrl, `Earth_Wonders_${Date.now()}.jpg`);
        }

        // Favorite Trigger
        if (e.target.classList.contains("favorite-btn")) {
            const photographer = card.querySelector("p").innerText;
            const favorites = getFavorites();

            if (favorites.some(item => item.image === regularUrl)) {
                showToast("Already Saved ❤️");
                return;
            }

            favorites.push({ image: regularUrl, full: fullUrl, title, photographer });
            saveFavorites(favorites);
            e.target.innerHTML = "💚 Saved";
            showToast("❤️ ADDED TO FAVORITES LIST");
        }

        // Share Trigger
        if (e.target.classList.contains("share-btn")) {
            if (navigator.share) {
                navigator.share({ title: "Earth Wonders", text: `Explore ${title} nature coordinates!`, url: regularUrl })
                    .then(() => showToast("📤 Uplink Shared!"))
                    .catch(console.error);
            } else {
                navigator.clipboard.writeText(regularUrl);
                showToast("📋 UPLINK COPIED TO CLIPBOARD");
            }
        }
    });
}

// Modal closing hooks
const modal = document.getElementById("imageModal");
const closeIconBtn = document.getElementById("closeIconBtn");
const closeBtn = document.getElementById("closeBtn");

function closeModal() {
    if (modal) {
        modal.classList.remove("active");
        playBeep(380, 0.08);
    }
}
if (closeIconBtn) closeIconBtn.addEventListener("click", closeModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// Downloader script with robust blob download + cross-origin fallback
async function downloadImage(url, defaultFilename = 'download.jpg') {
    playBeep(650, 0.1);
    showToast("📥 PREPARING TELEMETRY DOWNLOAD...");
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP error");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = defaultFilename;
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
        link.download = defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("📥 TRANSMITTING FILE DOWNLINK...");
    }
}

// Modal download wire
const dlBtn = document.getElementById("downloadBtn");
if (dlBtn) {
    dlBtn.addEventListener("click", () => {
        if (currentPhoto) {
            downloadImage(currentPhoto, `Earth_Wonders_HD.jpg`);
        }
    });
}

// Local Favorites functions
function getFavorites() { return JSON.parse(localStorage.getItem("earthFavorites") || "[]"); }
function saveFavorites(list) { localStorage.setItem("earthFavorites", JSON.stringify(list)); }

// Theme Toggle
const themeBtn = document.getElementById("themeBtn");
function loadTheme() {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

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

// Scroll to top button
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
    if (scrollBtn) {
        scrollBtn.style.display = window.scrollY > 400 ? "block" : "none";
    }
});
if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        playBeep(600, 0.08);
    });
}

// Category selection
const categoryButtons = document.querySelectorAll(".category-btn");
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        playBeep(440, 0.1);
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        currentQuery = button.dataset.query;
        currentPage = 1;
        loadImages(currentQuery, currentPage);
        updateFeatured(currentQuery);
        showToast(`🌍 SYNCING ${currentQuery.toUpperCase()} IMAGES`);
    });
});

// Featured Destination card refresh
async function updateFeatured(query) {
    try {
        const randomPage = Math.floor(Math.random() * 20) + 1;
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&page=${randomPage}&per_page=5&orientation=landscape&client_id=${ACCESS_KEY}`);
        const data = await res.json();

        if (data.results.length) {
            const photo = data.results[0];
            const titleEl = document.getElementById("featuredTitle");
            const descEl = document.getElementById("featuredDesc");
            const imgEl = document.getElementById("featuredImg");

            if (titleEl) titleEl.textContent = photo.location?.name || photo.alt_description || `${query} Panorama`;
            if (descEl) descEl.textContent = `A beautiful featured ${query} site. Captured at coords: ${photo.location?.country || 'Global'}. Lens details: ${photo.exif?.make || 'Standard'} exposure.`;
            if (imgEl) imgEl.src = photo.urls.regular;
        }
    } catch (e) { console.log(e); }
}

// Search
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        playBeep(440, 0.1);
        const value = searchInput.value.trim();
        if (!value) return showToast("⚠️ ENTER COORDINATES SCAN PARAMETER");
        currentQuery = value;
        currentPage = 1;
        loadImages(currentQuery, currentPage);
        updateFeatured(currentQuery);
        showToast(`🌍 INITIATING DISCOVERY: ${currentQuery.toUpperCase()}`);
    });
}

if (searchInput) {
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") searchBtn.click();
    });
}

// Infinite Scroll with Throttle
let scrollTimeout = null;
window.addEventListener("scroll", () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        if (isLoading || currentPage >= totalPages) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            currentPage++;
            loadImages(currentQuery, currentPage);
        }
    }, 200);
});

// Mobile Menu Toggle
const mobileNavToggle = document.getElementById("mobileNavToggle");
const navLinks = document.getElementById("navLinks");
if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        mobileNavToggle.classList.toggle("open", isOpen);
        mobileNavToggle.setAttribute("aria-expanded", isOpen);
    });
}

// Navigation scroll link
if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        playBeep(440, 0.1);
        document.getElementById("gallerySection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

if (featuredExploreBtn) {
    featuredExploreBtn.addEventListener("click", () => {
        playBeep(440, 0.1);
        document.getElementById("gallerySection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

// Custom glow cursor trail
function initGlowCursor() {
    const glowCursor = document.getElementById("glowCursor");
    if (!glowCursor) return;

    window.addEventListener("mousemove", (e) => {
        glowCursor.style.left = e.clientX + "px";
        glowCursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("button, a, input").forEach(item => {
        item.addEventListener("mouseenter", () => glowCursor.classList.add("active"));
        item.addEventListener("mouseleave", () => glowCursor.classList.remove("active"));
    });
}

// Background map outline canvas animation (SpaceX-inspired)
function initMapBackground() {
    const canvas = document.getElementById("earthBackgroundCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    let points = [];
    for (let i = 0; i < 40; i++) {
        points.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: Math.random() * 0.4 - 0.2,
            vy: Math.random() * 0.4 - 0.2,
            r: Math.random() * 1.5 + 1
        });
    }

    window.addEventListener("resize", () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    function drawMapGrid() {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.03)";
        ctx.lineWidth = 1;

        // Draw horizontal grid lines
        for (let i = 0; i < h; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }

        // Draw node constellations
        ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
        points.forEach((p, idx) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            // Connect nearby points
            for (let j = idx + 1; j < points.length; j++) {
                let p2 = points[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 150) {
                    ctx.strokeStyle = `rgba(56, 189, 248, ${0.05 * (1 - dist / 150)})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(drawMapGrid);
    }
    drawMapGrid();
}

// Initial triggers
window.addEventListener("load", () => {
    loadTheme();
    initGlowCursor();
    initMapBackground();

    // Initial query load
    setTimeout(() => {
        loadImages(currentQuery, currentPage);
        updateFeatured(currentQuery);
    }, 600);

    console.log("%c🌍 COSMA GEOGRAPHIC SYSTEM ONLINE", "color:#38bdf8;font-size:16px;font-weight:bold;");
});