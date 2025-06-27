import { NewStory } from "../../data/api";
import CONFIG from "../../config";

export default class AddStoryPresenter {
  #view;
  #map;
  #camera;
  #currentPhotoFile = null;
  #isCameraOpen = false;

  constructor({ view, camera, map }) {
    this.#view = view;
    this.#camera = camera;
    this.#map = map;
  }

  async initialize() {
    await new Promise((resolve) => {
      this.#view.loadMapTilerResources(resolve);
    });

    this.initializeListeners();
    await this.initializeMap();
  }

  initializeListeners() {
    this.#view.bindPhotoInputButton(this.handlePhotoInputClick.bind(this));
    this.#view.bindPhotoInput(this.handlePhotoChange.bind(this));
    this.#view.bindCameraToggle(this.handleCameraToggle.bind(this));
    this.#view.bindTakePhotoButton(this.handleTakePhoto.bind(this));
    this.#view.bindFormSubmit(this.handleFormSubmit.bind(this));
    this.#view.bindLocationInputs(this.updateMarkerFromInputs.bind(this));
  }

  handlePhotoInputClick() {
    this.#view.clickPhotoInput();
    if (this.#isCameraOpen) {
      this.#camera.stop();
      this.#view.hideCameraContainer();
      this.#view.updateCameraButtonText("Open Camera");
      this.#isCameraOpen = false;
    }
  }

  handlePhotoChange(file) {
    if (file) {
      this.#currentPhotoFile = file;
      this.#view.showPhotoPreview(file);
      if (this.#isCameraOpen) {
        this.#camera.stop();
        this.#view.hideCameraContainer();
        this.#view.updateCameraButtonText("Open Camera");
        this.#isCameraOpen = false;
      }
    }
  }

  async handleCameraToggle() {
    if (!this.#isCameraOpen) {
      this.#view.resetPhotoInput();
      const success = this.#camera.start();
      if (success) {
        this.#view.showCameraContainer();
        this.#view.hidePhotoPreview();
        this.#view.updateCameraButtonText("Close Camera");
        this.#isCameraOpen = true;
      } else {
        this.#view.showAlert("Could not access camera");
      }
    } else {
      this.#camera.stop();
      this.#view.hideCameraContainer();
      this.#view.updateCameraButtonText("Open Camera");
      this.#isCameraOpen = false;
    }
  }

  async handleTakePhoto() {
    this.#currentPhotoFile = await this.#camera.takePhoto();
    if (this.#currentPhotoFile) {
      this.#view.showPhotoPreview(this.#currentPhotoFile);
      this.#camera.stop();
      this.#view.hideCameraContainer();
      this.#view.updateCameraButtonText("Open Camera");
      this.#isCameraOpen = false;
    }
  }

  async handleFormSubmit(formData) {
    const { description, photoFile, latitude, longitude } = formData;
    const photoToUpload = this.#currentPhotoFile || photoFile;

    if (!photoToUpload) {
      this.#view.showAlert("Please select or take a photo");
      return;
    }

    try {
      const response = await NewStory({
        description,
        photo: photoToUpload,
        lat: latitude,
        lon: longitude,
      });

      if (!response.error) {
        this.#view.showAlert("Story uploaded successfully!");
        this.#view.navigateToHome();
      } else {
        this.#view.showAlert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      this.#view.showAlert("An error occurred while uploading the story");
      console.error(error);
    } finally {
      if (this.#isCameraOpen) {
        this.#camera.stop();
      }
    }
  }

  async initializeMap() {
    if (typeof maplibregl === "undefined") {
      await new Promise((resolve) => {
        const checkMapTiler = setInterval(() => {
          if (typeof maplibregl !== "undefined") {
            clearInterval(checkMapTiler);
            resolve();
          }
        }, 100);
      });
    }

    this.#view.showMapLoading();

    const apiKey = CONFIG.MAP_SERVICE_API_KEY;
    const { latValue, lngValue } = this.#view.getLocationValues();
    const initialLat = latValue ? parseFloat(latValue) : -6.175389;
    const initialLng = lngValue ? parseFloat(lngValue) : 106.827139;
    const mapStyle = "streets";

    try {
      const map = new maplibregl.Map({
        container: "map",
        style: `https://api.maptiler.com/maps/${mapStyle}/style.json?key=${apiKey}`,
        center: [initialLng, initialLat],
        zoom: 13,
        attributionControl: false,
      });

      map.on("load", () => {
        this.#view.clearMapLoading();
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution:
            '<span style="color: #333">Mark the location</span>',
        })
      );

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      const markerEl = this.#view.createMarkerElement();

      const marker = new maplibregl.Marker({
        element: markerEl,
        draggable: true,
        anchor: "bottom",
      })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      this.#map = map;
      this.marker = marker;

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        this.#view.updateLocationInputs(
          lngLat.lat.toFixed(6),
          lngLat.lng.toFixed(6)
        );
      });

      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        this.#view.updateLocationInputs(lat.toFixed(6), lng.toFixed(6));
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      this.#view.showMapError();
    }
  }

  updateMarkerFromInputs() {
    const { latValue, lngValue } = this.#view.getLocationValues();
    const lat = latValue ? parseFloat(latValue) : null;
    const lng = lngValue ? parseFloat(lngValue) : null;

    if (
      lat !== null &&
      lng !== null &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      this.marker &&
      this.#map
    ) {
      this.marker.setLngLat([lng, lat]);
      this.#map.flyTo({
        center: [lng, lat],
        zoom: 13,
      });
    } else if (this.marker) {
      this.marker.remove();
    }
  }
}
