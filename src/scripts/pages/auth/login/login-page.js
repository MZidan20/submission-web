import LoginPresenter from './login-presenter';
import * as StoryAPI from '../../../data/api';
import * as AuthModel from '../../../utils/auth';

export default class LoginPage {
  #presenter = null;
  #formElements = {
    form: null,
    email: null,
    password: null,
    errorMessage: null,
    submitButton: null,
  };

  async render() {
    return `
     <section class="story-container">
      <div class="auth-form-container">
        <form id="login-form" class="story-form">
          <div class="form-control">
            <label for="email-input" class="form-label">Email</label>
            <input id="email-input" name="email" type="email" placeholder="Example: nama@email.com" required>
          </div>

          <div class="form-control">
            <label for="password-input" class="form-label">Password</label>
            <input id="password-input" name="password" type="password" placeholder="Enter password" required>
          </div>

          <button id="submit-button" type="submit" class="btn">Login</button>

          <div class="auth-footer">
            <span>Don't have an account yet? </span>
            <a href="#/register" class="auth-link">Register Here</a>
          </div>
        </form>
        <div id="error-message" class="error-message" style="display: none;"></div>
  </div>
</section>

    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#cacheFormElements();
    this.#setupForm();
  }

  #cacheFormElements() {
    this.#formElements = {
      form: document.getElementById('login-form'),
      email: document.getElementById('email-input'),
      password: document.getElementById('password-input'),
      errorMessage: document.getElementById('error-message'),
      submitButton: document.getElementById('submit-button'),
    };
  }

  #setupForm() {
    this.#formElements.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.#presenter.getLogin(this.getFormData());
    });
  }

  getFormData() {
    return {
      email: this.#formElements.email.value,
      password: this.#formElements.password.value,
    };
  }

  loginSuccessfully(message, data) {
    console.log("Login success:", message, data);
    this.navigateTo('/');
  }

  loginFailed(message) {
    this.#formElements.errorMessage.textContent = message;
    this.#formElements.errorMessage.style.display = 'block';
  }

  showSubmitLoadingButton() {
    this.#formElements.submitButton.disabled = true;
    this.#formElements.submitButton.textContent = 'Load....';
  }

  hideSubmitLoadingButton() {
    this.#formElements.submitButton.disabled = false;
    this.#formElements.submitButton.textContent = 'Login';
  }

  navigateTo(path) {
    window.location.hash = path;
  }
}
