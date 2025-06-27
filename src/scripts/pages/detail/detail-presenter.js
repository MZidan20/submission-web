import BookmarkStore from '../../data/indexdb'; 

export default class DetailPresenter{
    #view;
    #model;
    #storyId ;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async init(storyId) {
        this.#storyId = storyId;
        this.#view.loadMapScripts();
        await this.#loadStoryDetail();
        await this.#renderBookmarkButton(); 
    }

  async #renderBookmarkButton() {
    const isBookmarked = await this.#isStoryBookmarked(this.#storyId);
    this.#view.showBookmarkButton(isBookmarked);
  }

  async #isStoryBookmarked(id) {
    const story = await BookmarkStore.getStory(id);
    return !!story;
  }

  async handleBookmarkClick() {
    const isBookmarked = await this.#isStoryBookmarked(this.#storyId);
    const storyDetail = await this.#model.getStoryDetail(this.#storyId);

    if (isBookmarked) {
      await BookmarkStore.deleteStory(this.#storyId);
      console.log('Story dihapus dari bookmark');
    } else {
      await BookmarkStore.putStory(storyDetail.data.story);
      console.log('Story disimpan ke bookmark');
    }

    await this.#renderBookmarkButton(); 
  }

    async #loadStoryDetail() {
       if(!this.#storyId){
        this.#view.showError('Story not found');
        return;
       }

       try{
        const detailResponse = await this.#model.getStoryDetail(this.#storyId);
        
        if (detailResponse.error || !detailResponse.data.story) {
        this.#view.showError(
          detailResponse.data.message || "Failed to load story detail"
        );
        return;
      }

      const story = detailResponse.data.story;
      this.#view.addStoryDetail(story);

      if (story.lat && story.lon) {
        this.#view.waitForMapToBeReady(parseFloat(story.lat), parseFloat(story.lon));
      }
    } catch (error) {
      this.#view.showError("An unexpected error occurred");
      console.error("Error loading story detail:", error);
    }
}
}