(function () {
  'use strict';

  var placeholders = Array.prototype.slice.call(document.querySelectorAll('[work-list-item-number]'));
  if (!placeholders.length) return;

  fetch('/pages/work-list/work-list-item/index.html')
    .then(function (response) {
      if (!response.ok) throw new Error('Work list item request failed: ' + response.status);
      return response.text();
    })
    .then(function (template) {
      placeholders.forEach(function (element) {
        renderItem(element, template);
      });
    })
    .catch(function (error) {
      console.error(error);
      placeholders.forEach(function (element) {
        element.innerHTML = '<span class="work-list-item__error">Unable to load project.</span>';
      });
    });

  function renderItem(element, template) {
    var projectNumber = element.getAttribute('work-list-item-number');

    fetch(window.site.projectDataUrl(projectNumber))
      .then(function (response) {
        if (!response.ok) throw new Error('Project ' + projectNumber + ' request failed: ' + response.status);
        return response.json();
      })
      .then(function (project) {
        element.innerHTML = template;

        var item = element.querySelector('.work-list-item');
        var detailUrl = '/pages/project-detail/?project=' + encodeURIComponent(project.number);
        var gallery = item.querySelector('.work-list-item__gallery');
        var track = item.querySelector('[data-field="small-gallery"]');
        var mediaItems = project.smallGallery || [project.cover];

        item.dataset.projectNumber = project.number;
        item.querySelector('[data-field="detail-link"]').href = detailUrl;
        item.querySelector('[data-field="title"]').innerHTML = window.site.escapeHtml(project.title).replace(/\n/g, '<br>');

        appendMedia(track, project, mediaItems);
        initGallery(gallery);
      })
      .catch(function (error) {
        console.error(error);
        element.innerHTML = '<span class="work-list-item__error">Unable to load project ' +
          window.site.escapeHtml(projectNumber) + '.</span>';
      });
  }

  function appendMedia(track, project, mediaItems) {
    mediaItems.forEach(function (media, index) {
      var source = media.src || media.small || media.large;
      var isVideo = media.type === 'video' || /\.mp4$/i.test(source);
      var slide = document.createElement('div');
      var node = document.createElement(isVideo ? 'video' : 'img');

      slide.className = 'work-list-item__slide';
      node.src = window.site.projectAssetUrl(project.number, source);

      if (isVideo) {
        node.muted = true;
        node.loop = true;
        node.autoplay = true;
        node.playsInline = true;
        node.preload = 'metadata';
        node.setAttribute('aria-label', media.alt || project.title + ' video ' + (index + 1));
      } else {
        node.alt = media.alt || project.title + ' image ' + (index + 1);
        node.loading = index ? 'lazy' : 'eager';
      }

      slide.appendChild(node);
      track.appendChild(slide);
    });
  }

  function initGallery(gallery) {
    var imageQuantity = gallery.querySelector('.work-list-item__track').children.length;
    var intervalId;
    var isHovering = false;

    if (imageQuantity < 2) return;

    function nextSlide() {
      var slideWidth = gallery.clientWidth;
      var activeIndex = Math.round(gallery.scrollLeft / slideWidth);
      gallery.scrollLeft = activeIndex >= imageQuantity - 1 ? 0 : (activeIndex + 1) * slideWidth;
    }

    function stop() {
      window.clearInterval(intervalId);
    }

    function start() {
      stop();
      if (!isHovering) intervalId = window.setInterval(nextSlide, 3800);
    }

    gallery.addEventListener('click', nextSlide);
    gallery.addEventListener('mouseenter', function () {
      isHovering = true;
      stop();
    });
    gallery.addEventListener('mouseleave', function () {
      isHovering = false;
      start();
    });
    gallery.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      nextSlide();
    });

    start();
  }
}());
