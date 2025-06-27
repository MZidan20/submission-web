import App from './pages/app.js';
import '../styles/styles.css';
import { registerServiceWorker } from './utils/sw-register'; 



document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();
  await registerServiceWorker(); 

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
