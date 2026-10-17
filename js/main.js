$(function() {
  const d = new Date();
  const night = localStorage.getItem('theme') === 'dark';
  const body = document.querySelector('body');
  const root = document.documentElement;
  const input = document.getElementById('switch');

  body.classList.toggle('night', night);
  root.classList.toggle('night', night);

  if (input) {
    input.checked = night;
    input.addEventListener('change', function() {
      const isNight = input.checked;
      localStorage.setItem('theme', isNight ? 'dark' : 'light');
      body.classList.toggle('night', isNight);
      root.classList.toggle('night', isNight);
    });
  }

  document.querySelectorAll('.job__tenure').forEach(function(tenure) {
    const startParts = tenure.dataset.tenureStart.split('-').map(Number);
    const endParts =
      tenure.dataset.tenureEnd === 'present'
        ? [d.getFullYear(), d.getMonth() + 1]
        : tenure.dataset.tenureEnd.split('-').map(Number);
    const months =
      (endParts[0] - startParts[0]) * 12 + endParts[1] - startParts[1] + 1;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const duration = [];

    if (years) {
      duration.push(years + (years === 1 ? ' yr' : ' yrs'));
    }
    if (remainingMonths) {
      duration.push(remainingMonths + ' mo');
    }

    tenure.textContent = duration.join(' ');
  });

  document
    .querySelectorAll('[data-project-period]')
    .forEach(function(periodElement) {
      const originalPeriod = periodElement.dataset.projectPeriod;
      const period = originalPeriod.match(
        /^([A-Za-z]+)\s+(\d{4})\s*[-–]\s*([A-Za-z]+|\bPresent\b)\s*(\d{4})?$/i
      );

      if (!period) {
        console.error(
          'Unable to calculate project duration from period:',
          originalPeriod
        );
        return;
      }

      const monthNames = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ];
      const startMonth = monthNames.indexOf(
        period[1].slice(0, 3).toLowerCase()
      );
      const isPresent = period[3].toLowerCase() === 'present';
      const endMonth = isPresent
        ? new Date().getMonth()
        : monthNames.indexOf(period[3].slice(0, 3).toLowerCase());
      const startYear = Number(period[2]);
      const endYear = isPresent ? new Date().getFullYear() : Number(period[4]);

      if (startMonth < 0 || endMonth < 0 || !startYear || !endYear) {
        console.error('Unable to parse project period:', originalPeriod);
        return;
      }

      const months = (endYear - startYear) * 12 + endMonth - startMonth + 1;

      if (months < 1) {
        console.error(
          'Project end date precedes its start date:',
          originalPeriod
        );
        return;
      }

      periodElement.textContent = `${originalPeriod} (${months} ${
        months === 1 ? 'month' : 'months'
      })`;
    });

  const intro = document.querySelector('.intro');
  const topButton = document.getElementById('top-button');

  if (intro && topButton) {
    const introHeight = intro.offsetHeight;
    const $topButton = $('#top-button');

    window.addEventListener(
      'scroll',
      function() {
        if (window.scrollY > introHeight) {
          $topButton.fadeIn();
        } else {
          $topButton.fadeOut();
        }
      },
      false
    );

    topButton.addEventListener('click', function() {
      $('html, body').animate({ scrollTop: 0 }, 500);
    });
  }

  const hand = document.querySelector('.emoji.wave-hand');

  if (hand) {
    function waveOnLoad() {
      hand.classList.add('wave');
      setTimeout(function() {
        hand.classList.remove('wave');
      }, 2000);
    }

    setTimeout(function() {
      waveOnLoad();
    }, 1000);

    hand.addEventListener('mouseover', function() {
      hand.classList.add('wave');
    });

    hand.addEventListener('mouseout', function() {
      hand.classList.remove('wave');
    });
  }

  const appStatsCache = new Map();

  function animateCountUp(el, targetVal, duration) {
    if (!el) return;
    const isDecimal =
      String(targetVal).includes('.') || String(targetVal).includes(',');
    const num = parseFloat(String(targetVal).replace(',', '.'));
    if (isNaN(num)) {
      el.textContent = targetVal;
      return;
    }

    const animDuration = duration || 1000;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = num * ease;
      el.textContent = isDecimal
        ? current.toFixed(1).replace('.', ',')
        : Math.round(current).toString();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = isDecimal
          ? num.toFixed(1).replace('.', ',')
          : num.toString();
      }
    }
    requestAnimationFrame(frame);
  }

  function calculateStars(ratingNum) {
    const rounded = Math.round(ratingNum * 2) / 2;
    const full = Math.floor(rounded);
    const half = rounded % 1 !== 0;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        stars += '★';
      } else if (i === full + 1 && half) {
        stars += '★';
      } else {
        stars += '☆';
      }
    }
    return stars;
  }

  function renderStoreStats(statsContainer, storeType) {
    const prefix = storeType === 'playstore' ? 'playstore' : 'appstore';
    statsContainer.dataset.currentStore = storeType;

    const ratingEl = statsContainer.querySelector('[data-stat-value="rating"]');
    const reviewsLabelEl = statsContainer.querySelector(
      '[data-stat-label="reviews"]'
    );
    const starsEl = statsContainer.querySelector('[data-stat-stars]');
    const ageEl = statsContainer.querySelector('[data-stat-value="age"]');
    const rankEl = statsContainer.querySelector('[data-stat-value="rank"]');
    const categoryEl = statsContainer.querySelector(
      '[data-stat-value="category"]'
    );

    const ratingVal = statsContainer.dataset[prefix + 'Rating'];
    const reviewsVal = statsContainer.dataset[prefix + 'Reviews'];
    const rankVal = statsContainer.dataset[prefix + 'Rank'];
    const categoryVal = statsContainer.dataset[prefix + 'Category'];
    const ageVal = statsContainer.dataset[prefix + 'Age'];

    if (ratingEl && ratingVal) {
      animateCountUp(ratingEl, ratingVal, 800);
      const ratingNum = parseFloat(String(ratingVal).replace(',', '.'));
      if (!isNaN(ratingNum) && starsEl) {
        starsEl.textContent = calculateStars(ratingNum);
      }
    }

    if (reviewsLabelEl && reviewsVal) {
      reviewsLabelEl.textContent = reviewsVal
        .toUpperCase()
        .includes('PENILAIAN')
        ? reviewsVal
        : reviewsVal + ' PENILAIAN';
    }

    if (ageEl && ageVal) {
      ageEl.textContent = ageVal;
    }

    if (rankEl && rankVal) {
      rankEl.textContent = rankVal;
    }

    if (categoryEl && categoryVal) {
      categoryEl.textContent = categoryVal;
    }
  }

  async function loadAppStats(dialog) {
    const statsContainer = dialog.querySelector('.project-app-stats');
    if (!statsContainer) return;

    if (!statsContainer._tabsInitialized) {
      statsContainer._tabsInitialized = true;
      const tabButtons = dialog.querySelectorAll('.project-app-stats__tab');
      tabButtons.forEach(function(tabBtn) {
        tabBtn.addEventListener('click', function() {
          const store = tabBtn.dataset.storeTab;
          tabButtons.forEach(function(btn) {
            btn.classList.toggle('is-active', btn === tabBtn);
          });
          renderStoreStats(statsContainer, store);
        });
      });
    }

    const currentStore = statsContainer.dataset.currentStore || 'appstore';
    renderStoreStats(statsContainer, currentStore);

    const appStoreId = statsContainer.dataset.appstoreId;
    if (appStoreId) {
      let data = appStatsCache.get(appStoreId);
      if (!data) {
        try {
          const res = await fetch(
            'https://itunes.apple.com/lookup?id=' +
              encodeURIComponent(appStoreId) +
              '&country=id'
          );
          if (res.ok) {
            const json = await res.json();
            if (json.results && json.results.length > 0) {
              data = json.results[0];
              appStatsCache.set(appStoreId, data);
            }
          }
        } catch (err) {
          console.warn('App Store API fetch warning:', err);
        }
      }

      if (data) {
        if (data.averageUserRating) {
          statsContainer.dataset.appstoreRating = data.averageUserRating
            .toFixed(1)
            .replace('.', ',');
        }

        if (data.userRatingCount) {
          let countStr = data.userRatingCount.toLocaleString('id-ID');
          if (data.userRatingCount >= 1000) {
            countStr =
              (data.userRatingCount / 1000).toFixed(1).replace('.', ',') +
              ' RB';
          }
          statsContainer.dataset.appstoreReviews = countStr;
        }

        if (data.contentAdvisoryRating) {
          statsContainer.dataset.appstoreAge = data.contentAdvisoryRating;
        }

        if (data.primaryGenreName) {
          statsContainer.dataset.appstoreCategory = data.primaryGenreName;
        }

        if (data.trackViewUrl) {
          const appStoreBtn = dialog.querySelector(
            '[data-store-link="appstore"]'
          );
          if (appStoreBtn) {
            appStoreBtn.href = data.trackViewUrl;
          }
        }

        if (statsContainer.dataset.currentStore === 'appstore') {
          renderStoreStats(statsContainer, 'appstore');
        }
      }
    }
  }

  function updateProjectGalleryControls(carousel) {
    const gallery = carousel.querySelector('.project-gallery');
    if (!gallery) return;

    const prevButton = carousel.querySelector(
      '.project-gallery__arrow--prev, [data-gallery-direction="-1"]'
    );
    const nextButton = carousel.querySelector(
      '.project-gallery__arrow--next, [data-gallery-direction="1"]'
    );
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;

    if (prevButton) {
      const atStart = gallery.scrollLeft <= 4;
      prevButton.disabled = atStart;
      prevButton.classList.toggle('is-hidden', atStart || maxScroll <= 4);
    }

    if (nextButton) {
      const atEnd = gallery.scrollLeft >= maxScroll - 4;
      nextButton.disabled = atEnd;
      nextButton.classList.toggle('is-hidden', atEnd || maxScroll <= 4);
    }
  }

  document.querySelectorAll('[data-project-dialog]').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      const dialog = document.getElementById(trigger.dataset.projectDialog);

      if (dialog) {
        const scrollContainer = dialog.querySelector('.project-dialog__scroll');
        const header = dialog.querySelector('.project-dialog__header');

        scrollContainer.scrollTop = 0;
        header.classList.remove('is-compact');
        document.body.classList.add('dialog-open');
        document.documentElement.classList.add('dialog-open');
        dialog.showModal();
        dialog
          .querySelectorAll('.project-gallery__carousel')
          .forEach(updateProjectGalleryControls);
        loadAppStats(dialog);
      }
    });
  });

  document.querySelectorAll('.project-dialog').forEach(function(dialog) {
    const closeButton = dialog.querySelector('.project-dialog__close');
    const scrollContainer = dialog.querySelector('.project-dialog__scroll');
    const header = dialog.querySelector('.project-dialog__header');

    function handleDialogClose() {
      document.body.classList.remove('dialog-open');
      document.documentElement.classList.remove('dialog-open');
    }

    dialog.addEventListener('close', handleDialogClose);

    closeButton.addEventListener('click', function() {
      dialog.close();
    });

    scrollContainer.addEventListener(
      'scroll',
      function() {
        const isCompact = header.classList.contains('is-compact');

        if (scrollContainer.scrollTop > 32 && !isCompact) {
          header.classList.add('is-compact');
        } else if (scrollContainer.scrollTop < 2 && isCompact) {
          header.classList.remove('is-compact');
        }
      },
      { passive: true }
    );

    dialog.addEventListener('cancel', function(event) {
      event.preventDefault();
      dialog.close();
    });

    dialog.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
    });

    dialog.addEventListener('click', function(event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });

  const projectsGrid = document.getElementById('all-projects-grid');

  if (projectsGrid) {
    const searchInput = document.getElementById('project-search');
    const projectCards = Array.from(projectsGrid.querySelectorAll('.project'));
    const resultCount = document.getElementById('project-results');
    const emptyState = document.getElementById('project-empty');
    const pagination = document.getElementById('project-pagination');
    const activeFilters = { platform: 'all', industry: 'all' };
    let currentPage = 1;

    function updateProjects() {
      const query = searchInput.value.trim().toLowerCase();
      const matchingProjects = projectCards.filter(function(project) {
        const matchesQuery = project.dataset.projectSearch.includes(query);
        const matchesPlatform =
          activeFilters.platform === 'all' ||
          project.dataset.projectPlatform === activeFilters.platform;
        const matchesIndustry =
          activeFilters.industry === 'all' ||
          project.dataset.projectIndustry === activeFilters.industry;

        return matchesQuery && matchesPlatform && matchesIndustry;
      });
      const pageSize = window.matchMedia('(max-width: 480px)').matches
        ? 3
        : window.matchMedia('(max-width: 768px)').matches
        ? 6
        : 9;
      const pageCount = Math.ceil(matchingProjects.length / pageSize);

      currentPage = Math.min(currentPage, Math.max(pageCount, 1));
      const firstProjectIndex = (currentPage - 1) * pageSize;
      const visibleProjects = matchingProjects.slice(
        firstProjectIndex,
        firstProjectIndex + pageSize
      );

      projectCards.forEach(function(project) {
        project.hidden = !visibleProjects.includes(project);
      });

      resultCount.textContent =
        matchingProjects.length +
        (matchingProjects.length === 1 ? ' project' : ' projects') +
        ' · Page ' +
        currentPage +
        ' of ' +
        Math.max(pageCount, 1);
      emptyState.hidden = matchingProjects.length !== 0;
      renderPagination(pageCount);
    }

    function renderPagination(pageCount) {
      pagination.replaceChildren();

      if (pageCount <= 1) {
        return;
      }

      function addPageButton(label, page, options) {
        const button = document.createElement('button');
        const isCurrent = page === currentPage;

        button.className = 'all-projects__page';
        button.type = 'button';
        button.textContent = label;
        button.dataset.projectPage = String(page);
        button.setAttribute('aria-label', options.label);
        button.setAttribute('aria-current', isCurrent ? 'page' : 'false');
        button.disabled = options.disabled;
        button.classList.toggle('is-active', isCurrent);
        pagination.appendChild(button);
      }

      addPageButton('Previous', currentPage - 1, {
        label: 'Previous page',
        disabled: currentPage === 1,
      });

      for (let page = 1; page <= pageCount; page += 1) {
        addPageButton(String(page), page, {
          label: 'Page ' + page,
          disabled: false,
        });
      }

      addPageButton('Next', currentPage + 1, {
        label: 'Next page',
        disabled: currentPage === pageCount,
      });
    }

    searchInput.addEventListener('input', function() {
      currentPage = 1;
      updateProjects();
    });

    pagination.addEventListener('click', function(event) {
      const button = event.target.closest('[data-project-page]');

      if (button && !button.disabled) {
        currentPage = Number(button.dataset.projectPage);
        updateProjects();
      }
    });

    document
      .querySelectorAll('[data-project-filter-group]')
      .forEach(function(button) {
        button.addEventListener('click', function() {
          const group = button.dataset.projectFilterGroup;
          activeFilters[group] = button.dataset.projectFilter;
          currentPage = 1;

          document
            .querySelectorAll('[data-project-filter-group="' + group + '"]')
            .forEach(function(groupButton) {
              const isActive = groupButton === button;
              groupButton.classList.toggle('is-active', isActive);
              groupButton.setAttribute('aria-pressed', String(isActive));
            });

          updateProjects();
        });
      });

    window.addEventListener('resize', updateProjects);
    updateProjects();
  }

  document.querySelectorAll('.project-gallery__frame').forEach(function(frame) {
    const image = frame.querySelector('img');
    if (!image) return;

    function applyOrientation() {
      if (image.naturalWidth && image.naturalHeight) {
        const isLandscape = image.naturalWidth > image.naturalHeight;
        frame.dataset.orientation = isLandscape ? 'landscape' : 'portrait';
      }
    }

    function showUnavailable() {
      frame.classList.add('project-gallery__frame--unavailable');
      console.error('Unable to load project screenshot:', image.src);
    }

    image.addEventListener('error', showUnavailable, { once: true });
    image.addEventListener('load', applyOrientation, { once: true });

    if (image.complete) {
      if (!image.naturalWidth) {
        showUnavailable();
      } else {
        applyOrientation();
      }
    }
  });

  document
    .querySelectorAll('.project-gallery__carousel')
    .forEach(function(carousel) {
      const gallery = carousel.querySelector('.project-gallery');
      if (!gallery) return;

      const buttons = Array.from(
        carousel.querySelectorAll('[data-gallery-direction]')
      );
      const items = Array.from(
        gallery.querySelectorAll('.project-gallery__item')
      );

      function updateControls() {
        updateProjectGalleryControls(carousel);
      }

      buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const direction = Number(button.dataset.galleryDirection);
          const scrollStep =
            items.length > 0 && items[0].offsetWidth > 50
              ? items[0].offsetWidth + 16
              : 350;

          gallery.scrollBy({
            left: direction * scrollStep,
            behavior: 'smooth',
          });
        });
      });

      // Mouse drag-to-scroll support
      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let hasDragged = false;

      gallery.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        gallery.classList.add('is-dragging');
        startX = e.pageX - gallery.offsetLeft;
        startScrollLeft = gallery.scrollLeft;
      });

      window.addEventListener('mouseup', function() {
        if (isDown) {
          isDown = false;
          gallery.classList.remove('is-dragging');
        }
      });

      gallery.addEventListener('mouseleave', function() {
        if (isDown) {
          isDown = false;
          gallery.classList.remove('is-dragging');
        }
      });

      gallery.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gallery.offsetLeft;
        const walk = (x - startX) * 1.35;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        gallery.scrollLeft = startScrollLeft - walk;
      });

      gallery.addEventListener(
        'click',
        function(e) {
          if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );

      gallery.addEventListener('scroll', updateControls, { passive: true });
      window.addEventListener('resize', updateControls);
      updateControls();
    });

  document.querySelectorAll('.brand-card__logo img').forEach(function(image) {
    function showWordmark() {
      image.hidden = true;
      const wordmark = image.nextElementSibling;

      if (wordmark) {
        wordmark.hidden = false;
      }

      console.error('Unable to load brand logo:', image.src);
    }

    image.addEventListener('error', showWordmark, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showWordmark();
    }
  });

  window.sr = ScrollReveal({
    reset: false,
    duration: 600,
    easing: 'cubic-bezier(.694,0,.335,1)',
    scale: 1,
    viewFactor: 0.3,
  });

  sr.reveal('.background');
  sr.reveal('.skills');
  sr.reveal('.experience', { viewFactor: 0.2 });
  sr.reveal('.recent-projects', { viewFactor: 0.1 });
});
