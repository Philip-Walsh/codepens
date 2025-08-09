document.addEventListener("DOMContentLoaded", function () {
    const liquid = document.getElementById("liquid");
    if (!liquid) return;

    const prefersReducedMotion = typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches === true
        : false;
    const isMobile = (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 600px)").matches === true)
        || ("ontouchstart" in window && navigator.maxTouchPoints > 0);

    // Determine liquid height after layout
    const height = liquid.clientHeight || parseFloat(getComputedStyle(liquid).height) || 220;

    const glitterCount = prefersReducedMotion ? 0 : (isMobile ? 18 : 36);
    const sparkCount = prefersReducedMotion ? 0 : (isMobile ? 14 : 28);

    for (let i = 0; i < glitterCount; i++) {
        const glitter = document.createElement("div");
        glitter.className = "glitter";
        const leftPercent = Math.random() * 86 + 6;
        const bottomPx = Math.random() * (height * 0.6);
        glitter.style.left = leftPercent + "%";
        glitter.style.bottom = bottomPx + "px";
        glitter.style.animationDelay = Math.random() * 3 + "s";
        glitter.style.animationDuration = (2.2 + Math.random() * 2.6) + "s"; // single animation
        glitter.style.opacity = 0.6 + Math.random() * 0.4;
        liquid.appendChild(glitter);
    }

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("div");
        spark.className = "spark";
        const leftPercent = Math.random() * 86 + 6;
        const bottomPx = Math.random() * (height * 0.7);
        spark.style.left = leftPercent + "%";
        spark.style.bottom = bottomPx + "px";
        spark.style.animationDelay = Math.random() * 2 + "s";
        spark.style.animationDuration = (2.0 + Math.random() * 2.0) + "s";
        spark.style.opacity = 0.45 + Math.random() * 0.5;
        liquid.appendChild(spark);
    }
});