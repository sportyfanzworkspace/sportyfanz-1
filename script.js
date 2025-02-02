
//sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const container = document.querySelector('.body-container');

    sidebar.classList.toggle("collapsed");
}

document.querySelector('.icon img').addEventListener('click', toggleSidebar);



// Top scorer slider 
document.addEventListener("DOMContentLoaded", () => {
  const players = document.querySelectorAll('.player-item');
  if (players.length === 0) return; // Exit if no players exist

  let currentPlayer = 0;

  function showNextPlayer() {
      players.forEach((player, index) => {
          player.classList.remove('active', `player-${index + 1}`);
      });

      const current = players[currentPlayer];
      if (current) {
          current.classList.add('active', `player-${currentPlayer + 1}`);
      }

      currentPlayer = (currentPlayer + 1) % players.length;
  }

  setInterval(showNextPlayer, 3000);
  showNextPlayer();
});



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




/*...........................................League table page........................................... */

// Data for leagues (logos, countries, and tables)
const leaguesData = {
  "Premier League": {
    logo: "assets/images/premier-leagueLogo.png",
    country: "England",
    teams: [
      { name: "Man United", logo: "assets/images/manuLogo.png", D: 3, L: 4, GA: 14, GD: 5, PTS: 13 },
      { name: "Barcelona", logo: "assets/images/barcelonaLogo.png", D: 2, L: 1, GA: 20, GD: 10, PTS: 25 },
    ],
  },
  "La Liga": {
    logo: "assets/images/laliga-logo.png",
    country: "Spain",
    teams: [
      { name: "Barcelona", logo: "assets/images/barcelonaLogo.png", D: 2, L: 1, GA: 18, GD: 15, PTS: 24 },
    ],
  },
  "Serie A": {
    logo: "assets/images/series-aLogo.png",
    country: "Italy",
    teams: [
      { name: "Inter Milan", logo: "assets/images/interLogo.png", D: 1, L: 2, GA: 10, GD: 8, PTS: 17 },
    ],
  },
  "Bundesliga": {
    logo: "assets/images/bundeskiga-logo.png",
    country: "Germany",
    teams: [
      { name: "Bayern Munich", logo: "assets/images/bayern-logo.png", D: 2, L: 0, GA: 25, GD: 20, PTS: 30 },
    ],
  },
};

 

 // Get the elements
const leagueNames = document.querySelectorAll(".leagueNames");
const middleLayer = document.querySelector(".middle-layer");

// Function to generate league table HTML with proper alignment
function generateTableHTML(teams) {
  // Sort teams by points in descending order
  teams.sort((a, b) => b.PTS - a.PTS);

  // Generate table headers
  let tableHTML = `
    <div class="table-headers">
      <span class="position-header">Pos</span>
      <span class="team-name">Team</span>
      <span class="stats-header">D</span>
      <span class="stats-header">L</span>
      <span class="stats-header">GA</span>
      <span class="stats-header">GD</span>
      <span class="stats-header">PTS</span>
    </div>
  `;

  // Generate rows for each team
  teams.forEach((team, index) => {
    tableHTML += `
      <div class="team-rows">
        <span class="team-position">${String(index + 1).padStart(2, "0")}</span>
        <div class="team-info">
          <img src="${team.logo}" alt="${team.name} Logo" class="team-logo">
          <span class="team-name">${team.name}</span>
        </div>
        <span class="team-stat">${team.D}</span>
        <span class="team-stat">${team.L}</span>
        <span class="team-stat">${team.GA}</span>
        <span class="team-stat">${team.GD}</span>
        <span class="team-stat">${team.PTS}</span>
      </div>
    `;
  });

  return tableHTML;
}


