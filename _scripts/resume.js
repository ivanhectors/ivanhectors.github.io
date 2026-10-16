import {
  getDocument,
  GlobalWorkerOptions,
} from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';

GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const viewer = document.querySelector('.resume-viewer__document');
const stage = document.querySelector('.resume-viewer__stage');
const pagesElement = document.querySelector('.resume-viewer__pages');
const status = document.querySelector('.resume-viewer__status');
const toolbar = document.querySelector('.resume-viewer__toolbar');

if (viewer && stage && pagesElement && status && toolbar) {
  const zoomIn = toolbar.querySelector('[data-resume-zoom="in"]');
  const zoomOut = toolbar.querySelector('[data-resume-zoom="out"]');
  const printButton = toolbar.querySelector('[data-resume-print]');
  let pdf;
  let zoom = 1;
  let renderId = 0;
  let renderTasks = [];
  let lastStageWidth = 0;

  function updateZoomButtons() {
    zoomIn.disabled = !pdf || zoom >= 2;
    zoomOut.disabled = !pdf || zoom <= 0.5;
  }

  async function renderPages() {
    const currentRenderId = ++renderId;
    renderTasks.forEach(task => task.cancel());
    renderTasks = [];
    pagesElement.replaceChildren();
    status.hidden = true;

    const firstPage = await pdf.getPage(1);
    const baseScale =
      (stage.clientWidth - 24) / firstPage.getViewport({ scale: 1 }).width;
    const scale = baseScale * zoom;
    const outputScale = window.devicePixelRatio || 1;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (currentRenderId !== renderId) {
        return;
      }

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const wrapper = document.createElement('div');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error(
          'Unable to create a canvas context for the resume PDF.'
        );
      }

      wrapper.className = 'resume-viewer__page';
      wrapper.setAttribute(
        'aria-label',
        `Page ${pageNumber} of ${pdf.numPages}`
      );
      wrapper.style.width = `${viewport.width}px`;
      canvas.className = 'resume-viewer__canvas';
      canvas.width = Math.ceil(viewport.width * outputScale);
      canvas.height = Math.ceil(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      wrapper.appendChild(canvas);
      pagesElement.appendChild(wrapper);

      const task = page.render({
        canvasContext: context,
        viewport,
        transform:
          outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
      });
      renderTasks.push(task);

      try {
        await task.promise;
      } catch (error) {
        if (
          error.name === 'RenderingCancelledException' &&
          currentRenderId !== renderId
        ) {
          return;
        }
        throw error;
      }
    }

    renderTasks = [];
    lastStageWidth = stage.clientWidth;
  }

  function showError(error) {
    status.hidden = false;
    status.textContent =
      'Unable to load the resume PDF. Please try again later.';
    status.setAttribute('role', 'alert');
    console.error('Resume PDF viewer failed to render the document.', error);
  }

  getDocument(viewer.dataset.resumePdf)
    .promise.then(function(document) {
      pdf = document;
      updateZoomButtons();
      return renderPages();
    })
    .catch(showError);

  zoomIn.addEventListener('click', function() {
    zoom = Math.min(2, Math.round((zoom + 0.2) * 10) / 10);
    updateZoomButtons();
    renderPages().catch(showError);
  });

  zoomOut.addEventListener('click', function() {
    zoom = Math.max(0.5, Math.round((zoom - 0.2) * 10) / 10);
    updateZoomButtons();
    renderPages().catch(showError);
  });

  printButton.addEventListener('click', function() {
    window.print();
  });

  let resizeTimer;
  window.addEventListener('resize', function() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function() {
      if (pdf && stage.clientWidth !== lastStageWidth) {
        renderPages().catch(showError);
      }
    }, 150);
  });

  updateZoomButtons();
}
