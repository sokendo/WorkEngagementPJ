document.addEventListener("DOMContentLoaded", function() {
  var body = document.body;
  var root = document.documentElement;
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".site-menu");
  var backdrop = document.querySelector(".menu-backdrop");
  var newsList = document.querySelector(".news-list");
  var languageSwitches = document.querySelectorAll(".lang-switch, .nav-lang-switch");
  var mobileQuery = window.matchMedia("(max-width: 860px)");
  var languageStorageKey = "work-engagement-language";
  var supportedLanguages = ["ja", "en"];

  if (!toggle || !menu || !backdrop) {
    return;
  }

  function getStoredLanguage() {
    try {
      var storedLanguage = window.localStorage.getItem(languageStorageKey);

      if (supportedLanguages.indexOf(storedLanguage) !== -1) {
        return storedLanguage;
      }
    } catch (error) {
      return "ja";
    }

    return "ja";
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch (error) {
      return;
    }
  }

  function applyLanguage(language) {
    var nextLanguage = supportedLanguages.indexOf(language) !== -1 ? language : "ja";
    var alternateLanguage = nextLanguage === "ja" ? "en" : "ja";
    var visibleNodes = document.querySelectorAll(".lang-" + nextLanguage);
    var hiddenNodes = document.querySelectorAll(".lang-" + alternateLanguage);

    root.lang = nextLanguage;
    body.classList.toggle("is-lang-ja", nextLanguage === "ja");
    body.classList.toggle("is-lang-en", nextLanguage === "en");

    visibleNodes.forEach(function(node) {
      node.hidden = false;
    });

    hiddenNodes.forEach(function(node) {
      node.hidden = true;
    });

    languageSwitches.forEach(function(button) {
      button.setAttribute("aria-label", nextLanguage === "ja" ? "Switch language to English" : "言語を日本語に切り替える");
      button.setAttribute("aria-pressed", nextLanguage === "en" ? "true" : "false");
      button.innerHTML = [
        '<span class="lang-option' + (nextLanguage === "ja" ? " is-active" : "") + '">JA</span>',
        '<span aria-hidden="true">/</span>',
        '<span class="lang-option' + (nextLanguage === "en" ? " is-active" : "") + '">EN</span>'
      ].join("");
    });
  }

  function setLanguage(language) {
    applyLanguage(language);
    saveLanguage(language);
  }

  applyLanguage(getStoredLanguage());

  languageSwitches.forEach(function(button) {
    button.addEventListener("click", function() {
      setLanguage(root.lang === "en" ? "ja" : "en");
      closeMenu();
    });
  });

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

  async function loadTumblrNews() {
    if (!newsList || typeof axios === "undefined") {
      return;
    }

    function formatNewsDate(dateString) {
      var date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return dateString || "";
      }

      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short"
      }).format(date);
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    axios.get("https://res.yukimat.jp/work-engagement/rss/", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    })
      .then(function(res) {
        if (res.status === 200) {
          var news = res.data && res.data.news ? res.data.news : [];
          var blog = res.data && res.data.blog ? res.data.blog : [];
          var items = news.concat(blog);

          newsList.innerHTML = items.map(function(item) {
            var date = formatNewsDate(item.date || item.published_at || "");
            var categories = Array.isArray(item.categories) ? item.categories : [];
            var title = escapeHtml(item.title || "");
            var body = escapeHtml(item.body || item.description || "");
            var link = item.url || item.link || "";

            if (!link) {
              return "";
            }

            return [
              "<li>",
              '<a href="' + escapeHtml(link) + '" target="_blank" rel="noreferrer">',
              '<div class="news-meta">',
              "<span>" + escapeHtml(date) + "</span>",
              categories.map(function(category) {
                return "<span class=\"tag\">" + escapeHtml(category) + "</span>";
              }).join(""),
              "</div>",
              "<strong>" + title + "</strong>",
              body ? "<span>" + body + "</span>" : "",
              "</a>",
              "</li>"
            ].join("");
          }).join("");
        }
      })
      .catch(function(err) {
        console.log("err:", err);
      });
  }

  loadTumblrNews();
});
