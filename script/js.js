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
        showError("Invalid YouTube Link. Cannot extract video ID.");
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
        document.getElementById("fullHdImg").src = fhd;

        document.getElementById("result").style.display = "block";

        setTimeout(() => {
            document.getElementById("loadingBar").style.display = "none";
        }, 700);
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

    return null;
}

function downloadImage(url, filename) {
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

async function getBestThumbnail(videoId) {
    const base = `https://img.youtube.com/vi/${videoId}/`;

    const qualities = [
        "maxresdefault.jpg",
        "hqdefault.jpg",
        "mqdefault.jpg",
        "default.jpg"
    ];

    for (let q of qualities) {
        const url = base + q;
        const res = await fetch(url);

        if (res.ok && res.status === 200) {
            return url;
        }
    }

    return null;
}

function isDeletedThumbnail(url) {
    return url.includes("default.jpg");
}

document.querySelector(".input-box").addEventListener("keyup", function (event) {
    if (event.key === "Enter" && this.value.trim() !== "") {
        handleDownload();
    }
});