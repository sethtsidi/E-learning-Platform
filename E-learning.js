document.addEventListener("DOMContentLoaded", function () {
  const loveIcons = document.querySelectorAll(".love-icon");
  let favoriteCourses = JSON.parse(localStorage.getItem("favorites")) || [];

  // Toast setup
  const toastNotification = new bootstrap.Toast(
    document.getElementById("toastNotification")
  );
  const toastMessage = document.getElementById("toastMessage");

  loveIcons.forEach((icon) => {
    const isSelected = favoriteCourses.some(
      (fav) => fav.id === icon.dataset.id
    );
    if (isSelected) {
      icon.classList.add("fa-solid", "selected");
      icon.classList.remove("fa-regular");
    } else {
      icon.classList.add("fa-regular");
    }

    icon.onclick = function () {
      const course = {
        id: icon.dataset.id,
        title: icon.dataset.title,
        description: icon.dataset.description,
        image: icon.dataset.image,
        link: icon.dataset.link,
      };

      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
      icon.classList.toggle("selected");

      if (icon.classList.contains("selected")) {
        // Add to favorites
        const alreadyExists = favoriteCourses.some(
          (fav) => fav.id === course.id
        );
        if (!alreadyExists) {
          favoriteCourses.push(course);
          localStorage.setItem("favorites", JSON.stringify(favoriteCourses));
        }

        // Show Modal for Add
        const modal = new bootstrap.Modal(
          document.getElementById("favoriteModal")
        );
        modal.show();
      } else {
        // Remove from favorites
        const updatedFavorites = favoriteCourses.filter(
          (fav) => fav.id !== course.id
        );
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

        // Show Toast for Remove with Undo option
        toastMessage.innerHTML = `"${course.title}" has been removed from favorites! 
          <button id="undoRemove" class="btn btn-link text-white">Undo</button>`;
        toastNotification.show();

        // Undo Removal
        document
          .getElementById("undoRemove")
          .addEventListener("click", function () {
            favoriteCourses.push(course); // Restore the course
            localStorage.setItem("favorites", JSON.stringify(favoriteCourses));

            // Close the toast and update the icon state
            toastNotification.hide();
            icon.classList.add("fa-solid", "selected");
            icon.classList.remove("fa-regular");

            // Re-render favorites
            updateFavoritesCount();
          });
      }

      updateFavoritesCount();
    };
  });

  // Populate the favorites page
  const favoritesContainer = document.getElementById("favorites-container");

  // Clear the container before repopulating it
  favoritesContainer.innerHTML = "";

  const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (storedFavorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet. Add some courses!</p>";
    return;
  }

  storedFavorites.forEach((course) => {
    // Make sure there's no invalid course data
    if (course && course.id && course.title && course.image && course.link) {
      const courseCard = document.createElement("div");
      courseCard.className = "col-md-4 my-3";
      courseCard.innerHTML = `
        <div class="card">
          <img class="card-img-top" src="${course.image}" alt="${course.title}">
          <div class="card-body text-center">
            <h5 class="card-title"><a href="${course.link}" class="links">${course.title}</a></h5>
            <p class="card-text">${course.description}</p>
          </div>
        </div>
      `;
      favoritesContainer.appendChild(courseCard);
    }
  });

  // Function to update the favorites count dynamically
  function updateFavoritesCount() {
    const favoritesCount = document.getElementById("favorites-count");
    const currentFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];

    // Ensure you're only counting valid entries
    const validFavorites = currentFavorites.filter((fav) => fav && fav.id);

    // Update the count
    favoritesCount.innerText = validFavorites.length;

    // Add animation class
    favoritesCount.classList.add("count-animate");

    // Remove the animation class after the animation completes
    setTimeout(() => {
      favoritesCount.classList.remove("count-animate");
    }, 300);
  }

  // Initialize the favorites count
  updateFavoritesCount();
});

