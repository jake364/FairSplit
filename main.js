document.addEventListener("DOMContentLoaded", function() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html"

  document.querySelectorAll(".nav-link").forEach(function(link) {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("is-active")
      link.setAttribute("aria-current", "page")
    }
  })
})
