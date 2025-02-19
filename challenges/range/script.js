document.addEventListener("DOMContentLoaded", () => {
  const toggleNav = document.getElementById("toggle-nav");
  const navItems = document.querySelector("nav ul");

  toggleNav.addEventListener("click", () => {
    navItems.classList.toggle("show");
  });
  navItems.addEventListener("click", () => {
    navItems.classList.remove("show");
  });
  setTimeout(() => {
    navItems.classList.toggle("show");
  }, 500);

  setTimeout(() => {
    navItems.classList.toggle("show");
  }, 2700);
});
