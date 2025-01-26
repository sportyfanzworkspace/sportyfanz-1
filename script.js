
//sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const container = document.querySelector('.body-container');

    sidebar.classList.toggle("collapsed");
}

document.querySelector('.icon img').addEventListener('click', toggleSidebar);



// Top scorer slider 
const players = document.querySelectorAll('.player-item');
let currentPlayer = 0;

function showNextPlayer() {
    players.forEach((player, index) => {
        player.classList.remove('active', `player-${index + 1}`);
    });

    const current = players[currentPlayer];
    current.classList.add('active', `player-${currentPlayer + 1}`);

    currentPlayer = (currentPlayer + 1) % players.length;
}

setInterval(showNextPlayer, 3000);

// Initialize the first player as active
showNextPlayer();


// Initialize the carousel
let currentIndex = 0;
const slides = document.querySelectorAll(".slider-content");
const totalSlides = slides.length;

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add("active");
      slide.style.display = "flex"; // Show active slide
    } else {
      slide.classList.remove("active");
      slide.style.display = "none"; // Hide inactive slides
    }
  });
}

// Auto-slide functionality
function autoSlide() {
  currentIndex = (currentIndex + 1) % totalSlides; // Loop back to the first slide
  showSlide(currentIndex);
}

// Start the slider
showSlide(currentIndex);
setInterval(autoSlide, 4000); // Change slides every 3 seconds


// Sample Data for Matches (Including Match Dates)
const matchesData = {
    live: [
        { team1: 'Chelsea', team2: 'Arsenal', time: '5:45pm', country: 'England', date: '2025-01-21', logo1: 'assets/images/chelsea-logo.png', logo2: 'assets/images/arsenalLogo.png' },
        { team1: 'Man U', team2: 'Liverpool', time: '6:30pm', country: 'England', date: '2025-01-22', logo1: 'assets/images/manuLogo.png', logo2: 'assets/images/liverpoolLogo.png' }
    ],
    highlight: [
        { team1: 'Bayern Munich', team2: 'Barcelona', time: '4:00pm', country: 'Germany', date: '2025-01-20', logo1: 'assets/images/bayern-logo.png', logo2: 'assets/images/barcelona-logo.png' },
        { team1: 'PSG', team2: 'Juventus', time: '6:00pm', country: 'France', date: '2025-01-23', logo1: 'assets/images/psg-logo.png', logo2: 'assets/images/juventus.png' }
    ],
    upcoming: [
        { team1: 'Real Madrid', team2: 'Sevilla', time: '8:00pm', country: 'Spain', date: '2025-01-24', logo1: 'assets/images/real-madrid.png', logo2: 'assets/images/sevilla.png' },
        { team1: 'AC Milan', team2: 'Napoli', time: '9:00pm', country: 'Italy', date: '2025-01-25', logo1: 'assets/images/ac-milan.png', logo2: 'assets/images/napoli.png' }
    ]
};

// Function to Show Matches Based on Category
function showMatches(category, event) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Highlight the active button
    if (event) {
        event.target.classList.add('active');
    }

    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    const matches = matchesData[category];

    if (matches && matches.length > 0) {
        matches.forEach(match => createMatchCard(container, match));
    } else {
        container.innerHTML = `<p>No matches available</p>`;
    }
}

// Function to Create a Match Card
function createMatchCard(container, match) {
    const matchCard = document.createElement('div');
    matchCard.classList.add('match-card');

    matchCard.innerHTML = `
        <div class="match-details">
            <div class="match-info">
                <div class="team-logo">
                    <img src="${match.logo1}" alt="${match.team1} Logo">
                </div>
                <div class="team-names">
                    <span>${match.team1}</span>
                    <span>vs</span>
                    <span>${match.team2}</span>
                </div>
                <div class="team-logo">
                    <img src="${match.logo2}" alt="${match.team2} Logo">
                </div>
            </div>
            <div class="match-time">${match.time}</div>
            <div class="match-country">${match.country}</div>
            <button class="view-details-btn">View Details</button>
        </div>
    `;

    container.appendChild(matchCard);
}

