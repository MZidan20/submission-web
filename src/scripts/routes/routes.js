import HomePage from '../pages/home/home-page.js';
import LoginPage from '../pages/auth/login/login-page.js';
import RegisterPage from '../pages/auth/register/register-page.js';
import addStoryPage from '../pages/addStory/addStory-page.js';
import detailPage from '../pages/detail/detail-page.js';
import { checkAuth, checkUnauth } from '../utils/auth.js';
import BookmarkPage from '../pages/bookmark/bookmark-page.js';

const createProtectedRoute = (PageClass) => {
  return {
    page: new PageClass(),
    check: checkAuth,
  };
};

const createUnauthenticatedRoute = (PageClass) => {
  return {
    page: new PageClass(),
    check: checkUnauth,
  };
};

const routes = {
  '/': createProtectedRoute(HomePage),
  '/login': createUnauthenticatedRoute(LoginPage),
  '/register': createUnauthenticatedRoute(RegisterPage),
  '/addStory-page': createProtectedRoute(addStoryPage),
  '/detail-page/:id': createProtectedRoute(detailPage),
  '/bookmark': createProtectedRoute(BookmarkPage),
  
  
};

export default routes;