// Update the middle-layer with league data
function updateLeagueTable(leagueName) {
  const league = leaguesData[leagueName];

  if (league) {
    const tableHTML = generateTableHTML(league.teams);
    middleLayer.innerHTML = `
      <div class="league-table">
        <div class="league-headers">           
          <img src="${league.logo}" alt="${leagueName} Logo" class="league-logo">
          <div class="league-details">
            <h3 class="league-name">${leagueName}</h3>
            <p class="league-country">${league.country}</p>
          </div>
        </div>
        <div class="league-tables-details">
          ${tableHTML}
        </div>
      </div>
    `;
  } else {
    middleLayer.innerHTML = `<p>League data not found!</p>`;
  }
}

// Display Premier League on page load only on the league table page
window.addEventListener("load", () => {
  if (window.location.pathname.includes("league-table.html")) {
    updateLeagueTable("Premier League");
  }
});


 // Add event listeners
leagueNames.forEach((leagueElement) => {
  leagueElement.addEventListener("click", () => {
    const leagueName = leagueElement.querySelector("h3").textContent.trim();
    updateLeagueTable(leagueName);
  });
});
  




/*............................live match page........................*/


document.addEventListener("DOMContentLoaded", function () {
  const matchesContainer = document.querySelector(".matches");
  const leagueMatches = document.querySelectorAll(".leagues-matches");
  const matchesHeader = `
    <div class="matches-header">
      <div class="match-category-btn active" onclick="showMatches('live', event)">Live</div>
      <div class="match-category-btn" onclick="showMatches('highlight', event)">Highlight</div>
      <div class="match-category-btn" onclick="showMatches('upcoming', event)">Upcoming</div>
      <div class="match-category-btn calendar">
        <ion-icon name="calendar-outline" id="calendar-icon"></ion-icon>
        <input type="date" id="match-date" onchange="filterByDate()" style="display: none;" />
      </div>
    </div>
  `;

  const matchesData = {
"Premier League": {
   live: [
     { 
       time: "45", 
       team1: { 
         name: "Arsenal", 
         logo: "assets/images/arsenalLogo.png", 
         score: 1,
         formation: "4-3-2-1",  // Add formation
         lineup: [
           { name: "Goalkeeper", position: "GK" },
           { name: "Defender 1", position: "DEF" },
           { name: "Defender 2", position: "DEF" },
           { name: "Defender 3", position: "DEF" },
           { name: "Defender 4", position: "DEF" },
           { name: "Midfielder 1", position: "MID" },
           { name: "Midfielder 2", position: "MID" },
           { name: "Midfielder 3", position: "MID" },
           { name: "Attacker 1", position: "FWD" },
           { name: "Attacker 2", position: "FWD" },
           { name: "Striker", position: "ST" }
         ]
       }, 
       team2: { 
         name: "Chelsea", 
         logo: "assets/images/chelsea-logo.png", 
         score: 1,
         formation: "4-2-3-1",
         lineup: [
           { name: "Goalkeeper", position: "GK" },
           { name: "Defender 1", position: "DEF" },
           { name: "Defender 2", position: "DEF" },
           { name: "Defender 3", position: "DEF" },
           { name: "Defender 4", position: "DEF" },
           { name: "Midfielder 1", position: "MID" },
           { name: "Midfielder 2", position: "MID" },
           { name: "Midfielder 3", position: "MID" },
           { name: "Attacker 1", position: "FWD" },
           { name: "Attacker 2", position: "FWD" },
           { name: "Striker", position: "ST" }
         ]
       },
       video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
       h2h: ["Arsenal 2-1 Chelsea", "Chelsea 1-1 Arsenal", "Arsenal 3-0 Chelsea"]
     }
   ],

      highlight: [
        { 
          time: "FT", 
          team1: { name: "Liverpool", logo: "assets/images/liverpool-logo.png", score: 3 }, 
          team2: { name: "Man United", logo: "assets/images/manu-logo.png", score: 2 },
          video: "https://www.youtube.com/embed/tgbNymZ7vqY"
        },
      ],
      upcoming: [
        { 
          time: "15:00", 
          team1: { name: "Spurs", logo: "assets/images/spurs-logo.png", score: "vs" }, 
          team2: { name: "Man City", logo: "assets/images/mancity-logo.png", score: "vs" } 
        },
      ],
    },
    "La Liga": {
      live: [
        { 
          time: "30'", 
          team1: { name: "Barcelona", logo: "assets/images/barca-logo.png", score: 2 }, 
          team2: { name: "Real Madrid", logo: "assets/images/realmadrid-logo.png", score: 1 } 
        },
      ],
      highlight: [],
      upcoming: [
        { 
          time: "18:00", 
          team1: { name: "Valencia", logo: "assets/images/valencia-logo.png", score: "vs" }, 
          team2: { name: "Atletico Madrid", logo: "assets/images/atletico-logo.png", score: "vs" } 
        },
      ],
    },
};

  

  // Function to render matches for a specific league and category
  function displayMatches(leagueName = null, category = "live") {
    const allMatches = leagueName ? { [leagueName]: matchesData[leagueName] } : matchesData;
    let matchesHTML = matchesHeader;

    Object.keys(allMatches).forEach((league) => {
      const leagueCategoryMatches = allMatches[league]?.[category] || [];
      if (leagueCategoryMatches.length) {
        matchesHTML += `
         <div class="league-header">
           <img src="assets/images/${league.toLowerCase().replace(/\s+/g, "-")}-logo.png" alt="${league} Logo" class="league-logo">
          <h3>${league} - ${category.toUpperCase()}</h3>
        </div>`;
        leagueCategoryMatches.forEach((match, index) => {
          matchesHTML += `
            <div class="matches-item" data-league="${league}" data-index="${index}" data-category="${category}">
              <div class="matches-teams">
                <div class="matches-time">${match.time}</div>
                <div class="matches-datas">
                  <div class="matches-team">
                    <img src="${match.team1.logo}" alt="${match.team1.name} Logo">
                    <span>${match.team1.name}</span>
                  </div>
                  <div class="matches-team">
                    <img src="${match.team2.logo}" alt="${match.team2.name} Logo">
                    <span>${match.team2.name}</span>
                  </div>
                </div>
                <div class="matches-scores">
                  <div class="score">${match.team1.score}</div>
                  <div class="score">${match.team2.score}</div>
                </div>
              </div>
            </div>
          `;
        });
      } else {
        matchesHTML += `<p>No matches available for ${league} in ${category}.</p>`;
      }
    });

    matchesContainer.innerHTML = matchesHTML;
  }

    // Event delegation for dynamically created match items
    matchesContainer.addEventListener("click", function (event) {
      const matchItem = event.target.closest(".matches-item");
      if (!matchItem) return;
  
      const league = matchItem.dataset.league;
      const index = parseInt(matchItem.dataset.index, 10);
      const category = matchItem.dataset.category;
  
      displayLiveMatch(league, index, category);
    });



  // Function to show the live match video
 // Function to display live match details with tabs
window.displayLiveMatch = function (league, matchIndex, category) {
  const match = matchesData[league]?.[category]?.[matchIndex];

  if (!match || !match.video) return;

  matchesContainer.innerHTML = `
      <div class="live-match">
          <iframe width="100%" height="250px" style="border-radius: 10px;" src="${match.video}" frameborder="0" allowfullscreen></iframe>

          <div class="live-match-teams">
              <div class="live-match-datas">
                  <div class="live-match-team">
                      <img src="${match.team1.logo}" alt="${match.team1.name} Logo">
                      <span>${match.team1.name}</span>
                  </div>
                  <div class="match-time-scores">
                      <h3 class="league-name">${league}</h3>  
                      <div class="scores">${match.team1.score} - ${match.team2.score}</div>  
                      <div class="live-match-time">
                          <img src="assets/icons/Ellipse 1.png" alt="Ellipse" class="Ellipse-logo">
                          <span>${match.time}</span>
                      </div>
                  </div>
                  <div class="live-match-team">
                      <img src="${match.team2.logo}" alt="${match.team2.name} Logo">
                      <span>${match.team2.name}</span>
                  </div>
              </div>                
          </div>

          <div class="live-match-info">
              <div class="match-tabs">
                  <button class="tab-btn active" data-tab="info">Info</button>
                  <button class="tab-btn" data-tab="lineups">Lineups</button>
                  <button class="tab-btn" data-tab="h2h">H2H</button>
              </div>
              <div class="tab-content" id="tab-content">
                  ${getTabContent("info", match)}
              </div>
          </div>
      </div>
  `;

  // Add event listeners to the tabs
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", function () {
        // Remove active class from all buttons
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        // Add active class to the clicked button
        this.classList.add("active");

        // Ensure #tab-content exists
        const tabContentDiv = document.getElementById("tab-content");
        if (!tabContentDiv) {
            console.error("❌ ERROR: #tab-content div not found!");
            return;
        }

        // Get tab content
        const tabContent = getTabContent(this.dataset.tab, match);

        // Debugging
        console.log(`Updating #tab-content for tab: ${this.dataset.tab}`, tabContent);

        // Force re-render
        tabContentDiv.innerHTML = "";  // Clear previous content
        tabContentDiv.innerHTML = tabContent;
    });
});

};

