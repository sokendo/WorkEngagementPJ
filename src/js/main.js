document.addEventListener("DOMContentLoaded", function() {
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".site-menu");
  var backdrop = document.querySelector(".menu-backdrop");
  var mobileQuery = window.matchMedia("(max-width: 860px)");

  if (!toggle || !menu || !backdrop) {
    return;
  }

  function openMenu() {
    body.classList.add("is-menu-animated");
    body.classList.add("is-menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "メニューを閉じる");
    backdrop.hidden = false;
  }

  function closeMenu(options) {
    var shouldAnimate = !options || options.animate !== false;

    if (shouldAnimate) {
      body.classList.add("is-menu-animated");
    } else {
      body.classList.remove("is-menu-animated");
    }

    body.classList.remove("is-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
    backdrop.hidden = true;

    if (shouldAnimate) {
      window.setTimeout(function() {
        if (!body.classList.contains("is-menu-open")) {
          body.classList.remove("is-menu-animated");
        }
      }, 260);
    }
  }

  toggle.addEventListener("click", function() {
    if (body.classList.contains("is-menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener("click", closeMenu);

  menu.addEventListener("click", function(event) {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  mobileQuery.addEventListener("change", function(event) {
    if (!event.matches) {
      closeMenu({ animate: false });
    }
  });
});
