function handleDownload() {

    // Always hide loading bar at beginning
    document.getElementById("loadingBar").style.display = "none";

    document.getElementById("downloadSD").onclick = function () {
        const url = document.getElementById("sdImg").src;
        downloadImage(url, "thumbnail_sd.jpg");
    };

    document.getElementById("downloadHD").onclick = function () {
        const url = document.getElementById("hdImg").src;
        downloadImage(url, "thumbnail_hd.jpg");
    };

    document.getElementById("downloadFHD").onclick = function () {
        const url = document.getElementById("fullHdImg").src;
        downloadImage(url, "thumbnail_fullhd.jpg");
    };

    const url = document.querySelector(".input-box").value.trim();

    // Empty URL
    if (url === "") {
        showError("Please enter a URL.");
        document.getElementById("result").style.display = "none";
        return;
    }

    // Invalid YouTube link
    if (!isValidYouTubeURL(url)) {
        showError("Please enter a valid YouTube link.");
        document.getElementById("result").style.display = "none";
        return;
    }

    // Extract video ID
    const videoId = getVideoId(url);

    if (!videoId) {
        // Check if it's a channel URL
        if (url.includes("/@") || url.includes("/channel/") || url.includes("/c/") || url.includes("/user/")) {
            showError("This looks like a channel URL. Please enter a video URL instead.");
        } else {
            showError("Invalid YouTube Link. Cannot extract video ID.");
        }
        document.getElementById("result").style.display = "none";
        return;
    }

    hideError();

    // Show loading bar only after validation
    document.getElementById("loadingBar").style.display = "block";

    // Thumbnail URLs
    const sd = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    const hd = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const fhd = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Load images first to check if video exists
    Promise.all(
        [sd, hd, fhd].map(url =>
            fetch(url)
                .then(r => r.blob())
                .then(blob =>
                    createImageBitmap(blob).then(img => ({ img, url }))
                )
        )
    )
        .then(results => {

            const sdImgData = results[0];
            const hdImgData = results[1];
            const fhdImgData = results[2];

            // Invalid thumbnails = deleted video
            const isInvalid =
                (sdImgData.img.width === 120 && sdImgData.img.height === 90) &&
                (hdImgData.img.width === 120 && hdImgData.img.height === 90) &&
                (fhdImgData.img.width === 120 && fhdImgData.img.height === 90);

            if (isInvalid) {
                showError("This video does not exist. Please check your URL.");
                document.getElementById("result").style.display = "none";

                document.getElementById("sdImg").src = "";
                document.getElementById("hdImg").src = "";
                document.getElementById("fullHdImg").src = "";

                document.getElementById("loadingBar").style.display = "none";
                return;
            }

            // Valid video → show images
            document.getElementById("sdImg").src = sd;
            document.getElementById("hdImg").src = hd;

            // Check if Full HD (maxresdefault) is available
            // YouTube returns a 120x90 placeholder when maxresdefault doesn't exist
            const fhdAvailable = !(fhdImgData.img.width === 120 && fhdImgData.img.height === 90);
            const fhdBox = document.getElementById("fullHdImg").closest(".quality-box");
            const fhdLabel = fhdBox ? fhdBox.querySelector(".quality-label") : null;

            if (fhdAvailable) {
                document.getElementById("fullHdImg").src = fhd;
                if (fhdLabel) {
                    fhdLabel.textContent = "Best Quality Available";
                    fhdLabel.style.color = "";
                }
            } else {
                // Fall back to HD image for the FHD slot
                document.getElementById("fullHdImg").src = hd;
                if (fhdLabel) {
                    fhdLabel.textContent = "Full HD not available – showing HD instead";
                    fhdLabel.style.color = "#e67e22";
                }
            }

            document.getElementById("result").style.display = "block";

            setTimeout(() => {
                document.getElementById("loadingBar").style.display = "none";
            }, 700);
        })
        .catch(() => {
            document.getElementById("loadingBar").style.display = "none";
            showError("Something went wrong. Please try again.");
        });
}



function showError(message) {
    const box = document.getElementById("errorBox");
    box.style.display = "block";
    box.innerText = message;
}

function hideError() {
    const box = document.getElementById("errorBox");
    box.style.display = "none";
}

function isValidYouTubeURL(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url.trim());
}

function getVideoId(url) {
    url = url.trim();

    if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1].split(/[?&]/)[0];
    }

    if (url.includes("watch?v=")) {
        return url.split("watch?v=")[1].split(/[?&]/)[0];
    }

    if (url.includes("/shorts/")) {
        return url.split("/shorts/")[1].split(/[?&]/)[0];
    }

    if (url.includes("m.youtube.com/watch?v=")) {
        return url.split("watch?v=")[1].split(/[?&]/)[0];
    }

    if (url.includes("/embed/")) {
        return url.split("/embed/")[1].split(/[?&]/)[0];
    }

    if (url.includes("/live/")) {
        return url.split("/live/")[1].split(/[?&]/)[0];
    }

    return null;
}

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

function downloadImage(url, filename) {
    if (isIOS()) {
        // iOS Safari doesn't support blob download — open in new tab
        const w = window.open(url, "_blank");
        if (!w) {
            // Pop-up blocked fallback
            window.location.href = url;
        }
        showToast("Long-press the image and tap 'Save Image'");
        return;
    }
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        });
}



document.querySelector(".input-box").addEventListener("keyup", function (event) {
    if (event.key === "Enter" && this.value.trim() !== "") {
        handleDownload();
    }
});