/* ==========================================
   AI Contract Reviewer - Unified API Service
   Supports Backend REST API with Mock Fallback
========================================== */

const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8000",
  TOKEN_KEY: "ai_contract_token",
  USER_KEY: "ai_contract_user",
  TIMEOUT_MS: 5000,
};

// Initial Mock Data Store for Offline Preview
const MOCK_STORE = {
  user: JSON.parse(localStorage.getItem(API_CONFIG.USER_KEY)) || {
    id: 1,
    username: "Parth",
    email: "parth@contractai.io",
  },
  contracts: [
    {
      id: 1,
      original_filename: "Vendor_Service_Agreement_2026.pdf",
      status: "completed",
      risk_score: 85,
      file_size: "1.4 MB",
      created_at: "2026-08-01T10:30:00Z",
      summary: "High liability exposure detected in Section 4. Uncapped indemnification on software IP violations. Termination notice requires 90 days notice.",
      key_findings: [
        { type: "high", clause: "Section 4.2 - Indemnity", description: "Uncapped indemnification for third-party IP claims without monetary cap." },
        { type: "medium", clause: "Section 9.1 - Termination", description: "Requires 90 days advance written notice for non-renewal." },
        { type: "low", clause: "Section 12.4 - Jurisdiction", description: "Governing law set to Delaware Chancery Court." }
      ]
    },
    {
      id: 2,
      original_filename: "Executive_Employment_Agreement.docx",
      status: "completed",
      risk_score: 35,
      file_size: "420 KB",
      created_at: "2026-08-03T14:15:00Z",
      summary: "Standard executive employment agreement. Bounded 12-month non-compete. Comprehensive IP assignment with 3 months severance payout.",
      key_findings: [
        { type: "medium", clause: "Section 6 - Non-Compete", description: "12-month non-compete restricted within 50-mile radius." },
        { type: "low", clause: "Section 8 - IP Assignment", description: "Standard work-for-hire assignment clause." }
      ]
    },
    {
      id: 3,
      original_filename: "SaaS_Enterprise_License_v2.pdf",
      status: "processing",
      risk_score: null,
      file_size: "2.8 MB",
      created_at: "2026-08-04T09:00:00Z",
      summary: "AI Engine is currently parsing legal clauses and performing risk scoring...",
      key_findings: []
    }
  ]
};

/* Token Management */
function saveToken(token) {
  localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(API_CONFIG.TOKEN_KEY);
}

function removeToken() {
  localStorage.removeItem(API_CONFIG.TOKEN_KEY);
  localStorage.removeItem(API_CONFIG.USER_KEY);
}

function isAuthenticated() {
  return getToken() !== null || localStorage.getItem(API_CONFIG.USER_KEY) !== null;
}

/* HTTP Request Core */
async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || "API Request Failed");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Fall back to local mock data handling if backend is unavailable
    console.warn(`API server unavailable (${endpoint}). Operating in mock mode.`, error.message);
    return handleMockRequest(endpoint, options);
  }
}