// Function to generate content for each tab
function getTabContent(tab, match) {
  if (!match) {
      console.error("Match data is missing");
      return "<p>Match data unavailable.</p>";
  }

  console.log(`Generating content for tab: ${tab}`, match); // Debugging log

  switch (tab) {
      case "info":
          return `
              <h3>Match Info</h3>
              <p><strong>Venue:</strong> ${match.venue || "Not available"}</p>
              <p><strong>Referee:</strong> ${match.referee || "Not available"}</p>
              <p><strong>Competition:</strong> ${match.competition || "Not available"}</p>
          `;

          case "lineups":
            return `
                <h3>Lineups (${match.team1.formation} vs ${match.team2.formation})</h3>
                <div class="field">
                    <div class="team team1">${generateFormation(match.team1)}</div>
                    <div class="team team2">${generateFormation(match.team2)}</div>
                </div>
            `;

      case "h2h":
          return `
              <h3>Head to Head</h3>
              <ul>
                  ${
                      Array.isArray(match.h2h) && match.h2h.length > 0
                          ? match.h2h.map(game => `<li>${game}</li>`).join("") 
                          : "<p>No past matches available.</p>"
                  }
              </ul>
          `;

      default:
          return "<p>No data available</p>";
  }
}



// Function to switch tabs
window.showTab = function (tab, league, matchIndex, category) {
    const match = matchesData[league]?.[category]?.[matchIndex];
    if (!match) return;

    const tabContent = document.getElementById("tab-content");
    tabContent.innerHTML = generateTabContent(tab, match);
};




