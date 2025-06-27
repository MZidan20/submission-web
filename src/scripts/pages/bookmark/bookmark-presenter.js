import BookmarkStore from '../../data/indexdb.js'; // Import store

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGallery() {
    this.#view.showLoading();
    try {
      const stories = await this.#model.getAllStories();
      this.#view.populateBookmarkGallery(stories);
    } catch (error) {
      console.error(error);
      this.#view.populateGalleryError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}