import CONFIG from '../config';
import { getAccessToken, putAccessToken } from '../utils/auth';


const ENDPOINTS = {
  // Auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Stories
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  SUBSCRIBE: `${CONFIG.PUSH_NOTIFICATION_BASE_URL}/subscribe`,
};


export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return { 
        error: true, data: responseJson 
      };
    }

    return { error: false, data: responseJson };
  } catch (error) {
    return { 
      error: true, data: { 
        message: "Network error" 
      } 
    };
  }
}


export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return { 
        error: true, data: responseJson 
      };
    }
    const token = responseJson.loginResult?.token;
    if (token) {
      putAccessToken(token);
    }

    return { 
      error: false, data: responseJson 
    };
  } catch (error) {
    return { 
      error: true, data: { 
        message: "Network error" 
      } 
    };
  }
}


export async function getStories({ page = 1, size = 10, location = 0 } = {}) {
  const accessToken = getAccessToken();
  if (!accessToken || accessToken === "null" || accessToken === "undefined") {
    return {
      error: true,
      data: { message: "Unauthorized: No valid access token" },
    };
  }

  try {
    const params = new URLSearchParams({
      page,
      size,
      location,
    });

    const response = await fetch(`${ENDPOINTS.STORIES}?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = await response.json();
    console.log('getStories response:', response.status, responseJson);
    console.log('Access Token:', getAccessToken());


    if (!response.ok) {
      return {
        error: true,
        data: responseJson,
      };
    }

    return { error: false, data: responseJson };
  } catch (error) {
    return {
      error: true,
      data: { message: "Network error" },
    };
  }
}


export async function getStoryDetail(id) {
  try {
    const token = getAccessToken();
    if (!token) {
      return {
        error: true,
        data: { message: "No authentication token found" },
      };
    }

    const response = await fetch(ENDPOINTS.STORIES_DETAIL(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return { error: true, data: responseJson };
    }

    return { error: false, data: responseJson };
  } catch (error) {
    return { error: true, data: { message: "Network error" } };
  }   
}

export async function NewStory ({ description, photo, lat, lon }) {
  try {
    const accessToken = getAccessToken();
    const formData = new FormData();

    formData.append("description", description);
    formData.append("photo", photo);

    if (lat !== undefined && lat !== null) {
      formData.append("lat", lat);
    }
    if (lon !== undefined && lon !== null) {
      formData.append("lon", lon);
    }

    const response = await fetch(ENDPOINTS.STORIES, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const responseJson = await response.json(); 

    if (!response.ok) {
      return { error: true, data: responseJson };
    }
    return { error: false, data: responseJson };
  } catch (error) {
    return { error: true, data: { message: "Network error" } }; 
    }
}


export async function subscribePushNotification(subscription) {
  const accessToken = getAccessToken();
  
  // Ambil hanya properti yang diperlukan dari objek subscription
  const requestBody = {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };

  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseJson = await response.json();

  if (response.status !== 201 && response.status !== 200) {
    console.error('Gagal subscribe:', responseJson.message);
    return { error: true, data: responseJson };
  }

  return { error: false, data: responseJson };
}

export async function unsubscribePushNotification(endpoint) {
  const accessToken = getAccessToken();
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ endpoint }),
  });
  return response.json();
}