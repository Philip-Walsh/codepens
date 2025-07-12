const cart = document.getElementById("cart");
const root = document.documentElement;

cart.addEventListener("animationend", (e) => {
  if (e.animationName === "slideIn") {
    root.style.setProperty("--spin-progress", "0");

    root.style.setProperty("--door-swing", "running");
  }
});