matchesContainer.addEventListener("click", function (event) {
  const matchItem = event.target.closest(".matches-item");
  if (!matchItem) return;

  const league = matchItem.dataset.league;
  const index = parseInt(matchItem.dataset.index, 10);
  const category = matchItem.dataset.category;
  const match = matchesData[league]?.[category]?.[index];

  if (!match || !match.video) {
      console.warn("No video available for this match.");
      return;
  }

  displayLiveMatch(league, index, category);
});

  

  // Event listener for league click
  leagueMatches.forEach((league) => {
    league.addEventListener("click", function () {
      const leagueName = league.querySelector("h3").textContent;
      displayMatches(leagueName, "live");
    });
  });

  // Event listener for match category clicks
  window.showMatches = function (category, event) {
    const activeLeague = document.querySelector(".leagues-matches .league-info h3.active");
    const leagueName = activeLeague ? activeLeague.textContent : null;

    const buttons = document.querySelectorAll(".match-category-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    displayMatches(leagueName, category);
  };

  // Filter by date
  window.filterByDate = function () {
    const selectedDate = document.getElementById("match-date").value;
    matchesContainer.innerHTML = `<p>Displaying matches for ${selectedDate}...</p>`;
  };

  // Display all matches by default on load
  displayMatches();
});

//lineup generate
function generateFormation(team) {
  if (!team.lineup || !team.formation) return "<p>Formation not available</p>";

  // Convert formation "4-3-2-1" to an array [4, 3, 2, 1]
  const formation = team.formation.split("-").map(num => parseInt(num));
  
  let playersHTML = `<div class="formation">`;

  let playerIndex = 0;
  formation.forEach((numPlayers, rowIndex) => {
      playersHTML += `<div class="row">`;
      for (let i = 0; i < numPlayers; i++) {
          const player = team.lineup[playerIndex++] || { name: "?", position: "?" };
          playersHTML += `<div class="player">${player.name} (${player.position})</div>`;
      }
      playersHTML += `</div>`;
  });

  playersHTML += `</div>`;
  return playersHTML;
}













