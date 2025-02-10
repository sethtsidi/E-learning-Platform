// Dark Mode Toggle
const darkToggle = document.querySelector(".toggle-icon");

const toggleTheme = () => {
    const isDark = document.body.getAttribute("data-bs-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    document.body.setAttribute("data-bs-theme", newTheme);
    darkToggle.classList.toggle("on", !isDark);
    darkToggle.classList.toggle("off", isDark);
    darkToggle.classList.toggle("fa-toggle-on", !isDark);
    darkToggle.classList.toggle("fa-toggle-off", isDark);
    localStorage.setItem("theme", newTheme);
};

if (darkToggle) {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-bs-theme", savedTheme);
    darkToggle.addEventListener("click", toggleTheme);
}

// Toggle between login and signup forms
function toggleForm() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const isLoginVisible = loginForm.style.display !== "none";
    loginForm.style.display = isLoginVisible ? "none" : "block";
    signupForm.style.display = isLoginVisible ? "block" : "none";
}

// Add active class to forms on page load
window.addEventListener("load", () => {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("signupForm").classList.add("active");
});

// Toggle password visibility
document.addEventListener("click", (event) => {
    if (event.target.closest(".toggle-password")) {
        const toggleButton = event.target.closest(".toggle-password");
        const targetId = toggleButton.getAttribute("data-target");
        const passwordField = document.getElementById(targetId);
        const icon = toggleButton.querySelector("i");

        if (passwordField) {
            passwordField.type = passwordField.type === "password" ? "text" : "password";
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        }
    }
});

// Display modal with a message
function showModal(message) {
    const modalBody = document.getElementById("alertModalBody");
    if (modalBody) {
        modalBody.textContent = message;
        const alertModal = new bootstrap.Modal(document.getElementById("alertModal"));
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

async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
  
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
  
    if (!email || !password) {
      showModal("Please fill in all the fields.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.token) {
        // Save token and redirect
        localStorage.setItem("authToken", data.token);
        showModal("Login successful!");
        setTimeout(() => (window.location.href = "index.html"), 1500);
        console.log('JWT Token:', data.token); // Log the token to the console
      } else {
        showModal(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      showModal(error.message || "Unable to connect to the server.");
    }
  }
  
  // Attach the event listener to the login form
  document.getElementById("loginForm").onsubmit = handleLogin;
  // After successful login (in your login function)
const token = response.data.token; // Assuming this is the token returned from the backend
localStorage.setItem('authToken', token); // Save the token to localStorage


// Sign-Up form submission

function handleSignup(event) {
  event.preventDefault(); // Prevent page reload

  // Get form input values
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();
  const recaptchaResponse = grecaptcha.getResponse(); // reCAPTCHA token

  // Validation checks
  if (!email || !password || !confirmPassword) {
      showModal("Please fill in all fields.");
      return;
  }

  if (password !== confirmPassword) {
      showModal("Passwords do not match.");
      return;
  }

  // Submit the signup request
  fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassword, recaptchaResponse }),
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.message) {
              // Success: Show success modal and redirect to login
              showModal(data.message); // Show success message
              setTimeout(() => {
                  window.location.href = "login.html"; // Redirect to login page
              }, 1500);
          } else {
              // Handle errors sent by the server
              showModal(data.error || "Registration failed. Please try again.");
          }
      })
      .catch((error) => {
          // Handle network or server errors
          console.error("Error during registration:", error);
          showModal("Unable to connect to the server.");
      });
}

// Attach the event listener to the signup form
document.getElementById("signupForm").onsubmit = handleSignup;

