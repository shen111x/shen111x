(function () {
  'use strict';

  window.site = window.site || {};

  window.site.escapeHtml = function (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character];
    });
  };

  window.site.projectDataUrl = function (projectNumber) {
    return '/project-data/' + encodeURIComponent(projectNumber) + '/index.json';
  };

  window.site.projectAssetUrl = function (projectNumber, path) {
    return '/project-data/' + encodeURIComponent(projectNumber) + '/' + String(path).replace(/^\/+/, '');
  };

  var headerFrame = document.querySelector('.header-iframe');
  if (!headerFrame) return;

  var previousY = window.pageYOffset;
  var scrollDirection;

  window.onscroll = function () {
    var currentY = window.pageYOffset;
    var pageScrollX = window.pageXOffset;
    var maxScrollY = Math.max(
      window.scrollMaxY || 0,
      document.body.scrollHeight - window.innerHeight
    );

    if (
      currentY > 0 &&
      currentY < maxScrollY &&
      currentY !== pageScrollX
    ) {
      if (currentY === 0 || currentY === maxScrollY) {
        scrollDirection = 'down';
      } else if (previousY > currentY) {
        scrollDirection = 'down';
      } else {
        scrollDirection = 'up';
      }
    }

    previousY = currentY;

    if (headerFrame.contentWindow) {
      headerFrame.contentWindow.postMessage({
        type: 'scroll',
        scrollDirection: scrollDirection
      }, window.location.origin);
    }
  };
}());