document.addEventListener("DOMContentLoaded", function () {
  // Select all cards
  const cards = document.querySelectorAll(".card");

  // Loop through each card
  cards.forEach((card, index) => {
    const stars = card.querySelectorAll(".fa-star"); // Get all stars for the current card
    const userRatingDisplay = card.querySelector("#user-rating"); // Rating display for the current card
    let userRating = 0; // Default rating is 0

    // Load previous rating from localStorage if available
    const cardId = card.getAttribute("data-card-id") || index;
    const storedRating = localStorage.getItem(`userRating-${cardId}`);
    if (storedRating) {
      userRating = parseInt(storedRating);
      updateRatingDisplay(card, userRating); // Update the rating UI for the card
    }

    // Add click event listeners to the stars for this specific card
    stars.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = parseInt(star.getAttribute("data-rating"));

        if (userRating === rating) {
          // If the same star is clicked again, reset the rating for this card
          resetRating(card);
          userRating = 0;
        } else {
          // Otherwise, set the new rating for this card
          userRating = rating;
          localStorage.setItem(`userRating-${cardId}`, userRating);
          updateRatingDisplay(card, userRating);
        }
      });
    });
  });

  // Function to update the rating display (stars and user rating text)
  function updateRatingDisplay(card, rating) {
    const stars = card.querySelectorAll(".fa-star");
    const userRatingDisplay = card.querySelector("#user-rating");

    // Update the user rating text
    userRatingDisplay.innerText = `Your Rating: ${rating}`;

    // Update the stars display
    stars.forEach((star) => {
      const starRating = parseInt(star.getAttribute("data-rating"));
      if (starRating <= rating) {
        star.classList.add("fa-solid");
        star.classList.remove("fa-regular");
      } else {
        star.classList.add("fa-regular");
        star.classList.remove("fa-solid");
      }
    });
  }

  // Function to reset the rating for a specific card
  function resetRating(card) {
    const stars = card.querySelectorAll(".fa-star");
    const userRatingDisplay = card.querySelector("#user-rating");

    // Reset rating to 0
    const userRating = 0;
    userRatingDisplay.innerText = `Your Rating: ${userRating}`;

    // Deselect all stars
    stars.forEach((star) => {
      star.classList.add("fa-regular");
      star.classList.remove("fa-solid");
    });

    // Remove rating from localStorage
    const cardId = card.getAttribute("data-card-id"); // Get card ID to store in localStorage
    localStorage.removeItem(`userRating-${cardId}`);
  }
});

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

// Back to Top Button
const backToTopButton = document.getElementById("backToTop");
if (backToTopButton) {
  window.onscroll = function () {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  };

  backToTopButton.onclick = function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
  };
}

// Quotes Array and Random Quote Display
const quotes = [
  '"Success usually comes to those who are too busy to be looking for it." – Henry David Thoreau',
  '"Don’t give up,the legs that give up will not see the Benz GLE tomorrow"-Bismark Cudjoe',
  '"Hardships often prepare ordinary people for an extraordinary destiny." – C.S. Lewis',
  '"You don’t have to be great to start, but you have to start to be great." – Zig Ziglar',
  '"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela',
  '"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt',
  '"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill',
  '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
  '"It does not matter how slowly you go as long as you do not stop." - Confucius',
  '"It’s not whether you get knocked down, it’s whether you get up." – Vince Lombardi',
  '"Your education is a dress rehearsal for a life that is yours to lead." - Nora Ephron',
  '"What we learn with pleasure we never forget." - Alfred Mercier',
  '"Study Today or Regret Tomorrow. Choose your pain." - Seyiram',
  ' "Success is the sum of small efforts, repeated day in and day out." – Robert Collier',
  '"The best way to predict your future is to create it." - Peter Drucker',
  '"Opportunities don\'t happen. You create them." – Chris Grosser',
  '"The only way to do great work is to love what you do." - Steve Jobs',
  '"Dream big and dare to fail." - Norman Vaughan',
  '"You may encounter many defeats, but you must not be defeated." – Maya Angelou',
  "It always seems impossible until it's done. – Nelson Mandela",
  'Keep away from those who try to belittle your ambitions. Small people always do that, but the really great make you feel that you, too, can become great." – Mark Twain',
  '"The secret of getting ahead is getting started." – Mark Twain',
  '"What lies behind us and what lies before us are tiny matters compared to what lies within us." – Ralph Waldo Emerson',
  '"The beautiful thing about learning is that no one can take it away from you." – B.B. King',
  "I have not failed. I've just found 10,000 ways that won't work. – Thomas Edison",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "All our dreams can come true, if we have the courage to pursue them. – Walt Disney",
  "Don’t watch the clock; do what it does. Keep going.– Sam Levenson",
  "The only limit to our realization of tomorrow is our doubts of today.– Franklin D. Roosevelt",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. – Mahatma Gandhi",
  '"Mistakes are what guide you through life so don\'t give up when you make a lot instead take a break to reset" - Tsidi Seth',
  '"A person who never made a mistake never tried anything new." – Albert Einstein',
  '"Doubt kills more dreams than failure ever will." – Suzy Kassem',
  '"It’s not whether you get knocked down, it’s whether you get up." – Vince Lombardi',
  '"The man who moves a mountain begins by carrying away small stones." – Confucius',
  '"I can\'t change the direction of the wind, but I can adjust my sails to always reach my destination." – Jimmy Dean',
  '"The greatest glory in living lies not in never falling, but in rising every time we fall." – Nelson Mandela',
  "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway. – Earl Nightingale",
];