/*...........................predition page................................*/

function formatDateTime(dateStr, timeStr) {
  const date = new Date(`${dateStr}T${timeStr}`);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formattedDate} | ${formattedTime}`;
}


const matches = [
  { date: "2024-12-04", time: "14:00", league: "Premier League", leagueLogo: "assets/images/premier-leagueLogo.png", teams: [
      { name: "Man U", logo: "assets/images/manuLogo.png" },
      { name: "Chelsea", logo: "assets/images/chelsea-logo.png" }
  ] },
  { date: "2024-12-04", time: "16:30", league: "La Liga", leagueLogo: "assets/images/laliga-logo.png", teams: [
      { name: "Real Madrid", logo: "assets/images/real-madrid.png" },
      { name: "Barcelona", logo: "assets/images/barcelona-logo.png" }
  ] },
  {  date: "2024-12-04", time: "18:45", league: "Serie A", leagueLogo: "assets/images/series-alogo.png", teams: [
      { name: "Juventus", logo: "assets/images/juventus-logo.png" },
      { name: "Manchester United", logo: "assets/images/manuLogo.png" }
  ] },
  {  date: "2024-12-04", time: "20:00", league: "Bundesliga", leagueLogo: "assets/images/bundeskiga-logo.png", teams: [
      { name: "Bayern Munich", logo: "assets/images/bayern-logo.png" },
      { name: "Juventus", logo: "assets/images/juventus-logo.png" }
  ] },
  {  date: "2024-12-04", time: "22:15", league: "NPFL", leagueLogo: "assets/images/npfl-logo.png", teams: [
      { name: "PSG", logo: "assets/images/psg-logo.png" },
      { name: "Bayern Munich", logo: "assets/images/bayern-logo.png" }
  ] }
];

const container = document.getElementById("predictionsContainer");

        
        matches.forEach(match => {
            const matchDiv = document.createElement("div");
            matchDiv.classList.add("match-preditions");
            
            matchDiv.innerHTML = `
            <div class="preditions-container">
                <div class="match-league-container">
                    <img src="${match.leagueLogo}" alt="${match.league}" class="predit-league-logo">
                    <span>${match.league}</span>
                </div>
                <div class="predit-info-container">
                    <div class="match-teams-container">
                        ${match.teams.map(team => `
                              <div class="team-predit">
                                  <img src="${team.logo}" alt="${team.name}" class="team-logo">
                                  <span>${team.name}</span>
                                  <button class="score-button" onclick="togglePrediction('${match.time.replace(':', '')}', '${team.name}')">Win</button>
                              </div>
                          `).join('')}
                    </div>
                </div>
                  <div class="prediction-info" id="predictionInfo-${match.time.replace(':', '')}"></div>
                <div class="date-times" onclick="toggleArrow('${match.time.replace(':', '')}')">
                    <span>${formatDateTime(match.date, match.time)}</span>
                    <img id="arrow-${match.time.replace(':', '')}" src="assets/icons/button-down.png" alt="toggle-arrow">        
                    </div> 
                 </div>
            `;
            
            container.appendChild(matchDiv);
        });

        let selectedTeam = {}; // Store the selected team for each

        function togglePrediction(matchTime, teamName) {
          const info = document.getElementById(`predictionInfo-${matchTime}`);
          const arrow = document.getElementById(`arrow-${matchTime}`);
          const isVisible = info.style.display === "flex";
          
          if (!isVisible && teamName) {
            selectedTeam[matchTime] = teamName; // Store selected team
            info.innerHTML = `
            <div class="scores-input">
                <span>Enter Score:</span>
                <input type="text" id="scoreInput-${matchTime}" placeholder="2-1" 
                    oninput="validateScoreInput(this)">
            </div>
            <!-- Horizontal Line -->
            <div class="score-stroke"></div>
            <div class="team-win-name"><span>${teamName} to Win</span> 
            <div class="predit-amount">
            <span>$100</span>
            </div>
            </div>
            <p class="error-message" id="error-${matchTime}">Please enter a valid score (e.g., 2-1).</p>
            <button class="submit-button" onclick="confirmSubmit('${matchTime}')">
                <img src="assets/icons/arrow-up.png" alt="toggle-arrow"> Submit Prediction
            </button>`;
        }
          
          info.style.display = isVisible ? "none" : "flex";
          arrow.src = isVisible ? "assets/icons/button-down.png" : "assets/icons/button-up.png";
      }

      // Validate score input
      function validateScoreInput(input) {
        let value = input.value.replace(/[^0-9-]/g, ''); // Allow only numbers and '-'
    
        // Automatically insert '-' after the first digit
        if (value.length === 2 && value[1] !== '-') {
            value = value[0] + '-' + value[1];
        }
    
        // Ensure only one '-'
        const parts = value.split('-');
        if (parts.length > 2) {
            value = parts[0] + '-' + parts[1]; // Keep only first valid split
        }
    
        input.value = value; 
    }
    

// Confirmation popup
      function confirmSubmit(matchTime) {
        console.log("Match Time:", matchTime);
    
        const scoreInputElement = document.getElementById(`scoreInput-${matchTime}`);
        if (!scoreInputElement) {
            console.error(`Element #scoreInput-${matchTime} not found!`);
            return;
        }
    
        const scoreInput = scoreInputElement.value.trim();
        if (!/^\d+-\d+$/.test(scoreInput)) {
            document.getElementById(`error-${matchTime}`).style.display = "block";
            return;
        }
    
        const match = matches.find(m => m.time.replace(':', '') === matchTime);
        if (!match) {
            console.error("Match not found for time:", matchTime);
            return;
        }
    
    
        console.log("Match Found:", match);
    
        let confirmationPopup = document.getElementById("confirmationPopup");
        if (!confirmationPopup) {
            console.error("Confirmation popup element not found! Creating one...");
            confirmationPopup = document.createElement("div");
            confirmationPopup.id = "confirmationPopup";
            confirmationPopup.className = "confirmation-popup";
            document.body.appendChild(confirmationPopup);
        }
    
        // Split score into individual values
        const [score1, score2] = scoreInput.split("-").map(Number);
          const winningTeam = selectedTeam[matchTime];
          let team1Score, team2Score;

        // Assign scores correctly based on the selected winning team
    if (winningTeam === match.teams[0].name) {
      team1Score = Math.max(score1, score2);
      team2Score = Math.min(score1, score2);
  } else {
      team1Score = Math.min(score1, score2);
      team2Score = Math.max(score1, score2);
  }
    
        confirmationPopup.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                Confirm Prediction
                 <button class="cancel-btn" onclick="closePopup()">
                  <ion-icon name="close-outline" class="cross-icon"></ion-icon>
                 </button>
                </div>
                
                <div class="predit-match-details">
                    <div class="predit-teams-container">
                        <div class="team-prediting">
                            <span class="team-prediting-name">${match.teams[0].name}</span>
                            <img src="${match.teams[0].logo}" class="team-prediting-logo">
                        </div>
                        <div class="vs-time">
                          <p class="predit-league-info">${match.league}</p>
                    
                          <div class="vs"><span>VS</span></div>
                            <span>${match.time}</span>
                            
                        </div>
                        <div class="team-prediting-name">
                            <span class="team-prediting-name">${match.teams[1].name}</span>
                            <img src="${match.teams[1].logo}" class="team-prediting-logo">
                        </div>
                    </div>
                     <div class="score-container">
                       <span class="score-selected">${team1Score}</span>
                       <span class="score-selected">${team2Score}</span>
                    </div>
                </div>
                <div class="confirmation-buttons">
                <span>$100</span>
                <button class="submit-btn" onclick="submitFinal('${matchTime}', ${team1Score}, ${team2Score})">
                <img src="assets/icons/arrow-up.png" alt="arrow-up" width="16">
                Submit Now</button>
            </div>
            </div>
        `;
    
        
        confirmationPopup.style.display = "block";
        document.body.classList.add("blurred"); // Apply blur effect to the background
    }
    
    

    function toggleArrow(matchTime) {
      if (selectedMatch === matchTime) {
          const info = document.getElementById(`predictionInfo-${matchTime}`);
          const arrow = document.getElementById(`arrow-${matchTime}`);
          const isVisible = info.style.display === "flex";
          info.style.display = isVisible ? "none" : "flex";
          arrow.src = isVisible ? "assets/icons/arrow-down.png" : "assets/icons/arrow-up.png";
      }
  }

// Submitting final prediction
function submitFinal(matchTime, team1Score, team2Score) {
  console.log(`Submitting Prediction: ${matchTime}, ${team1Score}-${team2Score}`);

  // Send data to server or database
  const predictionData = {
      matchTime: matchTime,
      team1: matches.find(m => m.time.replace(':', '') === matchTime).teams[0].name,
      team2: matches.find(m => m.time.replace(':', '') === matchTime).teams[1].name,
      team1Score: team1Score,
      team2Score: team2Score,
      amount: 100
  };

  console.log("Prediction Data:", predictionData);

      // Ensure confirmation popup is completely removed
      const confirmationPopup = document.getElementById("confirmationPopup");
      if (confirmationPopup) {
          confirmationPopup.style.display = "none"; // Hide it
      }
  

  // Here, you would send the data to your backend using fetch or an API call.
  // Example:
  // fetch('/submit-prediction', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(predictionData)
  // }).then(response => response.json())
  //   .then(data => console.log("Server Response:", data))
  //   .catch(error => console.error("Error submitting prediction:", error));

  // Show success message
  showSuccessPopup();
}


// Function to show success message
function showSuccessPopup() {
  // First, remove any existing success popups to prevent duplicates
  const existingPopup = document.getElementById("successPopup");
  if (existingPopup) {
      existingPopup.remove();
  }

  const successPopup = document.createElement("div");
  successPopup.id = "successPopup";
  successPopup.className = "success-popup";
  successPopup.innerHTML = `
      <div class="success-content">
          <img src="assets/icons/mark.png" alt="Success" class="success-icon">
          <h3>Prediction Submitted Successfully!</h3>
          <button onclick="closeSuccessPopup()">OK</button>
      </div>
  `;

  document.body.appendChild(successPopup);
  document.body.classList.add("blurred"); // Apply blur effect to the background
}


// Function to close the success popup and remove blur
function closeSuccessPopup() {
  const successPopup = document.getElementById("successPopup");
  if (successPopup) {
      successPopup.remove();
  }
  document.body.classList.remove("blurred"); // Remove blur effect
}

// Close popup
function closePopup() {
  document.getElementById("confirmationPopup").style.display = "none";
}