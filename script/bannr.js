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
const input = document.getElementById("bannerInput");
const btn = document.getElementById("bannerBtn");
const errorBox = document.getElementById("errorBox");
const loading = document.getElementById("loadingBar");

// RESULT ELEMENTS
const thumbResult = document.getElementById("thumbResult");
const thumbImg = document.getElementById("thumbPreview");
const downloadThumbBtn = document.getElementById("downloadThumbBtn");

// Hide result initially
thumbResult.style.display = "none";

// Show error
function showError(msg) {
    errorBox.style.display = "block";
    errorBox.innerText = msg;
}

// Hide error
function hideError() {
    errorBox.style.display = "none";
}

// Validate URL
function isValidYouTubeURL(url) {
    return /(youtube\.com|youtu\.be)/.test(url.trim());
}

// MAIN FUNCTION
async function getBanner() {

    const url = input.value.trim();
    hideError();
    thumbResult.style.display = "none";
    thumbImg.src = "";

    if (url === "") return showError("Please enter a YouTube URL.");
    if (!isValidYouTubeURL(url)) return showError("Invalid YouTube link.");

    loading.style.display = "block";

    try {
        // BANNER WORKER
        const workerURL = `https://b.skinnerdev.workers.dev/?url=${encodeURIComponent(url)}`;

        const res = await fetch(workerURL);
        const data = await res.json();

        loading.style.display = "none";

        if (data.error) {
            return showError("Invalid YouTube URL. Please check your link and try again.");
        }

        if (!data.banner || !data.banner.maxres) {
            return showError("This channel does not have a banner image.");
        }

        const bannerUrl = data.banner.maxres;

        // Display banner
        thumbImg.src = bannerUrl;
        thumbResult.style.display = "block";

        // Download banner (iOS-compatible)
        downloadThumbBtn.onclick = async () => {
            if (isIOS()) {
                const w = window.open(bannerUrl, "_blank");
                if (!w) window.location.href = bannerUrl;
                showToast("Long-press the image and tap 'Save Image'");
                return;
            }
            const response = await fetch(bannerUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = "channel_banner.jpg";
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(blobUrl);
        };

    } catch (err) {
        loading.style.display = "none";
        showError("Something went wrong.");
    }
}

// Button click
btn.addEventListener("click", getBanner);

// Enter key support
input.addEventListener("keyup", e => {
    if (e.key === "Enter") getBanner();
});