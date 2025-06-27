import CONFIG from "../config";

export function getAccessToken() {
  try {
    if (!CONFIG.ACCESS_TOKEN_KEY || typeof CONFIG.ACCESS_TOKEN_KEY !== "string") {
      console.error("getAccessToken: CONFIG.ACCESS_TOKEN_KEY tidak valid");
      return null;
    }

    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

    if (!accessToken || accessToken.trim() === "") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error while retrieving token", error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    if (!CONFIG.ACCESS_TOKEN_KEY || typeof CONFIG.ACCESS_TOKEN_KEY !== "string") {
      console.error("putAccessToken: CONFIG.ACCESS_TOKEN_KEY Invalid");
      return false;
    }
    if (!token || typeof token !== "string") {
      console.error("putAccessToken: token Invalid");
      return false;
    }

    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error while storing token", error);
    return false;
  }
}


export function removeAccessToken() {
  try {
    if (!CONFIG.ACCESS_TOKEN_KEY || typeof CONFIG.ACCESS_TOKEN_KEY !== "string") {
      console.error("removeAccessToken: CONFIG.ACCESS_TOKEN_KEY Invalid");
      return;
    }
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("removeAccessToken: error while removing token", error);
  }
}


export function isAuthenticated() {
  return !!getAccessToken();
}


export function checkAuth() {
  try {
    if (!isAuthenticated()) {
      window.location.hash = "#/login";
      return false;
    }
    return true;
  } catch (error) {
    console.error("checkAuth:error while checking authentication", error);
    return false;
  }
}

export function checkUnauth() {
  try {
    if (isAuthenticated()) {
      window.location.hash = "#/";
      return false;
    }
    return true;
  } catch (error) {
    console.error("checkUnauth:error while checking authentication", error);
    return false;
  }
}
