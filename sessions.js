document.querySelectorAll(".sessions a").forEach((sessionLink) => {
  sessionLink.addEventListener("click", (e) => {
    const session = sessionLink.getAttribute("data-session");
    document.querySelectorAll(".sessions a").forEach(link => link.classList.remove("active"));
    sessionLink.classList.add("active");
    document.querySelectorAll("[class^=session-]").forEach(link => link.classList.remove("active"));
    document.querySelector(`.session-${session}`).classList.add("active")
  });
});