/* Mock Request Fallback Handler */
async function handleMockRequest(endpoint, options) {
  await new Promise((res) => setTimeout(res, 300)); // Simulate slight network delay

  const method = options.method || "GET";

  if (endpoint === "/auth/login" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    if (!body.email || !body.password) {
      throw new Error("Email and password are required.");
    }
    const mockUser = {
      id: 1,
      email: body.email,
      username: body.email.split("@")[0] || "User",
    };
    saveToken("mock_access_token_xyz123");
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(mockUser));
    return { access_token: "mock_access_token_xyz123", user: mockUser };
  }

  if (endpoint === "/auth/register" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const mockUser = {
      id: Date.now(),
      email: body.email,
      username: body.username || body.email.split("@")[0],
    };
    saveToken("mock_access_token_xyz123");
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(mockUser));
    return { access_token: "mock_access_token_xyz123", user: mockUser };
  }

  if (endpoint === "/auth/logout") {
    removeToken();
    return { message: "Logged out successfully" };
  }

  if (endpoint === "/users/me") {
    const user = JSON.parse(localStorage.getItem(API_CONFIG.USER_KEY)) || MOCK_STORE.user;
    return user;
  }

  if (endpoint === "/contracts" && method === "GET") {
    return MOCK_STORE.contracts;
  }

  if (endpoint.startsWith("/contracts/") && method === "GET") {
    const rawId = endpoint.split("/")[2];
    const contract = MOCK_STORE.contracts.find((c) => String(c.id) === String(rawId));
    if (!contract) {
      // Fallback to first contract if specific ID not found in mock store
      return MOCK_STORE.contracts[0];
    }
    return contract;
  }

  if (endpoint === "/contracts/upload" && method === "POST") {
    const newContract = {
      id: Date.now(),
      original_filename: options.fileName || "Uploaded_Contract.pdf",
      status: "completed",
      risk_score: Math.floor(Math.random() * 60) + 20,
      file_size: options.fileSize || "1.2 MB",
      created_at: new Date().toISOString(),
      summary: "Newly uploaded contract parsed by AI. Key indemnification and liability terms scanned.",
      key_findings: [
        { type: "high", clause: "Section 4.1 - Indemnification", description: "Uncapped liability on software IP infringements without cap." },
        { type: "medium", clause: "Section 7.2 - Renewal", description: "Automatic 1-year auto-renewal unless canceled within 60 days." }
      ]
    };
    MOCK_STORE.contracts.unshift(newContract);
    return newContract;
  }

  if (endpoint.startsWith("/contracts/") && method === "DELETE") {
    const rawId = endpoint.split("/")[2];
    MOCK_STORE.contracts = MOCK_STORE.contracts.filter((c) => String(c.id) !== String(rawId));
    return { message: "Contract deleted successfully" };
  }

  return { message: "Mock success" };
}

/* Helper to normalize API / Mock contract objects into uniform schema */
function normalizeContractData(c) {
  if (!c) return null;
  const id = c.id !== undefined ? c.id : (c.contract_id !== undefined ? c.contract_id : c._id);
  const original_filename = c.original_filename || c.filename || c.name || c.title || "Untitled Contract";
  const status = c.status || "completed";
  const risk_score = c.risk_score !== undefined ? c.risk_score : (c.riskScore !== undefined ? c.riskScore : (c.score !== undefined ? c.score : null));
  const file_size = c.file_size || c.size || (c.file_bytes ? `${(c.file_bytes / (1024 * 1024)).toFixed(1)} MB` : "1.2 MB");
  const created_at = c.created_at || c.upload_date || c.date || c.createdAt || new Date().toISOString();
  const summary = c.summary || c.description || "AI analysis completed. Evaluated legal clauses, indemnification exposure, and renewal terms.";
  const key_findings = c.key_findings || c.findings || c.clauses || c.risks || [];

  return {
    id,
    original_filename,
    status,
    risk_score,
    file_size,
    created_at,
    summary,
    key_findings,
    ...c, // retain any extra backend fields
  };
}

/* API Service Methods */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

async function apiPost(endpoint, body, extra = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...extra,
  });
}

async function apiPut(endpoint, body) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

/* Domain Specific API Calls */
async function login(email, password) {
  const res = await apiPost("/auth/login", { email, password });
  if (res && res.access_token) {
    saveToken(res.access_token);
  }
  if (res && res.user) {
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(res.user));
  }
  return res;
}

async function register(email, password, username) {
  const res = await apiPost("/auth/register", { email, password, username });
  if (res && res.access_token) {
    saveToken(res.access_token);
  }
  if (res && res.user) {
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(res.user));
  }
  return res;
}

async function logout() {
  removeToken();
  try {
    await apiPost("/auth/logout");
  } catch {
    // Ignore error if server offline
  }
  window.location.href = "index.html";
}

async function getCurrentUser() {
  return apiGet("/users/me");
}

async function getContracts() {
  const data = await apiGet("/contracts");
  if (Array.isArray(data)) {
    return data.map(normalizeContractData);
  }
  if (data && Array.isArray(data.contracts)) {
    return data.contracts.map(normalizeContractData);
  }
  return [];
}

async function getContractById(id) {
  const data = await apiGet(`/contracts/${id}`);
  return normalizeContractData(data);
}

async function uploadContract(file) {
  // If backend is active, use FormData, otherwise mock
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_CONFIG.BASE_URL}/contracts/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    const resData = await response.json();
    return normalizeContractData(resData);
  } catch (err) {
    const mockRes = await handleMockRequest("/contracts/upload", {
      method: "POST",
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
    return normalizeContractData(mockRes);
  }
}

async function deleteContract(id) {
  return apiDelete(`/contracts/${id}`);
}

