import HomePresenter from '../home/home-presenter.js';
import { getStories } from '../../data/api.js';

export default class HomePage {
  #presenter = null;

  constructor() {
    this.#presenter = new HomePresenter({
      view: this,
      model: { getStories },
    });
  }

  async render() {
    return `
      <section class="home-container">
        <div class="header-home">
          <p class="instruction-text-home">Click Post To Explore More</p>
          <a href="#/addStory-page" class="upload-btn">Add Story</a>
        </div>
        <h1 class="story-title">StoryVerse Stories</h1>

        <div id="gallery" class="gallery">
          <div class="loading-indicator">Load story...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.#presenter.initialGallery();
    this.setupPhotoClickHandlers();
  }

  setupPhotoClickHandlers() {
    const gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.addEventListener("click", (e) => {
        const photoLink = e.target.closest(".photo-container");
        if (!photoLink) return;

        e.preventDefault();

        const href = photoLink.getAttribute("href");

        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = href;
          });
        } else {
          window.location.hash = href;
        }
      });
    }
  }

  showLoading() {
    const gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.innerHTML =
        '<div class="loading-indicator">Load story...</div>';
    }
  }

  hideLoading() {
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  populateGallery(stories) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    if (!stories || stories.length === 0) {
      gallery.innerHTML =
        '<div class="empty-gallery">No story Ready</div>';
      return;
    }

    const photosHtml = stories
      .map((story, i) => {
        const truncatedDesc =
          story.description.length > 100
            ? story.description.substring(0, 100) + "..."
            : story.description;

        const createdDate = new Date(story.createdAt);
        const formattedDate = createdDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return `
          <div class="photo-item">
            <a href="#/detail-page/${story.id}" class="photo-container">
              <img src="${story.photoUrl}" alt="story-photo-${i + 1}" />
            </a>
            <div class="photo-info">
              <h3 class="photo-name">${story.name}</h3>
              <p class="photo-description">${truncatedDesc}</p>
              <div class="photo-date">${formattedDate}</div>
            </div>
          </div>
        `;
      })
      .join("");

    gallery.innerHTML = photosHtml;
  }

  populateGalleryError(errorMessage) {
    const gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.innerHTML = `
        <div class="error-container">
          <p class="error-message">${
            errorMessage || "Failed to load story. Please try again later."
          }</p>
          <button id="retry-button" class="retry-button">Try Again </button>
        </div>
      `;

      const retryButton = document.getElementById("retry-button");
      if (retryButton) {
        retryButton.addEventListener("click", () => {
          this.#presenter.initialGallery();
        });
      }
    }
  }

  populateFallbackGallery() {
    const gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.innerHTML = `
        <div class="photo-item">
          <a href="#/details_photo" class="photo-container">
            <img src="hhttps://picsum.photos/seed/storyverse/200/300 alt="story-photo" />
          </a>
          <div class="photo-info">
            <h3 class="photo-name">Unknown</h3>
            <p class="photo-description">Unknown description.</p>
            <div class="photo-date">Unknown date</div>
          </div>
        </div>
      `;
    }
  }
}
