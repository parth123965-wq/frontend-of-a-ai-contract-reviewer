console.log("auth.js loaded");
/*
==================================================

AI Contract Reviewer

File:
auth.js

Responsibility:
Authentication Logic

Author:
OpenAI + Parth

==================================================
*/

/*
==================================================
CONFIGURATION
==================================================
*/

const DASHBOARD_PAGE = "dashboard.html";
const LOGIN_PAGE = "index.html";
const REGISTER_PAGE = "register.html";

const BUTTON_DEFAULT_TEXT = {
  login: "Login",
  register: "Register",
};

/*
==================================================
DOM ELEMENTS
==================================================
*/

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

/*
==================================================
UTILITY FUNCTIONS
==================================================
*/

function getInputValue(id) {
  const element = document.getElementById(id);

  return element ? element.value.trim() : "";
}

function clearInput(id) {
  const element = document.getElementById(id);

  if (element) {
    element.value = "";
  }
}

function clearForm(form) {
  if (form) {
    form.reset();
  }
}

/*
==================================================
VALIDATION
==================================================
*/

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

/*
==================================================
BUTTON STATE
==================================================
*/

function setButtonLoading(button, loadingText) {
  if (!button) {
    return;
  }

  button.disabled = true;

  button.textContent = loadingText;
}

function resetButton(button, defaultText) {
  if (!button) {
    return;
  }

  button.disabled = false;

  button.textContent = defaultText;
}

/*
==================================================
TOAST MESSAGE
==================================================
*/

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;

  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/*
==================================================
REDIRECTION
==================================================
*/

function redirectToDashboard() {
  window.location.href = DASHBOARD_PAGE;
}

function redirectToLogin() {
  window.location.href = LOGIN_PAGE;
}

function redirectToRegister() {
  window.location.href = REGISTER_PAGE;
}

/*
=========================================================
 AUTH.JS

 Part 2: Login Authentication

 Responsibilities:
 - Connect login form
 - Send credentials to FastAPI
 - Handle HttpOnly cookie authentication
 - Handle success response
 - Handle errors

 Authentication:
 - Cookie: ai_contract_session

 JWT Handling:
 - Managed by browser
 - Not accessible from JavaScript

=========================================================
*/

// =======================================================
// SECTION 1: API CONFIGURATION
// =======================================================


// =======================================================
// SECTION 2: LOGIN API REQUEST
// =======================================================

async function loginUser(email, password) {
  return await apiPost(
    "/auth/login",

    {
      email,
      password,
    },
  );
}

// =======================================================
// SECTION 3: LOGIN SUCCESS HANDLER
// =======================================================

function handleLoginSuccess(data) {
  console.log("Login successful", data.user);

  /*
    JWT is NOT stored here.

    Browser already stored:

    ai_contract_session

    because it is HttpOnly.
    */

  window.location.href = "/dashboard.html";
}

// =======================================================
// SECTION 4: LOGIN ERROR HANDLER
// =======================================================

function handleLoginError(error) {
  console.error(error.message);

  showMessage(error.message, "error");
}

// =======================================================
// SECTION 5: LOGIN FORM SUBMISSION
// =======================================================

async function handleLoginSubmit(event) {
  event.preventDefault();

  console.log("Login submit triggered");

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const validation = validateLoginInput(email, password);

  if (!validation.valid) {
    handleLoginError(new Error(validation.message));

    return;
  }

  try {
    setLoginLoading(true);

    const data = await loginUser(email, password);

    handleLoginSuccess(data);
  } catch (error) {
    handleLoginError(error);
  } finally {
    setLoginLoading(false);
  }
}

// =======================================================
// SECTION 6: INITIALIZE LOGIN PAGE
// =======================================================

function initializeLogin() {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
}

// =======================================================
// SECTION 7: START APPLICATION
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const loginForm = document.getElementById("loginForm");

  console.log("Login form:", loginForm);

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);

    console.log("Submit listener attached");
  }
});
// =======================================================
// SECTION 8: BUTTON LOADING STATE
// =======================================================

function setLoginLoading(isLoading) {
  const button = document.getElementById("loginButton");

  if (!button) {
    return;
  }

  if (isLoading) {
    button.disabled = true;

    button.textContent = "Logging in...";
  } else {
    button.disabled = false;

    button.textContent = "Login";
  }
}
// =======================================================
// SECTION 9: LOGIN VALIDATION
// =======================================================

function validateLoginInput(email, password) {
  if (!email || !password) {
    return {
      valid: false,
      message: "Email and password are required",
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must contain at least 8 characters",
    };
  }

  return {
    valid: true,
  };
}
// =======================================================
// SECTION 10: MESSAGE HANDLER
// =======================================================

function showMessage(message, type = "error") {
  console.log(`${type}: ${message}`);

  alert(message);
}
