document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-to-content');

  if (mainContent && skipLink) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }
});
