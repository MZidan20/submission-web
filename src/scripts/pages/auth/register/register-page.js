import RegisterPresenter from "../register/register-presenter";
import *  as StoryAPI from "../../../data/api";

export default class RegisterPage {
    #presenter = null;

    async render (){
        return `
        <section class="register-container">
            <div class="register-form-container">
                <h1 class="register__title">Create Account</h1>

                <form id="register-form" class="register-form">
                    <div class="form-control">
                        <label for="name-input" class="register-form__name-title">Name</label>

                        <div class="register-form__title-container">
                            <input id="name-input" type="text" name="name" placeholder="Enter Name">
                        </div>
                    </div>
                    <div class="form-control">
                        <label for="email-input" class="register-form__email-title">Email</label>

                        <div class="register-form__title-container">
                            <input id="email-input" type="email" name="email" placeholder="Example: nama@email.com">
                        </div>
                    </div>
                    <div class="form-control">
                        <label for="password-input" class="register-form__password-title">Password</label>
                        <div class="register-form__title-container">
                            <input id="password-input" type="password" name="password" placeholder="Enter New Password">
                        </div>
                    </div>
                    <div class="form-buttons register-form__form-buttons">
                        <div id="submit-button-container">
                            <button id="submit-button" class="btn" type="submit">Register Account</button>
                        </div>
                    </div>
                    <div class="auth-footer">
                        <span>Already have an account? </span>
                        <a href="#/login" class="auth-link">Login here</a>
                    </div>
                    <div id="error-message" class="error-message" style="display: none;"></div>
                </form>
            </div>
        </section>
        `;
    }

    async afterRender() {
        this.#presenter = new RegisterPresenter({
            view: this, 
            model: StoryAPI,
    });

        this.#setupForm();
    }

    #setupForm() {
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('name-input').value,
                email: document.getElementById('email-input').value,
                password: document.getElementById('password-input').value,
            };
            
            await this.#presenter.getRegistered(data);
        });
    }


    registeredSuccessfully(message, data) {
        console.log('registeredSuccessfully: data:', data);
        alert(message);
        location.hash = '/login';
    }

    registeredFailed(message) {
        alert(message);
    }

    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="fas fa-spinner loader-button"></i> Register Account </button>
        `;
    }

    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Register Account</button>
        `;
    }

}