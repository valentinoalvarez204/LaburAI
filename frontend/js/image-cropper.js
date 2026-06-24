/* Reusable square image cropper for profile photos and logos. */
(function () {
  const state = {
    file: null,
    image: null,
    objectUrl: '',
    zoom: 1,
    x: 0,
    y: 0,
    options: {},
  };

  function ensureModal() {
    let modal = document.getElementById('imageCropperModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'imageCropperModal';
    modal.className = 'image-crop-modal hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="imageCropperTitle">
        <div class="image-crop-head">
          <h3 class="pf-card-title" id="imageCropperTitle">Ajustar imagen</h3>
          <button type="button" class="modal-close-btn" id="imageCropperClose" aria-label="Cerrar">×</button>
        </div>
        <div class="image-crop-preview" id="imageCropperPreview">
          <img id="imageCropperImage" alt="Vista previa" />
        </div>
        <div class="image-crop-controls">
          <label class="form-label" for="imageCropperZoom">Zoom</label>
          <div class="image-crop-zoom-row">
            <button type="button" class="btn-ghost btn-sm image-crop-step" id="imageCropperZoomOut">-</button>
            <input type="range" id="imageCropperZoom" min="0.5" max="3" step="0.01" value="1" />
            <button type="button" class="btn-ghost btn-sm image-crop-step" id="imageCropperZoomIn">+</button>
          </div>
          <label class="form-label" for="imageCropperX">Horizontal</label>
          <input type="range" id="imageCropperX" min="-180" max="180" step="1" value="0" />
          <label class="form-label" for="imageCropperY">Vertical</label>
          <input type="range" id="imageCropperY" min="-180" max="180" step="1" value="0" />
        </div>
        <div class="image-crop-actions">
          <button type="button" class="btn-ghost btn-sm" id="imageCropperCancel">Cancelar</button>
          <button type="button" class="btn-primary btn-sm" id="imageCropperSave">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    bindModalEvents(modal);
    return modal;
  }

  function reset() {
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.file = null;
    state.image = null;
    state.objectUrl = '';
    state.zoom = 1;
    state.x = 0;
    state.y = 0;
    state.options = {};
  }

  function close() {
    const modal = document.getElementById('imageCropperModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
    reset();
  }

  function updatePreview() {
    const preview = document.getElementById('imageCropperPreview');
    const image = document.getElementById('imageCropperImage');
    if (!preview || !image || !state.image) return;

    const size = preview.clientWidth;
    const baseScale = Math.max(size / state.image.naturalWidth, size / state.image.naturalHeight);
    const width = state.image.naturalWidth * baseScale;
    const height = state.image.naturalHeight * baseScale;

    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.transform = `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px)) scale(${state.zoom})`;
  }

  function setZoom(nextZoom) {
    const zoom = document.getElementById('imageCropperZoom');
    if (!zoom) return;

    const min = Number(zoom.min);
    const max = Number(zoom.max);
    const value = Math.min(max, Math.max(min, nextZoom));
    zoom.value = String(value);
    state.zoom = value;
    updatePreview();
  }

  function syncFromControls() {
    state.zoom = Number(document.getElementById('imageCropperZoom')?.value || 1);
    state.x = Number(document.getElementById('imageCropperX')?.value || 0);
    state.y = Number(document.getElementById('imageCropperY')?.value || 0);
    updatePreview();
  }

  function createFile() {
    const preview = document.getElementById('imageCropperPreview');
    const source = state.image;
    if (!preview || !source) return Promise.reject(new Error('No hay imagen para recortar'));

    const outputSize = state.options.outputSize || 512;
    const previewSize = preview.clientWidth;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.reject(new Error('No se pudo preparar el recorte'));

    canvas.width = outputSize;
    canvas.height = outputSize;

    const baseScale = Math.max(previewSize / source.naturalWidth, previewSize / source.naturalHeight);
    const visibleScale = baseScale * state.zoom;
    const drawnWidth = source.naturalWidth * visibleScale;
    const drawnHeight = source.naturalHeight * visibleScale;
    const scaleToCanvas = outputSize / previewSize;
    const dx = ((previewSize - drawnWidth) / 2 + state.x) * scaleToCanvas;
    const dy = ((previewSize - drawnHeight) / 2 + state.y) * scaleToCanvas;
    const dw = drawnWidth * scaleToCanvas;
    const dh = drawnHeight * scaleToCanvas;

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.drawImage(source, dx, dy, dw, dh);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la imagen recortada'));
          return;
        }
        resolve(new File([blob], state.options.outputName || 'imagen-recortada.png', { type: 'image/png' }));
      }, 'image/png');
    });
  }

  function bindModalEvents(modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });

    modal.querySelector('#imageCropperClose')?.addEventListener('click', close);
    modal.querySelector('#imageCropperCancel')?.addEventListener('click', close);
    modal.querySelector('#imageCropperZoom')?.addEventListener('input', syncFromControls);
    modal.querySelector('#imageCropperX')?.addEventListener('input', syncFromControls);
    modal.querySelector('#imageCropperY')?.addEventListener('input', syncFromControls);
    modal.querySelector('#imageCropperZoomOut')?.addEventListener('click', () => setZoom(state.zoom - 0.1));
    modal.querySelector('#imageCropperZoomIn')?.addEventListener('click', () => setZoom(state.zoom + 0.1));

    modal.querySelector('#imageCropperSave')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const prevText = button.textContent;
      button.disabled = true;
      button.textContent = 'Guardando...';

      try {
        const file = await createFile();
        await state.options.onSave?.(file);
        close();
      } catch (error) {
        state.options.onError?.(error);
      } finally {
        button.disabled = false;
        button.textContent = prevText;
      }
    });
  }

  function open(options) {
    const modal = ensureModal();
    const image = modal.querySelector('#imageCropperImage');
    const title = modal.querySelector('#imageCropperTitle');
    const save = modal.querySelector('#imageCropperSave');
    const zoom = modal.querySelector('#imageCropperZoom');
    const x = modal.querySelector('#imageCropperX');
    const y = modal.querySelector('#imageCropperY');
    if (!options?.file || !image || !zoom || !x || !y) return;

    reset();
    state.file = options.file;
    state.options = options;
    state.objectUrl = URL.createObjectURL(options.file);
    state.image = image;

    if (title) title.textContent = options.title || 'Ajustar imagen';
    if (save) save.textContent = options.saveLabel || 'Guardar';
    zoom.value = '1';
    x.value = '0';
    y.value = '0';

    image.onload = updatePreview;
    image.src = state.objectUrl;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  window.ImageCropper = { open, close };
})();
