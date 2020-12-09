document.querySelectorAll(".sessions a").forEach((sessionLink) => {
  sessionLink.addEventListener("click", (e) => {
    document.querySelectorAll(".sessions a").forEach((sessionLink) => sessionLink.classList.remove("active"));
    sessionLink.classList.add("active");
    console.log(location.hash.substr(1));
  });
});
