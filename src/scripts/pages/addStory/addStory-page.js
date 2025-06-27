import AddStoryPresenter from "./addStory-presenter";
import CONFIG from "../../config";
import Camera from "../../utils/camera";

export default class AddStoryPage {
  #presenter;
  #camera;
  #elements = {};

  async render() {
    return `
     <section class="story-verse-container">
        <div class="header">
          <p class="instruction-text-add">Share Your StoryVerse</p>
          <a href="#/" class="back-btn">Back to home</a>
        </div>

        <h1 class="story-title">STORYVERSE POST STORY</h1>

        <div class="upload-form-container">
          <form id="upload-form" class="story-form">
            <!-- Description -->
            <div class="form-control-story">
              <label for="description-input" class="form-label">Your Story</label>
              <div class="input-container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="What are you witnessing? What’s happening around you? Let others know. Share your stories and broaden the horizons of our StoryVerse together."
                  required
                ></textarea>
              </div>
            </div>

            <!-- Image Upload -->
            <div class="form-control">
              <label class="form-label">Upload Image</label>
              <div id="photo-more-info">Choose or capture an image related to your story</div>
              <div class="documentation-container">
                <div class="documentation-buttons">
                  <button id="photo-input-button" class="btn btn-outline" type="button">Select Image</button>
                  <button id="camera-toggle-button" class="btn btn-outline" type="button">Use Camera</button>
                  <input
                    id="photo-input"
                    name="photo"
                    type="file"
                    accept="image/*"
                    hidden
                    aria-describedby="photo-more-info"
                  >
                </div>

                <div id="camera-container" style="display: none; margin-top: 20px; position: relative;">
                  <video id="camera-video" width="100%" autoplay></video>
                  <canvas id="camera-canvas" style="display: none;"></canvas>
                  <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button id="take-photo-button" class="btn" type="button">Capture Photo</button>
                  </div>
                </div>

                <div id="photo-preview-container" class="photo-preview">
                  <img id="photo-preview" style="max-width: 100%; max-height: 300px; display: none;" />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="form-control">
              <label class="form-label">Location</label>
              <div class="location-container">
                <div class="location-map-container">
                  <div id="map" class="location-map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="location-coords">
                  <input type="number" id="latitude-input" name="latitude" placeholder="Latitude" step="any">
                  <input type="number" id="longitude-input" name="longitude" placeholder="Longitude" step="any">
                </div>
              </div>
            </div>

            <!-- Submit -->
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Submit Story</button>
              </span>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#initializeElements();

    this.#setupBackButtonHandler();

    this.#camera = new Camera(
      this.#elements.video,
      this.#elements.canvas
    );

    this.#presenter = new AddStoryPresenter({
      view: this,
      camera: this.#camera,
      map: null,
    });

    await this.#presenter.initialize();
  }

  #initializeElements() {
    this.#elements = {
      video: document.getElementById("camera-video"),
      canvas: document.getElementById("camera-canvas"),
      photoInputButton: document.getElementById("photo-input-button"),
      cameraToggleButton: document.getElementById("camera-toggle-button"),
      photoInput: document.getElementById("photo-input"),
      cameraContainer: document.getElementById("camera-container"),
      takePhotoButton: document.getElementById("take-photo-button"),
      photoPreviewContainer: document.getElementById("photo-preview-container"),
      photoPreview: document.getElementById("photo-preview"),
      map: document.getElementById("map"),
      mapLoadingContainer: document.getElementById("map-loading-container"),
      latitudeInput: document.getElementById("latitude-input"),
      longitudeInput: document.getElementById("longitude-input"),
      submitButtonContainer: document.getElementById("submit-button-container"),
      uploadForm: document.getElementById("upload-form"),
      descriptionInput: document.getElementById("description-input"),
    };
  }

  #setupBackButtonHandler() {
    const backButton = document.querySelector(".back-btn");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = "#/";
          });
        } else {
          window.location.hash = "#/";
        }
      });
    }
  }

  bindPhotoInputButton(handler) {
    this.#elements.photoInputButton.addEventListener("click", handler);
  }

  bindPhotoInput(handler) {
    this.#elements.photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      handler(file);
    });
  }

  bindCameraToggle(handler) {
    this.#elements.cameraToggleButton.addEventListener("click", handler);
  }

  bindTakePhotoButton(handler) {
    this.#elements.takePhotoButton.addEventListener("click", handler);
  }

  bindFormSubmit(handler) {
    this.#elements.uploadForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = {
        description: this.#elements.descriptionInput.value,
        photoFile: this.#elements.photoInput.files[0],
        latitude: this.#elements.latitudeInput.value
          ? parseFloat(this.#elements.latitudeInput.value)
          : null,
        longitude: this.#elements.longitudeInput.value
          ? parseFloat(this.#elements.longitudeInput.value)
          : null,
      };

      handler(formData);
    });
  }

  bindLocationInputs(handler) {
    this.#elements.latitudeInput.addEventListener("change", handler);
    this.#elements.longitudeInput.addEventListener("change", handler);
  }

  clickPhotoInput() {
    this.#elements.photoInput.click();
  }

  resetPhotoInput() {
    this.#elements.photoInput.value = "";
  }

  showCameraContainer() {
    this.#elements.cameraContainer.style.display = "block";
  }

  hideCameraContainer() {
    this.#elements.cameraContainer.style.display = "none";
  }

  hidePhotoPreview() {
    this.#elements.photoPreview.style.display = "none";
  }

  updateCameraButtonText(text) {
    this.#elements.cameraToggleButton.textContent = text;
  }

  showPhotoPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.#elements.photoPreview.src = e.target.result;
      this.#elements.photoPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  showAlert(message) {
    alert(message);
  }

  showMapLoading() {
    this.#elements.mapLoadingContainer.innerHTML = `
      <div style="text-align: center;">Loading haunted map locations...</div>
    `;
  }

  clearMapLoading() {
    this.#elements.mapLoadingContainer.innerHTML = "";
  }

  showMapError() {
    this.#elements.mapLoadingContainer.innerHTML = `
      <div style="text-align: center; color: red;">Failed to load the map. Please try again later.</div>
    `;
  }

  getLocationValues() {
    return {
      latValue: this.#elements.latitudeInput.value,
      lngValue: this.#elements.longitudeInput.value,
    };
  }

  updateLocationInputs(lat, lng) {
    this.#elements.latitudeInput.value = lat;
    this.#elements.longitudeInput.value = lng;
  }

  navigateToHome() {
    window.location.hash = "#/";
  }

  hideMapLoading() {
  this.clearMapLoading();
}


  destroy() {
    if (this.#camera) {
      this.#camera.stop();
    }
  }


  loadMapTilerResources(onLoaded) {
  const mapTilerCSS = document.createElement("link");
  mapTilerCSS.rel = "stylesheet";
  mapTilerCSS.href = "https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.css";
  document.head.appendChild(mapTilerCSS);

  const script = document.createElement("script");
  script.src = "https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.js";

  const timeout = setTimeout(() => {
    console.warn("MapTiler script loading timed out");
    onLoaded();
  }, 10000);

  script.onload = () => {
    clearTimeout(timeout);
    onLoaded();
  };

  document.head.appendChild(script);
}

createMarkerElement() {
  const markerEl = document.createElement("div");
  markerEl.className = "custom-marker";
  markerEl.innerHTML = `
    <svg width="30" height="45" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 23.2843 15 45 15 45C15 45 30 23.2843 30 15C30 6.71573 23.2843 0 15 0Z" fill="#E74C3C" />
      <circle cx="15" cy="15" r="7" fill="white" />
    </svg>
  `;
  markerEl.style.width = "30px";
  markerEl.style.height = "45px";
  markerEl.style.cursor = "pointer";
  markerEl.style.filter = "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))";
  return markerEl;
}

}


