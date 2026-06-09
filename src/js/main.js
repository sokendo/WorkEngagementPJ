document.addEventListener("DOMContentLoaded", function() {
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".site-menu");
  var backdrop = document.querySelector(".menu-backdrop");
  var newsList = document.querySelector(".news-list");
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
