(function () {
  'use strict';
  var container = document.getElementById('footer-container');
  if (!container) return;

  fetch('/components/footer/index.html?v=20260806')
    .then(function (response) {
      if (!response.ok) throw new Error('Footer request failed: ' + response.status);
      return response.text();
    })
    .then(function (html) { container.innerHTML = html; })
    .catch(function (error) { console.error(error); });
}());
