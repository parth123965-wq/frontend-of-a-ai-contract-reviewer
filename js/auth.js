/* ==========================================
   AI Contract Reviewer - Authentication Handler
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }
});

/* Toast Notification Utility */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span> <div>${message}</div>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* Password Toggle Handler */
function initPasswordToggles() {
  const togglePassBtn = document.getElementById("togglePassword");
  if (togglePassBtn) {
    togglePassBtn.addEventListener("click", () => {
      const input = document.getElementById("password");
      if (input) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        togglePassBtn.textContent = type === "password" ? "👁️" : "🙈";
      }
    });
  }

  const toggleRegPassBtn = document.getElementById("toggleRegPassword");
  if (toggleRegPassBtn) {
    toggleRegPassBtn.addEventListener("click", () => {
      const input = document.getElementById("register-password");
      if (input) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        toggleRegPassBtn.textContent = type === "password" ? "👁️" : "🙈";
      }
    });
  }
}

/* Input Validations */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Login Submit Handler */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("loginButton");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!email || !password) {
    showToast("Please enter both email and password.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing In...";
    }

    await login(email, password);
    showToast("Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (error) {
    showToast(error.message || "Failed to sign in. Please try again.", "error");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  }
}

/* Register Submit Handler */
async function handleRegisterSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const submitBtn = document.getElementById("registerButton");

  const username = usernameInput ? usernameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

  if (!username || !email || !password || !confirmPassword) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  if (password.length < 8) {
    showToast("Password must be at least 8 characters long.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match.", "error");
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";
    }

    await register(email, password, username);
    showToast("Account created successfully! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (error) {
    showToast(error.message || "Registration failed. Please try again.", "error");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  }
}