const quoteElement = document.getElementById("quote");
if (quoteElement) {
  function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.innerHTML = quotes[randomIndex];
  }

  // Display random quote on page load
  displayRandomQuote();
}

// Array of messages to show in the pop-ups
let messages = [
  "Listen on the Go: Use the TTS feature to convert reading material into audio, allowing you to learn while commuting,",
  "Summarize in your own words: After completing a lesson, summarize key points out loud",
  "If you encounter something unclear, use the AI chat bot to ask specific questions",
  "When using audio content, pause frequently to reflect on what you have learned",
  "Set Mini-Goals: Break down your learning into small goals, like completing a section or mastering a particular concept",
  "Use Flashcards for Revision: Regularly test your knowledge by creating flashcards or quizzes.",
];

let popupContainer = document.getElementById("popupContainer");

function createPopup(message) {
  let popup = document.createElement("div");
  popup.classList.add("popup");
  popup.textContent = message;

  popupContainer.appendChild(popup);

  setTimeout(function () {
    popup.style.display = "none";
  }, 5000);
}

function showRandomPopup() {
  let randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];

  createPopup(message);
}

function startRandomPopups() {
  setInterval(showRandomPopup, Math.random() * (10000 - 5000) + 5000);
}

startRandomPopups();

const animatedElement = document.querySelector(".animate-on-scroll");

window.addEventListener("scroll", () => {
  const elementTop = animatedElement.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (elementTop <= windowHeight) {
    animatedElement.classList.add("visible");
  }
});

// DOM Elements for Search History and Dynamic Search
const searchInput = document.getElementById("course-search");
const searchResults = document.getElementById("search-results");
const searchButton = document.getElementById("search-btn");
const clearHistoryButton = document.getElementById("clear-history-btn"); // Clear history button
const cardContainer = document.getElementById("card-container"); // For displaying search results dynamically

let suggestionIndex = -1; // Index for suggestion navigation

// Mock results for search suggestions
const mockResults = [
  { name: "Web Design & Web Development", link: "Web_dev.html" },
  { name: "Business Administration", link: "Business Administration.html" },
  { name: "Learn UX/UI", link: "UX_UI.html" },
  { name: "Learn Python for Data Science", link: "Python.html" },
  { name: "Machine Learning", link: "Machine_Learning.html" },
  { name: "Graphic Designing", link: "Graphic_design.html" },
  { name: "PHP", link: "PHP.html" },
  { name: "Bootstrap", link: "bootstrap.html" },
  { name: "Internet of Things", link: "IOT.html" },
  { name: "Learning with React-Native", link: "React.html" },
  { name: "Business Fundamentals", link: "Businesss fundamental.html" },
  { name: "Management and Leadership", link: "Management and Leadership.html" },
  { name: "Marketing & Consumer Pattern", link: "Marketing and Consumer.html" },
  { name: "Financial Management", link: "Financial Management.html" },
  { name: "Corporate Social Responsibility", link: "CSR.html" },
  { name: "Human Resource Management", link: "HRM.html" },
  { name: "Strategic Management", link: "strategic management.html " },
  { name: "Operations Management", link: "Operations Management.html" },
  { name: "Public Administration", link: "Public Administration.html" },
  { name: "Principles of Public Relations", link: "Principles_of_PR.html" },
  { name: "PR Research and Measurement", link: "PR_Research.html" },
  { name: "Digital and Social Media PR", link: "digital_and_Social.html" },
  { name: "Crisis Communication", link: "Crisis_Communication.html" },
  { name: "PR Writing", link: "PR_Writing.html" },
  { name: "Corporate Communication", link: "Corporate_Comm.html" },
  { name: "Event Planning & Management", link: "Event_Management.html" },
  { name: "Media Relations", link: "Media_Relations.html" },
  { name: "International Public Relations", link: "International_PR.html" },
  { name: "Real Estate Principles", link: "Principles_of_Real_Estate.html" },
  { name: "Property Management", link: "Property_Management.html" },
  { name: "Real Estate Finance", link: "Real_Estate_Finance.html" },
  { name: "Real Estate Law", link: "Real_Estate_Law.html" },
  { name: "Real Estate Marketing", link: "Real_Estate_Marketing.html" },
  { name: "Urban Planning & Development", link: "Urban_Planning.html" },
  { name: "Real Estate Appraisal", link: "Real_Estate_Appraisal.html" },
  { name: "Commercial Real Estate", link: "Commercial_Real_Estate.html" },
  { name: "Ethics in Real Estate", link: "Ethics_In_RE.html" },
];

