/* ==========================================
   AI Contract Reviewer
   API Service
========================================== */

const API = {
  BASE_URL: "http://127.0.0.1:8000",

  TOKEN_KEY: "access_token",
};

/* ==========================================
   Token Management
========================================== */

function saveToken(token) {
  localStorage.setItem(API.TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(API.TOKEN_KEY);
}

function removeToken() {
  localStorage.removeItem(API.TOKEN_KEY);
}

function isAuthenticated() {
  return getToken() !== null;
}

/* ==========================================
   Headers
========================================== */

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/* ==========================================
   Request
========================================== */

async function request(endpoint, options = {}) {
  const response = await fetch(`${API.BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || "Request failed.");
  }

  return data;
}

/* ==========================================
   GET
========================================== */

async function apiGet(endpoint) {
  return await request(endpoint, {
    method: "GET",
  });
}

/* ==========================================
   POST
========================================== */

async function apiPost(endpoint, body) {
  return await request(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ==========================================
   PUT
========================================== */

async function apiPut(endpoint, body) {
  return await request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/* ==========================================
   DELETE
========================================== */

async function apiDelete(endpoint) {
  return await request(endpoint, {
    method: "DELETE",
  });
}

/* ==========================================
   Logout
========================================== */

function logout() {
  removeToken();

  window.location.href = "index.html";
}

/*
=========================================================
 API.JS

 HTTP Communication Layer

 Responsibilities:
 - Centralize API requests
 - Manage backend URL
 - Send cookies
 - Handle responses
 - Handle API errors

 Authentication:
 - Uses HttpOnly Cookie
 - Cookie name:
      ai_contract_session

 JWT:
 - Never accessed by JavaScript

=========================================================
*/

// =======================================================
// SECTION 1: API CONFIGURATION
// =======================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// =======================================================
// SECTION 2: COMMON REQUEST FUNCTION
// =======================================================

async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...options.headers,
    },

    /*
        Important for HttpOnly cookies

        Browser will:
        - send existing cookie
        - accept new cookie

        */

    credentials: "include",
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: createTimeoutSignal(),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw new Error("Unable to connect to the server.");
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "API request failed");
  }

  return data;
}

// =======================================================
// SECTION 3: HTTP METHODS
// =======================================================

async function apiGet(endpoint) {
  return apiRequest(endpoint, {
    method: "GET",
  });
}

async function apiPost(endpoint, body) {
  return apiRequest(
    endpoint,

    {
      method: "POST",

      body: JSON.stringify(body),
    },
  );
}

async function apiPut(endpoint, body) {
  return apiRequest(
    endpoint,

    {
      method: "PUT",

      body: JSON.stringify(body),
    },
  );
}

async function apiDelete(endpoint) {
  return apiRequest(
    endpoint,

    {
      method: "DELETE",
    },
  );
}
// =======================================================
// SECTION 4: REQUEST TIMEOUT
// =======================================================

const REQUEST_TIMEOUT = 10000;

function createTimeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT);
}

// =======================================================
// SECTION 5: AUTHENTICATION HELPERS
// =======================================================

async function getCurrentUser() {
  return await apiGet("/users/me");
}
async function getContracts() {
  return await apiGet("/contracts");
}
// =======================================================
// SECTION 6: LOGOUT
// =======================================================

async function logout() {
  return await apiPost("/auth/logout");
}
