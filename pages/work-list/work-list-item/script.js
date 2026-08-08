(function () {
  'use strict';

  var list = document.querySelector('.work-list');
  var example = list && list.querySelector('[work-list-item-number]');
  if (!list || !example) return;

  var template = example.innerHTML;
  var scanMax = Number(list.getAttribute('data-project-scan-max'));
  if (!Number.isInteger(scanMax) || scanMax < 1) scanMax = 99;

  scanProjects(scanMax)
    .then(function (projects) {
      renderProjects(template, projects);
    })
    .catch(function (error) {
      console.error(error);
    });

  function scanProjects(maxProjectNumber) {
    var requests = [];

    for (var projectNumber = 1; projectNumber <= maxProjectNumber; projectNumber += 1) {
      requests.push(loadProject(projectNumber));
    }

    return Promise.all(requests).then(function (projects) {
      return projects.filter(function (project) {
        return project !== null;
      });
    });
  }

  function loadProject(projectNumber) {
    return fetch(window.site.projectDataUrl(projectNumber))
      .then(function (response) {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Project ' + projectNumber + ' request failed: ' + response.status);
        return response.json();
      })
      .then(function (project) {
        if (project === null) return null;
        if (!project || !project.title ||
          (!(project.smallGallery && project.smallGallery.length) && !project.cover)) {
          throw new Error('Project ' + projectNumber + ' data is incomplete.');
        }

        // The folder number is the source of truth for links and asset paths.
        project.number = String(projectNumber);
        return project;
      })
      .catch(function (error) {
        console.error(error);
        return null;
      });
  }

  function renderProjects(template, projects) {
    if (!projects.length) {
      example.remove();
      return;
    }

    projects.sort(function (a, b) {
      return Number(a.number) - Number(b.number);
    });

    projects.forEach(function (project, index) {
      var element = index === 0 ? example : document.createElement('div');
      element.setAttribute('work-list-item-number', project.number);
      if (index > 0) list.appendChild(element);
      renderItem(element, template, project);
    });
  }

  function renderItem(element, template, project) {
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