// Function to update and display search history
function updateSearchHistory() {
  const searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (searches.length > 0) {
    searchResults.innerHTML = `<ul>${searches
      .map((search, index) => `<li data-index="${index}">${search}</li>`)
      .join("")}</ul>`;
    searchResults.style.display = "block";
  } else {
    searchResults.innerHTML = ""; // Clear if no history
    searchResults.style.display = "none";
  }
}

// Function to clear search history
function clearSearchHistory() {
  localStorage.removeItem("searchHistory");
  console.log("Search history cleared.");
  updateSearchHistory();
}

// Capture user input and save to localStorage
searchButton.addEventListener("click", function () {
  const searchQuery = searchInput.value.trim();

  if (!searchQuery) {
    console.log("Search field is empty. Please enter a course name.");
    return;
  }

  // Save the search to localStorage
  let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Avoid duplicate entries
  if (!searches.includes(searchQuery)) {
    searches.push(searchQuery);
    localStorage.setItem("searchHistory", JSON.stringify(searches));
  }

  // Handle search and redirection based on the input
  const matchedResult = mockResults.find(
    (result) => result.name.toLowerCase() === searchQuery.toLowerCase()
  );

  if (matchedResult) {
    // Redirect to the corresponding link if there's a match
    window.location.href = matchedResult.link;
  } else {
    console.log(`No exact match found for "${searchQuery}".`);
  }

  console.log("Search history updated:", searches);
  updateSearchHistory();
});

// Show suggestions on focus
searchInput.addEventListener("focus", function () {
  updateSearchHistory();
  suggestionIndex = -1; // Reset suggestion index
});

// Hide suggestions on blur (clicking outside)
searchInput.addEventListener("blur", function () {
  setTimeout(() => {
    searchResults.style.display = "none";
  }, 200); // Delay to allow clicking on suggestions
});

// Use suggestion when clicked
searchResults.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    searchInput.value = e.target.textContent; // Set input value
    searchResults.style.display = "none"; // Hide dropdown
    console.log(`Selected suggestion: ${e.target.textContent}`);
  }
});

// Handle keyboard navigation for suggestions and search input
searchInput.addEventListener("keydown", function (e) {
  const suggestions = Array.from(searchResults.querySelectorAll("li"));

  if (suggestions.length > 0) {
    if (e.key === "ArrowDown") {
      suggestionIndex = (suggestionIndex + 1) % suggestions.length; // Cycle forward
      highlightSuggestion(suggestions);
    } else if (e.key === "ArrowUp") {
      suggestionIndex =
        (suggestionIndex - 1 + suggestions.length) % suggestions.length; // Cycle backward
      highlightSuggestion(suggestions);
    } else if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission

      // Handle suggestion selection on Enter
      if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
        searchInput.value = suggestions[suggestionIndex].textContent;
        searchResults.style.display = "none"; // Hide dropdown
        const matchedResult = mockResults.find(
          (result) =>
            result.name.toLowerCase() ===
            suggestions[suggestionIndex].textContent.toLowerCase()
        );
        if (matchedResult) {
          window.location.href = matchedResult.link; // Redirect to the link
        }
      } else {
        // Handle if no suggestion is highlighted, check if the input matches any results
        const searchQuery = searchInput.value.trim();
        const matchedResult = mockResults.find(
          (result) => result.name.toLowerCase() === searchQuery.toLowerCase()
        );

        if (matchedResult) {
          window.location.href = matchedResult.link;
        } else {
          console.log(`No exact match found for "${searchQuery}".`);
        }
      }
    }
  }
});

// Function to highlight the current suggestion
function highlightSuggestion(suggestions) {
  suggestions.forEach((item, index) => {
    item.classList.toggle("highlight", index === suggestionIndex);
  });
}

// Fetch and display dynamic search results (mock example)
searchInput.addEventListener("input", function (event) {
  const query = event.target.value.toLowerCase();

  if (query) {
    // Filter results based on user input
    const filteredResults = mockResults.filter((result) =>
      result.name.toLowerCase().includes(query)
    );
    displaySearchResults(filteredResults);
  } else {
    searchResults.style.display = "none"; // Hide dropdown if no query
    cardContainer.innerHTML = ""; // Clear card container if query is empty
  }
});

