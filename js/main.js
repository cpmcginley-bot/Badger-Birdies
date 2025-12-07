// main.js
// Handles: navbar burger, Bulma modals, and single-page navigation

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // NAVBAR BURGER (mobile)
  // =========================
  const burgers = Array.from(document.querySelectorAll(".navbar-burger"));

  burgers.forEach((burger) => {
    burger.addEventListener("click", () => {
      const target = document.getElementById(burger.dataset.target);
      burger.classList.toggle("is-active");
      if (target) {
        target.classList.toggle("is-active");
      }
    });
  });

  // =========================
  // BULMA MODALS (Sign In / Sign Up)
  // =========================

  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Open modal when clicking any trigger
  (document.querySelectorAll(".js-modal-trigger") || []).forEach(($trigger) => {
    const modalId = $trigger.dataset.target;
    const $target = document.getElementById(modalId);

    $trigger.addEventListener("click", (e) => {
      e.preventDefault(); // stay on the same SPA page
      if ($target) openModal($target);
    });
  });

  // Close modal when clicking background, X, footer buttons
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
    ) || []
  ).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      if ($target) closeModal($target);
    });
  });

  // Close all modals on ESC key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  // =========================
  // SIMPLE SPA PAGE NAVIGATION
  // =========================

  // local helper (separate from app.js on purpose)
  function r_e(id) {
    return document.querySelector(`#${id}`);
  }

  // ids of all page sections
  const pages = [
    "index",
    "courses-page",
    "leaderboard-page",
    "play-page",
    "about-page",
  ];

  // show only the selected section
  function showPage(pageId) {
    pages.forEach((id) => {
      const el = r_e(id);
      if (!el) return;

      if (id === pageId) {
        el.classList.remove("is-hidden");
      } else {
        el.classList.add("is-hidden");
      }
    });
  }

  // navbar buttons -> show appropriate section
  const homeBtn = r_e("home-btn");
  const coursesBtn = r_e("courses-btn");
  const leaderboardsBtn = r_e("leaderboards-btn");
  const playBtn = r_e("play-btn");
  const aboutBtn = r_e("about-btn");

  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("index");
    });
  }

  if (coursesBtn) {
    coursesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("courses-page");
    });
  }

  if (leaderboardsBtn) {
    leaderboardsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("leaderboard-page");
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("play-page");
    });
  }

  if (aboutBtn) {
    aboutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("about-page");
    });
  }

  // default landing page
  showPage("index");
});
