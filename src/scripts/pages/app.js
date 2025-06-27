// src/scripts/pages/app.js

import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { isAuthenticated, removeAccessToken } from '../utils/auth';
import { getPushSubscription, subscribe, unsubscribe } from '../utils/notification-helper';
import '../utils/accessibility.js';


class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this.content = content;
    this.drawerButton = drawerButton;
    this.navigationDrawer = navigationDrawer;
    this._currentPage = null;
    this._initAppShell();
  }

  async _initAppShell() {
    this._setupDrawer();
    this._setupNavigation();
    this._setupLogout();
    await this._setupNotificationButton();
  }

  _setupDrawer() {
    if (this.drawerButton) {
      this.drawerButton.addEventListener('click', (event) => {
        this.navigationDrawer.classList.toggle('open');
        event.stopPropagation();
      });
    }

    document.addEventListener('click', (event) => {
      if (
        this.navigationDrawer &&
        !this.navigationDrawer.contains(event.target) &&
        this.navigationDrawer.classList.contains('open')
      ) {
        this.navigationDrawer.classList.remove('open');
      }
    });
  }

  _setupNavigation() {
    this._updateNavigation();
    window.addEventListener('hashchange', () => {
      this._updateNavigation();
    });
  }

  _updateNavigation() {
    const logoutContainer = document.getElementById('logout-container');
    if (isAuthenticated()) {
      logoutContainer.style.display = 'block';
    } else {
      logoutContainer.style.display = 'none';
    }
  }

  _setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            this._handleLogout();
        });
    }
  }

  _handleLogout() {
    removeAccessToken();
    window.location.hash = '#/login';
    this._updateNavigation();
    this._setupNotificationButton();
  }

  async _setupNotificationButton() {
    const container = document.getElementById('notification-button-container');
    if (!container) return; 

  
    if (!isAuthenticated() || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        container.innerHTML = ''; 
        return;
    }

    try {
        const subscription = await getPushSubscription();
        if (subscription) {
            container.innerHTML = '<a href="#" id="unsubscribe-button">Unsubscribe</a>';
            document.getElementById('unsubscribe-button').addEventListener('click', async (e) => {
                e.preventDefault();
                await unsubscribe();
                await this._setupNotificationButton(); 
            });
        } else {
            container.innerHTML = '<a href="#" id="subscribe-button">Subscribe</a>';
            document.getElementById('subscribe-button').addEventListener('click', async (e) => {
                e.preventDefault();
                await subscribe();
                await this._setupNotificationButton();
            });
        }
    } catch(error) {
        console.error("Error setting up notification button:", error);
        container.innerHTML = ''; 
    }
  }

  // FIX 3: Memperbaiki logika renderPage
  async renderPage() {
    const activeRoute = getActiveRoute();
    const routeConfig = routes[activeRoute];

    if (!routeConfig) {
      this.content.innerHTML = `
        <section class="story-verse-container" style="text-align: center;">
          <h1>404 - Page Not Found</h1>
          <p>Sorry, the page you are looking for is not found.</p>
          <a href="#/" class="back-btn">Kembali ke Home</a>
        </section>
      `;
      return;
    }

    if (routeConfig.check && !routeConfig.check()) {
      return;
    }

    try {
      if (this._currentPage && typeof this._currentPage.destroy === 'function') {
        this._currentPage.destroy();
      }
      const page = routeConfig.page;
      this._currentPage = page;
      const urlParams = parseActivePathname();

      const renderContent = async () => {
        this.content.innerHTML = await page.render(urlParams);
        await page.afterRender(urlParams);
        this._updateNavigation();
        await this._setupNotificationButton();
      };
      if (document.startViewTransition) {
        document.startViewTransition(renderContent);
      } else {
        await renderContent();
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this.content.innerHTML = '<p>Error memuat halaman.</p>';
    }
  }
}

export default App;