// Function to Filter Matches by Date
function filterByDate() {
    const selectedDate = document.getElementById('match-date').value;
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    const allMatches = Object.values(matchesData).flat();
    const filteredMatches = allMatches.filter(match => match.date === selectedDate);

    if (filteredMatches.length > 0) {
        filteredMatches.forEach(match => createMatchCard(container, match));
    } else {
        container.innerHTML = `<p>No matches found for this date</p>`;
    }
}

// Automatically display 'Live' matches when the page loads
window.onload = function () {
    showMatches('live');
};




/*----------------------------news paage-----------------------------------*/

function toggleNews(section) {
    const newsSection = document.getElementById(section + '-news');
    const seeMoreText = document.getElementById(section + '-text');
    const icon = document.querySelector(`#${section} .see-more ion-icon`);

    if (newsSection.style.display === 'none' || newsSection.style.display === '') {
        newsSection.style.display = 'block';
        seeMoreText.innerText = 'See less';
        icon.name = 'caret-up-outline'; // Change to caret up icon
    } else {
        newsSection.style.display = 'none';
        seeMoreText.innerText = 'See more';
        icon.name = 'caret-down-outline'; // Change back to caret down icon
    }
}

// Function to calculate and display the relative time
function updateRelativeTime() {
    const timeElements = document.querySelectorAll('.news-time');
    const now = new Date();

    timeElements.forEach((timeElement) => {
        const postedTime = new Date(timeElement.dataset.posted);
        const timeDifference = Math.floor((now - postedTime) / 1000); // Difference in seconds

        let timeText;
        if (timeDifference < 60) {
            timeText = `${timeDifference} seconds ago`;
        } else if (timeDifference < 3600) {
            const minutes = Math.floor(timeDifference / 60);
            timeText = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (timeDifference < 86400) {
            const hours = Math.floor(timeDifference / 3600);
            timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(timeDifference / 86400);
            timeText = `${days} day${days > 1 ? 's' : ''} ago`;
        }

        timeElement.textContent = timeText; // Set the time text directly
    });
}

// Update relative time every 30 seconds
setInterval(updateRelativeTime, 30000);
// Initial call to populate times
updateRelativeTime();


 // Function to show the detailed view 
document.addEventListener("DOMContentLoaded", () => {
    const newsMessages = document.querySelectorAll(".news-messages");
    const trendingNews = document.querySelector("#trending-news");
    const updatesNews = document.querySelector("#updates-news");
    const textContSections = document.querySelectorAll(".text-cont");
    const newsDetailsView = document.querySelector("#news-details-view");
    const newsDetailContent = document.querySelector("#news-detail-content");

    // Function to show the detailed view of a specific news item
    newsMessages.forEach((message) => {
        message.addEventListener("click", () => {
            // Get the news content
            const newsHeader = message.querySelector(".news-header").textContent;
            const newsDescription = message.querySelector(".news-description").textContent;
            const newsTime = message.querySelector(".news-time").textContent;
            const newsImage = message
                .closest(".news-infomat")
                .querySelector(".feature-img img").src;

            // Populate the details view
            newsDetailContent.innerHTML = `
            <h2>${newsHeader}</h2>
                <p><small>${newsTime}</small></p>
                <img src="${newsImage}" alt="News Image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                <p>${newsDescription}</p>
            `;

            // Hide both news sections and text-cont sections, then show the detailed view
            trendingNews.style.display = "none";
            updatesNews.style.display = "none";
            textContSections.forEach((section) => (section.style.display = "none"));
            newsDetailsView.style.display = "block";
        });
    });

    // Function to return to the news list view
    window.showNewsList = () => {
        newsDetailsView.style.display = "none";
        textContSections.forEach((section) => (section.style.display = "block"));
        trendingNews.style.display = "block"; // Show Trending News
        updatesNews.style.display = "block"; // Show News Updates
    };
});



