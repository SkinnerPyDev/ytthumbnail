async function loadComponent(selector, file) {
    let el = document.querySelector(selector);
    if (!el) return;

    try {
        let html = await fetch(file).then(r => r.text());
        el.innerHTML = html;
    } catch (err) {
        console.error("Failed to load:", file, err);
    }
}

async function initComponents() {
    await loadComponent("#footer", "/component/footer.html");
    await loadComponent("#navbar", "/component/navbar.html");
    await loadComponent("#result", "/component/result.html");


    initUI();
    
}
document.addEventListener("DOMContentLoaded", initComponents);