document.addEventListener("DOMContentLoaded", function () {
	const liquid = document.getElementById("liquid");
	if (!liquid) return;
	const count = 36;
	const height = liquid.clientHeight || 220;
	for (let i = 0; i < count; i++) {
		const g = document.createElement("div");
		g.className = "glitter";
		const left = Math.random() * 86 + 6;
		const bottom = Math.random() * (height * 0.6);
		g.style.left = left + "%";
		g.style.bottom = bottom + "px";
		g.style.animationDelay = Math.random() * 3 + "s";
		g.style.animationDuration =
			2.2 + Math.random() * 2.6 + "s, " + (3.2 + Math.random() * 2.2) + "s";
		g.style.opacity = 0.6 + Math.random() * 0.4;
		liquid.appendChild(g);
	}
	const tinyCount = 28;
	for (let i = 0; i < tinyCount; i++) {
		const s = document.createElement("div");
		s.className = "spark";
		const left = Math.random() * 86 + 6;
		const bottom = Math.random() * (height * 0.7);
		s.style.left = left + "%";
		s.style.bottom = bottom + "px";
		s.style.animationDelay = Math.random() * 2 + "s";
		s.style.animationDuration = 2.0 + Math.random() * 2.0 + "s";
		s.style.opacity = 0.45 + Math.random() * 0.5;
		liquid.appendChild(s);
	}
});