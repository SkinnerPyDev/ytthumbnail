// iOS DETECTION + TOAST
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function showToast(message) {
    let toast = document.getElementById("ios-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "ios-toast";
        toast.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:14px 24px;border-radius:12px;font-size:15px;z-index:99999;text-align:center;max-width:90%;backdrop-filter:blur(8px);transition:opacity 0.4s";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 3500);
}

// ELEMENTS
const input = document.getElementById("ytChannelInput");
const btn = document.getElementById("logoExtractBtn");
const errorBox = document.getElementById("errorBox");
const loading = document.getElementById("loadingBar");
const resultBox = document.getElementById("logoResult");
const logoImg = document.getElementById("channelLogo");
const downloadBtn = document.getElementById("downloadLogoBtn");

// Hide result initially
resultBox.style.display = "none";

// Show error
function showError(msg) {
    errorBox.style.display = "block";
    errorBox.innerText = msg;
}

// Hide error
function hideError() {
    errorBox.style.display = "none";
}

// Validate YouTube URL (any format)
function isValidYouTubeURL(url) {
    return /(youtube\.com|youtu\.be)/.test(url.trim());
}

// MAIN FUNCTION
async function getLogo() {
    const url = input.value.trim();
    hideError();
    resultBox.style.display = "none";
    logoImg.src = "";

    // Validation
    if (url === "") return showError("Please enter a YouTube URL.");
    if (!isValidYouTubeURL(url)) return showError("Invalid YouTube link.");

    loading.style.display = "block";

    try {
        // CALL WORKER (Universal URL parser)
        const apiURL = `https://l.skinnerdev.workers.dev/?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiURL);
        const data = await res.json();

        loading.style.display = "none";

        if (data.error || !data.logo) {
            return showError("Invalid YouTube URL. Please check your link and try again.");
        }

        // DISPLAY LOGO
        logoImg.src = data.logo;
        resultBox.style.display = "block";

        // DOWNLOAD
        downloadBtn.onclick = async () => {
            if (isIOS()) {
                const w = window.open(data.logo, "_blank");
                if (!w) window.location.href = data.logo;
                showToast("Long-press the image and tap 'Save Image'");
                return;
            }
            try {
                const response = await fetch(data.logo);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = "channel_logo.jpg";
                document.body.appendChild(a);
                a.click();
                a.remove();

                URL.revokeObjectURL(blobUrl);
            } catch (e) {
                showError("Failed to download logo.");
            }
        };
    } catch (err) {
        loading.style.display = "none";
        showError("Something went wrong. Try again.");
    }
}

// Events
btn.addEventListener("click", getLogo);
input.addEventListener("keyup", e => {
    if (e.key === "Enter") getLogo();
});