const darkToggle = document.querySelector(".toggle-icon");
if (darkToggle) {
  const isDark = localStorage.getItem("theme") === "dark";
  document.body.setAttribute("data-bs-theme", isDark ? "dark" : "light");
  darkToggle.classList.toggle("on", isDark);
  darkToggle.classList.toggle("off", !isDark);
  darkToggle.classList.toggle("fa-toggle-on", isDark);
  darkToggle.classList.toggle("fa-toggle-off", !isDark);

  darkToggle.onclick = function () {
    const isDark = document.body.getAttribute("data-bs-theme") === "dark";
    document.body.setAttribute("data-bs-theme", isDark ? "light" : "dark");
    darkToggle.classList.toggle("on", !isDark);
    darkToggle.classList.toggle("off", isDark);
    darkToggle.classList.toggle("fa-toggle-on", !isDark);
    darkToggle.classList.toggle("fa-toggle-off", isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };
}

// Toggle between login and signup forms
function toggleForm() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

// Add active class to forms on page load
window.onload = function () {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("signupForm").classList.add("active");
};

// Toggle password visibility
document.addEventListener("click", function (event) {
  if (event.target.closest(".toggle-password")) {
    const toggleButton = event.target.closest(".toggle-password");
    const targetId = toggleButton.getAttribute("data-target");
    const passwordField = document.getElementById(targetId);
    const icon = toggleButton.querySelector("i");

    passwordField.type =
      passwordField.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  }
});

// Display modal with a message
function showModal(message) {
  const modalBody = document.getElementById("alertModalBody");
  if (modalBody) {
    modalBody.textContent = message;
    const alertModal = new bootstrap.Modal(
      document.getElementById("alertModal")
    );
    alertModal.show();
  } else {
    console.error("Modal body element not found.");
  }
}

// Show loading spinner
function showLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "flex";
    setTimeout(() => (loadingSpinner.style.display = "none"), 3000);
  }
}

// Login form submission
function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    showModal("Please fill in all the fields.");
    return;
  }

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        showModal("Login successful!");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        showModal(data.error || "Login failed. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      showModal("Unable to connect to the server.");
    });
}

// Form submission handling
document.getElementById("loginForm").onsubmit = (event) => {
  event.preventDefault();
  handleLogin();
};