// Function to display search results dynamically (filtered results)
function displaySearchResults(results) {
  searchResults.innerHTML = ""; // Clear previous suggestions

  if (results.length === 0) {
    searchResults.style.display = "none"; // Hide dropdown if no results
    return;
  }

  // Display suggestions
  results.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a href="${result.link}" class="suggestion-link">${result.name}</a>`;
    searchResults.appendChild(listItem);
  });

  searchResults.style.display = "block"; // Show dropdown
}

// Clear search history when button is clicked
clearHistoryButton.addEventListener("click", clearSearchHistory);

// Initial call to update search history on page load
window.addEventListener("load", updateSearchHistory);

// Function to show modal with message
function showModal(message) {
  const modalBody = document.getElementById("alertModalBody");
  const modal = new bootstrap.Modal(document.getElementById("alertModal"));
  if (modalBody) {
    modalBody.innerText = message;
    modal.show();
  }
}

// Show loading spinner
function showLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "flex"; // Show the loading spinner
  }
}

// Hide loading spinner
function hideLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "none"; // Hide the loading spinner
  }
}

// Toast display function (optional)
function displayToast() {
  const toast = document.getElementById("welcomeToast");
  if (toast) {
    const bootstrapToast = new bootstrap.Toast(toast);
    bootstrapToast.show();
  }
}

// Main window load function to check authentication and handle session
window.onload = function () {
  const token = localStorage.getItem("authToken");
  if (!token) {
    showModal("You must be logged in to access this page.");
    showLoading();
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  // Verify token with the backend, include 'Bearer' prefix
  fetch("http://localhost:5000/protected-route", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Include 'Bearer ' prefix
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log("Protected route access:", data.message);

        // Show toast if not already shown
        if (!localStorage.getItem("toastShown")) {
          displayToast();
          localStorage.setItem("toastShown", "true");
        }

        // Start session timeout and attach activity listeners
        startSessionTimeout();
        window.addEventListener("mousemove", resetSessionTimeout);
        window.addEventListener("keydown", resetSessionTimeout);
        window.addEventListener("click", resetSessionTimeout);
      } else {
        showModal("Invalid or expired session. Redirecting to login.");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      showModal("Unable to verify your session. Redirecting to login.");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    });
};

// Session timeout and warning setup
let sessionTimeout; // Stores the session timeout reference
let warningTimeout; // Stores the warning modal timeout reference

const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_DURATION = 1 * 60 * 1000; // Warn 1 minute before timeout

// Start session timeout tracking
function startSessionTimeout() {
  clearTimeout(sessionTimeout);
  clearTimeout(warningTimeout);

  sessionTimeout = setTimeout(() => {
    showModal("Your session has expired. You will be logged out.");
    setTimeout(logout, 1500); // Logout after showing the modal
  }, SESSION_DURATION);

  warningTimeout = setTimeout(() => {
    showModal(
      "Your session will expire soon. Click anywhere to stay logged in."
    );
  }, SESSION_DURATION - WARNING_DURATION);
}

// Reset session timeout on user activity
function resetSessionTimeout() {
  console.log("User activity detected, resetting session timer.");
  startSessionTimeout();
}

// Logout function
function logout() {
  showLoading();
  localStorage.removeItem("authToken");
  localStorage.removeItem("toastShown");
  showModal("You have been logged out.");
  setTimeout(() => (window.location.href = "login.html"), 1500);
}

// Function to display the toast
function displayToast() {
  const toastMessageElement = document.getElementById("debugToastMessage");
  const toastElement = document.getElementById("debugToast");

  if (toastMessageElement && toastElement) {
    // Pick a random message
    const toastMessages = [
      "Welcome to the platform!",
      "Hope you have a productive session!",
      "Good to see you back!",
      "Explore something new today!",
      "Keep learning and growing!",
    ];
    const randomMessage =
      toastMessages[Math.floor(Math.random() * toastMessages.length)];

    // Update the toast message
    toastMessageElement.textContent = randomMessage;

    // Show the toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  } else {
    console.error(
      "Toast elements not found. Ensure the HTML structure is correct."
    );
  }
}

// Show modal with a message
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

// Open Chatbot in a New Window (Popup)
document.getElementById("chat-icon").addEventListener("click", function () {
  window.open("chatbot.html", "Chatbot", "width=400,height=600,resizable=yes");
});
