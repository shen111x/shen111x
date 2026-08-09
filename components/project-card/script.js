(function () {
  'use strict';

  var placeholders = Array.prototype.slice.call(document.querySelectorAll('[project-number]'));
  if (!placeholders.length) return;

  var pendingMedia = new WeakMap();
  var mediaObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var load = pendingMedia.get(entry.target);
      if (load) load();
      pendingMedia.delete(entry.target);
      mediaObserver.unobserve(entry.target);
    });
  }, { rootMargin: '300px 0px' }) : null;

  fetch('/components/project-card/index.html')
    .then(function (response) {
      if (!response.ok) throw new Error('Project card request failed: ' + response.status);
      return response.text();
    })
    .then(function (template) {
      return placeholders.reduce(function (sequence, element) {
        return sequence.then(function (projects) {
          return loadProjectData(element).then(function (project) {
            projects.push(project);
            return projects;
          });
        });
      }, Promise.resolve([])).then(function (projects) {
        projects.forEach(function (project, index) {
          renderProjectCard(placeholders[index], template, project);
        });
      });
    })
    .catch(function (error) {
      console.error(error);
      placeholders.forEach(function (element) {
        element.innerHTML = '<span class="project-card__error">Unable to load project.</span>';
      });
    });

  function loadProjectData(element) {
    var projectNumber = element.getAttribute('project-number');
    return fetch(window.site.projectDataUrl(projectNumber))
      .then(function (response) {
        if (!response.ok) throw new Error('Project ' + projectNumber + ' request failed: ' + response.status);
        return response.json();
      })
      .catch(function (error) {
        console.error(error);
        return { error: true, number: projectNumber };
      });
  }

  function renderProjectCard(element, template, project) {
    var projectNumber = element.getAttribute('project-number');
    element.id = 'project-' + projectNumber;
    if (project.error) {
      element.innerHTML = '<span class="project-card__error">Unable to load project ' + window.site.escapeHtml(projectNumber) + '.</span>';
      return;
    }

    element.innerHTML = template;
    var card = element.querySelector('.project-card');
    card.dataset.projectNumber = projectNumber;
    fillText(card, project);
    loadMediaWhenNeeded(card, projectNumber, project);
  }

  function loadMediaWhenNeeded(card, projectNumber, project) {
    function load() {
      fillMedia(card, projectNumber, project);
      initCarousels(card);
    }

    if (!mediaObserver) {
      load();
      return;
    }

    pendingMedia.set(card, load);
    mediaObserver.observe(card);
  }

  function fillText(card, project) {
    var detailUrl = '/pages/project-detail/?project=' + encodeURIComponent(project.number);
    card.querySelectorAll('[data-field="detail-link"]').forEach(function (link) {
      link.href = detailUrl;
    });
    card.querySelector('[data-field="title"]').innerHTML = window.site.escapeHtml(project.title).replace(/\n/g, '<br>');
    card.querySelector('[data-field="year"]').textContent = project.year || '';
    card.querySelector('[data-field="categories"]').textContent = (project.categories || []).join(' / ');
  }

  function fillMedia(card, projectNumber, project) {
    var smallGallery = project.smallGallery || [project.cover];
    appendMedia(card.querySelector('[data-field="small-gallery"]'), projectNumber, smallGallery, project.title);
    appendMedia(card.querySelector('[data-field="gallery"]'), projectNumber, project.gallery || [], project.title);
  }

  function appendMedia(track, projectNumber, mediaItems, title) {
    mediaItems.forEach(function (media, index) {
      var slide = document.createElement('div');
      var source = media.src || media.small || media.large;
      var url = window.site.projectAssetUrl(projectNumber, source);
      var isVideo = media.type === 'video' || /\.mp4$/i.test(source);
      var node = document.createElement(isVideo ? 'video' : 'img');

      slide.className = 'carousel__slide';
      if (isVideo) {
        node.muted = true;
        node.loop = true;
        node.autoplay = true;
        node.playsInline = true;
        node.preload = 'metadata';
        node.setAttribute('aria-label', media.alt || title + ' video ' + (index + 1));
      } else {
        node.alt = media.alt || title + ' image ' + (index + 1);
        node.loading = index ? 'lazy' : 'eager';
      }
      node.src = url;
      slide.appendChild(node);
      track.appendChild(slide);
    });
  }

  function initCarousels(card) {
    card.querySelectorAll('.carousel').forEach(function (carousel) {
      var track = carousel.querySelector('.carousel__track');
      var imageQuantity = track.children.length;
      var scrollNeed = 0;
      var intervalId;
      var isHovering = false;
      var isPointerDown = false;
      var pageWidth = 0;
      var lastCarouselWidth = 0;
      var delay = carousel.dataset.carousel === 'small' ? 3800 : 4500;
      var initialDelay = carousel.dataset.carousel === 'small' ? 800 : 1000;
      var indicators = carousel.dataset.carousel === 'large' ?
        card.querySelector('[data-field="gallery-indicators"]') : null;

      if (imageQuantity < 2) return;

      syncSlideWidths();
      if (indicators) createIndicators();

      if ('ResizeObserver' in window) {
        new ResizeObserver(syncSlideWidths).observe(carousel);
      } else {
        window.addEventListener('resize', syncSlideWidths);
      }

      function getTrackGap() {
        var styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap) || 0;
      }

      function syncSlideWidths() {
        var carouselWidth = carousel.clientWidth;
        if (!carouselWidth || carouselWidth === lastCarouselWidth) return;

        var previousPageWidth = pageWidth;
        var activeIndex = previousPageWidth ?
          Math.round(carousel.scrollLeft / previousPageWidth) : 0;

        track.style.setProperty('--carousel-slide-width', carouselWidth + 'px');
        lastCarouselWidth = carouselWidth;
        pageWidth = carouselWidth + getTrackGap();

        if (previousPageWidth) {
          carousel.scrollLeft = Math.min(
            activeIndex * pageWidth,
            carousel.scrollWidth - carousel.clientWidth
          );
          scrollNeed = pageWidth;
          updateIndicators();
        }
      }

      function createIndicators() {
        for (var index = 0; index < imageQuantity; index += 1) {
          var indicator = document.createElement('button');
          indicator.className = 'project-card__gallery-indicator';
          indicator.type = 'button';
          indicator.setAttribute('aria-label', 'Show image ' + (index + 1) + ' of ' + imageQuantity);
          indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
          indicator.dataset.slideIndex = index;
          indicator.addEventListener('click', function (event) {
            event.stopPropagation();
            carousel.scrollLeft = pageWidth * Number(event.currentTarget.dataset.slideIndex);
          });
          indicators.appendChild(indicator);
        }
      }

      function updateIndicators() {
        if (!indicators || !pageWidth) return;
        var activeIndex = Math.min(imageQuantity - 1, Math.max(0,
          Math.round(carousel.scrollLeft / pageWidth)));
        indicators.querySelectorAll('.project-card__gallery-indicator').forEach(function (indicator, index) {
          indicator.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
        });
      }

      function updateInfo() {
        var scrollLeft = carousel.scrollLeft;

        restartInterval();

        scrollNeed = pageWidth - (scrollLeft % pageWidth);

        if (scrollNeed < 3) {
          scrollNeed = pageWidth;
        }

        updateIndicators();
      }

      function nextSlide() {
        if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth) {
          carousel.scrollLeft = 0;
        } else {
          carousel.scrollLeft += scrollNeed;
        }

        updateInfo();
      }

      function stopInterval() {
        window.clearInterval(intervalId);
      }

      function restartInterval() {
        stopInterval();
        if (isHovering || isPointerDown) return;
        intervalId = window.setInterval(nextSlide, delay);
      }

      carousel.addEventListener('scroll', updateInfo, { passive: true });

      carousel.addEventListener('click', function () {
        nextSlide();
      });

      carousel.addEventListener('mouseenter', function () {
        isHovering = true;
        stopInterval();
      });

      carousel.addEventListener('mouseleave', function () {
        isHovering = false;
        restartInterval();
      });

      carousel.addEventListener('pointerdown', function () {
        isPointerDown = true;
        stopInterval();
      });

      window.addEventListener('pointerup', function () {
        if (!isPointerDown) return;
        isPointerDown = false;
        restartInterval();
      });

      window.addEventListener('pointercancel', function () {
        if (!isPointerDown) return;
        isPointerDown = false;
        restartInterval();
      });

      carousel.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          nextSlide();
        }
      });

      intervalId = window.setInterval(nextSlide, initialDelay);
    });
  }
}());
