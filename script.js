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

window.onload = function () {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("signupForm").classList.add("active");
};

// Handle signup form submission
function handleSignup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate password match
    if (password !== confirmPassword) {
        showModal("Passwords do not match!");
        return;
    }

    // Send signup request
    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                showModal(data.message);
                setTimeout(() => window.location.href = "login.html", 1500); // Redirect after showing success message
            } else {
                showModal(data.error || "An unexpected error occurred.");
            }
        })
        .catch((error) => {
            console.error("Error during signup:", error.message);
            showModal("Unable to connect to the server. Please check if the backend is running.");
        });
}

// Handle login form submission
function handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Send login request
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.token) {
                // Store the token in localStorage
                localStorage.setItem('authToken', data.token);

                showModal("Login successful!");
                setTimeout(() => window.location.href = "E-learning.html", 1500); // Redirect after showing success message
            } else {
                showModal(data.error || "Login failed. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error during login:", error.message);
            showModal("Unable to connect to the server. Please check if the backend is running.");
        });
}

// Function to display a modal with a message
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

// Dark Mode Toggle
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

// Show loading spinner
function showLoading() {
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) {
      loadingSpinner.style.display = "flex"; // Show the loading spinner
    }
  }
  
  // Handle login form submission
  document.getElementById("loginForm").onsubmit = function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    showLoading(); // Show loading spinner during login
  
    // Simulate login process
    setTimeout(() => {
      // Simulate setting token in localStorage
      localStorage.setItem("authToken", "sampleToken");
  
      // Redirect to E-learning page after delay
      window.location.href = "e-learning.html";
    }, 1500); // Add delay for loading effect
  };