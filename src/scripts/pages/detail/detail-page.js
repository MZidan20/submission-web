import detailPresenter from '../detail/detail-presenter.js';
import { getStoryDetail } from '../../data/api.js';
import CONFIG from "../../config.js";


export default class detailPage{
    #presenter = null;

    constructor(){
        this.#presenter = new detailPresenter({
            view: this,
            model: { getStoryDetail },
        });
    }

    
    async render() {
        return `
      <section class="story-verse-container">
        <div class="header">
          <p class="instruction-text-detail">View Detail Post</p>
          <a href="#/" class="back-btn">Back to Homepage</a>
        </div>

        <h1 class="story-title">POST DETAIL STORYVERSE</h1>

        <div class="detail-container">
          <div class="loading-indicator">Load story detail...</div>
        </div>
      </section>
        `;
    }

    async afterRender() {
        const storyId = this.getStoryIdFromUrl();
        await this.#presenter.init(storyId);
        this.setupBackButtonHandler();
        this._setupBookmarkButtonHandler();
    }

     _setupBookmarkButtonHandler() {
    const button = document.getElementById('bookmarkButton');
    if (button) {
      button.addEventListener('click', () => {
        this.#presenter.handleBookmarkClick();
      });
    }
  }

  showBookmarkButton(isBookmarked) {
    const container = document.querySelector('.detail-container'); 
    let buttonHtml = `<div id="bookmark-container" style="margin-top: 20px;">`;
    if (isBookmarked) {
      buttonHtml += `<button id="bookmarkButton" class="btn">Hapus dari Bookmark</button>`;
    } else {
      buttonHtml += `<button id="bookmarkButton" class="btn">Simpan ke Bookmark</button>`;
    }
    buttonHtml += `</div>`;

    const oldContainer = document.getElementById('bookmark-container');
    if (oldContainer) oldContainer.remove();

    container.insertAdjacentHTML('beforeend', buttonHtml);
    this._setupBookmarkButtonHandler(); 
  }

    getStoryIdFromUrl() {
        const url = window.location.hash;
        const idMatch = url.match(/#\/detail-page\/([^\/]+)/);
        return idMatch?.[1];
    }

    setupBackButtonHandler() {
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


      showError(message) {
        const detailContainer = document.querySelector(".detail-container");
        if (detailContainer) {
          detailContainer.innerHTML = `
            <div class="error-message">
              <p>${message}</p>
              <a href="#/" class="back-btn">Back to Home</a>
            </div>
          `;
        }
      }

      showMapError(message) {
        const mapContainer = document.getElementById("storyMap");
        if (mapContainer) {
          mapContainer.innerHTML = `<p class="error-message">${message}</p>`;
        }
      }

      loadMapScripts() {
          const mapTilerStylesheet = document.createElement("link");
            mapTilerStylesheet.rel = "stylesheet";
            mapTilerStylesheet.href = "https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.css";
            document.head.appendChild(mapTilerStylesheet);

          const mapTilerScript = document.createElement("script");
            mapTilerScript.src = "https://cdn.maptiler.com/maplibre-gl-js/v2.4.0/maplibre-gl.js";
            document.head.appendChild(mapTilerScript);
  }

  waitForMapToBeReady(lat, lon, retriesLeft = 10) {
    if (window.maplibregl) {
      this.initializeMap(lat, lon);
    } else if (retriesLeft > 0) {
      setTimeout(() => {
        this.waitForMapToBeReady(lat, lon, retriesLeft - 1);
      }, 500);
    } else {
      this.showMapError("Map cant be loaded.");
    }
  }

  addStoryDetail(story) {
    const detailContainer = document.querySelector(".detail-container");
    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="form-control-page">
          <label class="form-label">Name</label>
          <div class="input-container">
            <div class="detail-value">${story.name || "Unnamed Story"}</div>
          </div>
        </div>

        <div class="form-control-page">
          <label class="form-label">Image Evidence</label>
          <div class="image-slider-container">
            <img src="${story.photoUrl}" class="story-image" alt="${story.description || "Uknown"}"/>
          </div>
        </div>

        <div class="form-control-page">
          <label class="form-label">Description</label>
          <div class="input-container">
            <div class="detail-value">${story.description || "The Story Uknown"}</div>
          </div>
        </div>

        <div class="form-control-page">
          <label class="form-label">Location Coordinates</label>
          <div class="location-coords">
            <input type="text" placeholder="latitude" class="coord-input" value="${story.lat || ""}" readonly>
            <input type="text" placeholder="longitude" class="coord-input" value="${story.lon || ""}" readonly>
          </div>
        </div>

        <div class="form-control-page">
          <label class="form-label">Map Location</label>
          <div class="location-map-container">
            <div class="location-map" id="storyMap"></div>
          </div>
        </div>
      `;
    }
  }

  initializeMap(lat, lon) {
    try {
      if (!window.maplibregl) {
        console.error("MapLibre is not loaded");
        this.showMapError("Map is not available.");
        return;
      }

      const apiKey = CONFIG.MAP_SERVICE_API_KEY;
      const map = new maplibregl.Map({
        container: "storyMap",
        style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
        center: [lon, lat],
        zoom: 12,
      });

      map.addControl(new maplibregl.NavigationControl());

      new maplibregl.Marker()
        .setLngLat([lon, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: "Poppins", sans-serif; padding: 5px;">
              <h4 style="margin: 0 0 5px 0;">Location</h4>
              <p style="margin: 0;">Lat: ${lat.toFixed(6)}</p>
              <p style="margin: 0;">Lon: ${lon.toFixed(6)}</p>
            </div>
          `)
        )
        .addTo(map);

      map.on("error", (e) => {
        console.error("Map error:", e);
        this.showMapError("Invalid Latitude or Longitude...");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      this.showMapError("Invalid Latitude or Longitude...");
    }
  }
}