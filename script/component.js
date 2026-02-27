// Change this version number whenever you deploy new CSS/JS changes
const CACHE_VERSION = "1.0.1";

function bustCache() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href && !link.href.includes('fonts.googleapis.com')) {
            link.href = link.href.split('?')[0] + '?v=' + CACHE_VERSION;
        }
    });
}

async function loadComponent(selector, file) {
    let el = document.querySelector(selector);
    if (!el) return;

    try {
        let html = await fetch(file + '?v=' + CACHE_VERSION).then(r => r.text());
        el.innerHTML = html;
    } catch (err) {
        console.error("Failed to load:", file, err);
    }
}

async function initComponents() {
    bustCache();
    // Only fetch components that aren't already inlined in the page HTML
    const navbar = document.querySelector("#navbar");
    const footer = document.querySelector("#footer");

    if (navbar && !navbar.innerHTML.trim()) {
        await loadComponent("#navbar", "/component/navbar.html");
    }
    if (footer && !footer.innerHTML.trim()) {
        await loadComponent("#footer", "/component/footer.html");
    }
    await loadComponent("#result", "/component/result.html");
    await loadComponent("#hasresult", "/component/hasresult.html");
}
document.addEventListener("DOMContentLoaded", initComponents);

// Hamburger menu toggle
function toggleMenu() {
    const nav = document.getElementById("navLinks");
    nav.classList.toggle("nav-open");
}