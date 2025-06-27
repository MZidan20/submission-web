export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();

    try {
      const response = await this.#model.getLogin({ email, password });

      if (response.error) {
        const errorMessage = response.data?.message || 'Failed Login. Please try again.';
        this.#view.loginFailed(errorMessage);
        return;
      }

      const accessToken = response.data?.loginResult?.token;
      const successMessage = response.data?.message || 'Login Success';

      if (!accessToken || typeof accessToken !== 'string') {
        this.#view.loginFailed('Login token not found or invalid. Please try again..');
        return;
      }

      this.#authModel.putAccessToken(accessToken);
      this.#view.loginSuccessfully(successMessage, response.data);
    } catch (error) {
      this.#view.loginFailed(error?.message || 'Failed Login. Please try again.');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
