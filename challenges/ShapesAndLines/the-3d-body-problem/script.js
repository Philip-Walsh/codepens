document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement("div");
    container.className = "universe-container";
    document.body.appendChild(container);

    // Create three spheres with different properties and more chaotic movement
    const spheres = [
        {
            color: '#ff4500',
            size: 120,
            speed: 0.5,
            orbit: {
                radius: 200,
                angle: 0,
                tilt: 15,
                wobble: 0.2
            }
        },
        {
            color: '#ffd700',
            size: 100,
            speed: 0.3,
            orbit: {
                radius: 300,
                angle: 120,
                tilt: -20,
                wobble: 0.3
            }
        },
        {
            color: '#ff69b4',
            size: 80,
            speed: 0.4,
            orbit: {
                radius: 250,
                angle: 240,
                tilt: 25,
                wobble: 0.25
            }
        }
    ];

    // Create each sphere
    spheres.forEach((sphere, index) => {
        const sphereElement = document.createElement("div");
        sphereElement.className = "sphere";
        sphereElement.style.setProperty("--sphere-color", sphere.color);
        sphereElement.style.setProperty("--sphere-size", `${sphere.size}px`);
        sphereElement.style.setProperty("--orbit-radius", `${sphere.orbit.radius}px`);
        sphereElement.style.setProperty("--orbit-angle", `${sphere.orbit.angle}deg`);
        sphereElement.style.setProperty("--orbit-speed", `${sphere.speed}s`);
        container.appendChild(sphereElement);

        const layers = 50;
        const radius = sphere.size / 2;

        for (let i = 0; i < layers; i++) {
            const circle = document.createElement("div");
            circle.className = "circle";

            const normalized = (i / (layers - 1)) * 2 - 1;
            const size = Math.sqrt(1 - normalized ** 2) * 100;
            const depth = normalized * radius;

            circle.style.width = `${size}%`;
            circle.style.height = `${size}%`;
            circle.style.transform = `rotateX(60deg) translateZ(${depth}px)`;
            circle.style.background = `conic-gradient(
                from ${(i / layers) * 360}deg,
                ${sphere.color}88 0%,
                ${sphere.color}ff 25%,
                ${sphere.color}88 50%,
                ${sphere.color}ff 75%,
                ${sphere.color}88 100%
            )`;
            circle.style.boxShadow = `
                0 0 ${Math.random() * 20 + 10}px ${sphere.color}88,
                0 0 ${Math.random() * 40 + 20}px ${sphere.color}44,
                0 0 ${Math.random() * 60 + 30}px ${sphere.color}22
            `;

            sphereElement.appendChild(circle);
        }
    });

    // Add ambient particles
    for (let i = 0; i < 200; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.setProperty("--x", `${Math.random() * 100}%`);
        particle.style.setProperty("--y", `${Math.random() * 100}%`);
        particle.style.setProperty("--size", `${Math.random() * 2}px`);
        particle.style.setProperty("--delay", `${Math.random() * 2}s`);
        container.appendChild(particle);
    }

    // Chaotic animation with multiple movement components
    function animate() {
        const time = Date.now() * 0.001; // Convert to seconds for smoother animation

        spheres.forEach((sphere, index) => {
            const sphereElement = document.querySelector(`.sphere:nth-child(${index + 1})`);

            // Update orbit angle with varying speed
            sphere.orbit.angle += sphere.speed * (1 + Math.sin(time * 0.5) * 0.2);

            // Calculate chaotic movement components
            const wobbleX = Math.sin(time * sphere.orbit.wobble) * 20;
            const wobbleY = Math.cos(time * sphere.orbit.wobble * 1.5) * 15;
            const wobbleZ = Math.sin(time * sphere.orbit.wobble * 0.8) * 10;

            // Dynamic orbit radius that changes over time
            const dynamicRadius = sphere.orbit.radius * (1 + Math.sin(time * 0.3) * 0.1);

            // Apply all transformations
            sphereElement.style.transform = `
                rotateX(${60 + wobbleX}deg)
                rotateY(${sphere.orbit.tilt + wobbleY}deg)
                rotateZ(${sphere.orbit.angle}deg)
                translateX(${dynamicRadius}px)
                rotateZ(${-sphere.orbit.angle}deg)
                translateZ(${wobbleZ}px)
            `;
        });

        // Add subtle container movement
        container.style.transform = `
            rotateX(60deg)
            rotateZ(45deg)
            translateY(${Math.sin(time * 0.2) * 30}px)
            rotateX(${Math.sin(time * 0.1) * 5}deg)
            rotateZ(${Math.cos(time * 0.15) * 5}deg)
        `;

        requestAnimationFrame(animate);
    }
    animate();
}); 