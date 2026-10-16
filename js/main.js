$(function() {
  const d = new Date();
  const hours = d.getHours();
  const night = hours >= 19 || hours <= 7; // between 7pm and 7am
  const body = document.querySelector('body');
  const root = document.documentElement;
  const toggle = document.getElementById('toggle');
  const input = document.getElementById('switch');

  if (night && input && toggle) {
    input.checked = true;
  }
  body.classList.toggle('night', night);
  root.classList.toggle('night', night);

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

  if (toggle && input) {
    toggle.addEventListener('click', function() {
      const isChecked = input.checked;
      body.classList.toggle('night', !isChecked);
      root.classList.toggle('night', !isChecked);
    });
  }

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

  document.querySelectorAll('[data-project-dialog]').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      const dialog = document.getElementById(trigger.dataset.projectDialog);

      if (dialog) {
        const scrollContainer = dialog.querySelector('.project-dialog__scroll');
        const header = dialog.querySelector('.project-dialog__header');

        scrollContainer.scrollTop = 0;
        header.classList.remove('is-compact');
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll('.project-dialog').forEach(function(dialog) {
    const closeButton = dialog.querySelector('.project-dialog__close');
    const scrollContainer = dialog.querySelector('.project-dialog__scroll');
    const header = dialog.querySelector('.project-dialog__header');

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

    function setFrameFromImage() {
      if (!image.naturalWidth || !image.naturalHeight) {
        return;
      }

      const isLandscape = image.naturalWidth > image.naturalHeight;
      const orientation = isLandscape ? 'landscape' : 'portrait';
      const device =
        frame.dataset.device === 'auto'
          ? isLandscape
            ? 'tablet'
            : 'phone'
          : frame.dataset.device;

      frame.classList.add(
        'project-gallery__frame--' + orientation,
        'project-gallery__frame--' + device
      );
    }

    if (image.complete && image.naturalWidth > 0) {
      setFrameFromImage();
    } else {
      image.addEventListener('load', setFrameFromImage, { once: true });
    }
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
