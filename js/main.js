document.addEventListener('DOMContentLoaded', () => {
  const burgers = Array.from(document.querySelectorAll('.navbar-burger'));

  burgers.forEach((burger) => {
    burger.addEventListener('click', () => {
      const target = document.getElementById(burger.dataset.target);
      burger.classList.toggle('is-active');
      if (target) {
        target.classList.toggle('is-active');
      }
    });
  });
});
