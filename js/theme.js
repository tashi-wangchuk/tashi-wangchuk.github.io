// Light/dark theme toggle — the only JavaScript on this site.
// The first block runs immediately (before the page paints) so there is
// no white flash for visitors who chose dark mode last time.
(function () {
  var saved = localStorage.getItem("theme");
  var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && systemPrefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Once the page is loaded, wire up the ☾/☀ button in the header.
  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;
    button.addEventListener("click", function () {
      var nowDark = document.documentElement.getAttribute("data-theme") !== "dark";
      if (nowDark) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      localStorage.setItem("theme", nowDark ? "dark" : "light");
    });
  });
})();
