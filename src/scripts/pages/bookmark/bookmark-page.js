import BookmarkPresenter from './bookmark-presenter';
import BookmarkStore from '../../data/indexdb';


export default class BookmarkPage {
  #presenter = null;

  async render() {
    return `
      <section class="home-container">
        <h1 class="story-title">Bookmarked Stories</h1>
        <div id="gallery" class="gallery">
          </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,          
      model: BookmarkStore, 
    });

    await this.#presenter.initialGallery();
  }

  populateBookmarkGallery(stories) {
    const gallery = document.getElementById('gallery');
    
    if (!stories || stories.length === 0) {
      gallery.innerHTML = '<div class="empty-gallery">You have no bookmarked stories.</div>';
      return;
    }

 
    const photosHtml = stories.map((story) => {
        const truncatedDesc = story.description.length > 100 ? `${story.description.substring(0, 100)}...` : story.description;
        const formattedDate = new Date(story.createdAt).toLocaleDateString('id-ID');
        return `
          <div class="photo-item">
            <a href="#/detail-page/${story.id}" class="photo-container">
              <img src="${story.photoUrl}" alt="${story.name}" />
            </a>
            <div class="photo-info">
              <h3 class="photo-name">${story.name}</h3>
              <p class="photo-description">${truncatedDesc}</p>
              <div class="photo-date">${formattedDate}</div>
            </div>
          </div>
        `;
      }).join('');
      
    gallery.innerHTML = photosHtml;
  }

  showLoading() {
    document.getElementById('gallery').innerHTML = '<div class="loading-indicator">Loading stories...</div>';
  }

  hideLoading() {
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  populateGalleryError(message) {
    document.getElementById('gallery').innerHTML = `<div class="error-message">${message}</div>`;
  }
}