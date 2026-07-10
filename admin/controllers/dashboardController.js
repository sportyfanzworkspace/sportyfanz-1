
const fetch = require('node-fetch');
const NodeCache = require("node-cache");
const cache = require('../utils/cache/redisCache');
const playerImageMap = require('../utils/playerImageMap');

function getCurrentSeason() {

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Football season normally starts July/August
    if(month >= 7){
        return `${year}-${year + 1}`;
    }

    return `${year - 1}-${year}`;

}

const APIkey = process.env.APIFOOTBALL_API_KEY;

// Reusable fetch with retry + timeout-------------------------
async function fetchRetry(url, retries = 3, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      if (retries > 0) {
        return fetchRetry(url, retries - 1, timeout);
      }
      throw new Error("Bad response: " + res.status);
    }

    clearTimeout(timer);
    return res.json();

  } catch (err) {
    clearTimeout(timer);
    if (retries > 0) {
      return fetchRetry(url, retries - 1, timeout);
    }
    throw err;
  }
}


  // Display matches for live-match-demo
  const getMatchesCache = new NodeCache({ stdTTL: 60 });

  let currentSeasonCache = getCurrentSeason();

  const LEAGUE_PRIORITY = [
    "World Cup",
    "Champions League",
    "Europa League",
    "Conference League",
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "CAF Champions League",
    "CAF Confederation Cup",
    "NPFL",
    "MLS",
    "Saudi"
];

  function getLeagueRank(name = "") {
    const league = name.toLowerCase();

    const index = LEAGUE_PRIORITY.findIndex(item =>
        league.includes(item.toLowerCase())
    );

    return index === -1 ? 999 : index;
  }

  const TOP_TEAMS = [

    // England
    "Manchester United",
    "Manchester City",
    "Liverpool",
    "Arsenal",
    "Chelsea",
    "Tottenham",
    "Newcastle United",

    // Spain
    "Real Madrid",
    "Barcelona",
    "Atletico Madrid",

    // Italy
    "Juventus",
    "Inter",
    "AC Milan",
    "Napoli",
    "Roma",

    // Germany
    "Bayern Munich",
    "Borussia Dortmund",
    "RB Leipzig",

    // France
    "PSG",
    "Paris Saint-Germain",
    "Marseille",
    "Lyon",

    // Europe
    "Ajax",
    "Benfica",
    "Porto",

    // Nigeria (NPFL)
    "Enyimba",
    "Rivers United",
    "Remo Stars",
    "Bendel Insurance",
    "Shooting Stars",
    "Kano Pillars",
    "Heartland",
    "Plateau United",
    "Akwa United",
    "Kwara United",
    "Lobi Stars",
    "Sunshine Stars",
    "Nasarawa United",
    "Abia Warriors",
    "Bayelsa United",
    "El-Kanemi Warriors",
    "Ikorodu City",
    "Niger Tornadoes",

    // CAF Giants
    "Al Ahly",
    "Zamalek",
    "Mamelodi Sundowns",
    "Esperance",
    "Wydad Casablanca",
    "Raja Casablanca",
    "TP Mazembe",
    "ASEC Mimosas",

    // World Cup Nations
    "Brazil",
    "Argentina",
    "England",
    "France",
    "Germany",
    "Spain",
    "Portugal",
    "Italy",
    "Netherlands",
    "Belgium",
    "Nigeria",
    "Senegal",
    "Morocco",
    "Egypt",
    "Algeria",
    "Cameroon",
    "Ghana",
    "South Africa",
    "USA"
];

 function calculateMatchScore(match) {

    let score = 0;

    const home = (match.match_hometeam_name || "").toLowerCase();
    const away = (match.match_awayteam_name || "").toLowerCase();
    const league = (match.league_name || "").toLowerCase();

    /* MATCH STATUS IMPORTANCE*/

    const status = match.match_status;

    // Live games are the most important
    if (
        status &&
        status !== "Finished" &&
        status !== "Not Started"
    ) {
        score += 120;
    }

    // Finished games still get some priority
    if(status === "Finished"){
        score += 10;
    }



    /* COMPETITION VALUE */
    if(league.includes("world cup")){
        score += 1000;
    }

    else if(league.includes("champions league")){
        score += 900;
    }

    else if(league.includes("europa")){
        score += 700;
    }

    else if(league.includes("premier league")){
        score += 900;
    }

    else if(
        league.includes("la liga") ||
        league.includes("serie a") ||
        league.includes("bundesliga")
    ){
        score += 700;
    }

    else if(league.includes("ligue 1")){
        score += 650;
    }

    else if (league.includes("caf champions")) {
    score += 600;
    }

    else if(
        league.includes("npfl") ||
        (league.includes("nigeria") && league.includes("premier"))
    ){
        score += 550;
    }

      /* BIG TEAM POPULARITY */
       TOP_TEAMS.forEach(team=>{

       const club = team.toLowerCase();
        if(home.includes(club)){
            score += 50;
        }
        if(away.includes(club)){
            score += 50;
        }
    });

    /* RIVALRY DETECTION */
    const rivalries = [
        [
          "real madrid",
          "barcelona"
        ],

        [
          "manchester united",
          "manchester city"
        ],

        [
          "manchester united",
          "liverpool"
        ],

        [
          "arsenal",
          "chelsea"
        ],

        [
          "inter",
          "milan"
        ],

        [
          "juventus",
          "inter"
        ]
    ];

      rivalries.forEach(pair=>{
        if(
            (home.includes(pair[0]) &&
             away.includes(pair[1]))
             ||
            (home.includes(pair[1]) &&
             away.includes(pair[0]))
        ){
            score += 150;

         }
      });

      /* GOAL / ACTION BOOST*/
      const homeScore =
        Number(match.match_hometeam_score || 0);

      const awayScore =
        Number(match.match_awayteam_score || 0);

     if(homeScore > 0 || awayScore > 0){
        score += 80;
      }

    /* CLOSE FINISH BOOST*/
    if(
        Math.abs(homeScore - awayScore) <= 1
        &&
        status !== "Finished"
     ){
        score += 40;
     }
    return score;
  }

  exports.getMatches = async (req, res) => {
   const { from, to } = req.query;
   const limit = parseInt(req.query.limit) || 15;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  const season = getCurrentSeason();

  if(season !== currentSeasonCache){

    console.log(
      "New season detected:",
      season
    );

    getMatchesCache.flushAll();

    currentSeasonCache = season;
}
  const cacheKey =`matches_${season}_${from}_${to}_${limit}`;
  const cached = getMatchesCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://apiv3.apifootball.com/?action=get_events&from=${from}&to=${to}&timezone=Europe/Berlin&APIkey=${APIkey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch events" });
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      return res.status(500).json({ error: "Unable to parse match data" });
    }

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: "Invalid match data format" });
    }
    
    // Sort matches by kickoff time first
    data.sort((a, b) => {
      const A = new Date(`${a.match_date}T${a.match_time}`);
      const B = new Date(`${b.match_date}T${b.match_time}`);
     return A - B;
    });

  
  // Pick the biggest match from each competition
  const featuredMatches = [];
  const groupedLeagues = {};


  // Group matches by league
  data.forEach(match => {

    const league = match.league_name || "Other";

    if(!groupedLeagues[league]){
        groupedLeagues[league] = [];
    }

    groupedLeagues[league].push(match);

});


// Select highest rated match per league
Object.keys(groupedLeagues).forEach(league => {
    const matches = groupedLeagues[league];
    matches.sort((a,b)=>{
      return calculateMatchScore(b) - calculateMatchScore(a);
    });
    featuredMatches.push(matches[0]);
});


  // Sort featured matches by competition importance
  featuredMatches.forEach(match => {
    match.match_priority_score = calculateMatchScore(match);
  });

  featuredMatches.sort((a, b) =>
    b.match_priority_score - a.match_priority_score
  );

  const result = featuredMatches.slice(0, limit);

    // Cache result
    getMatchesCache.set(cacheKey, result);

    res.json(result);

  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



let currentTopScorerSeason = getCurrentSeason();

// function to fetch top scorer
const topScorersCache = new NodeCache({ stdTTL: 60 });

// --- CONFIG ---
const leaguesToFetch = [
  1, //World Cup
  152, //Premier League
  153, //Championship
  154, //League One
  155, //League Two
  302, //La Liga
  303, //La Liga 2
  207, //Serie B
  208, //Serie A
  175, //Bundesliga
  176, //Bundesliga 2
  168, //Ligue 1
  169, //Ligue 2
  3, //Champions League
  848, //Europa League
  23, //Europa Conference League
  4, //Euro Championship
  12, //CAF Champions League
  20, //Africa Cup of Nations
  403, //NPFL
];

// Display names for leagues
const leagueNames = {
  // England
  152: "Premier League",
  153: "Championship",
  154: "League One",
  155: "League Two",

  // Spain
  302: "La Liga",
  303: "La Liga 2",

  // Italy
  207: "Serie B",
  208: "Serie A",
  // Germany
  175: "Bundesliga",
  176: "Bundesliga 2",

  // France
  168: "Ligue 1",
  169: "Ligue 2",

  // Europe (UEFA)
  3: "Champions League",
  848: "Europa League",
  23: "Europa Conference League",

  // International
  1: "World Cup",
  4: "Euro Championship",

  // Africa
  12: "CAF Champions League",
  20: "Africa Cup of Nations",

  // Nigeria (if you plan local coverage)
  403: "NPFL"
};

// truncate helper
function truncateWords(str, limit = 2) {
  if (!str) return str;
  return str.split(" ").slice(0, limit).join(" ");
}

// season helper
function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  
}

// MAIN ENDPOINT
exports.getTopScorers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200;

    const season = getCurrentSeason();
      if (season !== currentTopScorerSeason) {
        console.log("New season detected. Clearing top scorers cache.");
        topScorersCache.flushAll();

       currentTopScorerSeason = season;
      }
    
    const cacheKey = `topscorers_${season}_${limit}`;

    // Serve cached version
    const cached = topScorersCache.get(cacheKey);
    if (cached) {
      console.log("Returning cached top scorers");
      return res.json(cached);
    }

    let results = [];

    for (const leagueId of leaguesToFetch) {
      const currentYear = new Date().getFullYear();

        const seasonToUse =
          leagueId === 1 ||   // World Cup
          leagueId === 4 ||   // Euro
          leagueId === 20     // AFCON
           ? currentYear
           : season;
       try {
        const url =
          `https://apiv3.apifootball.com/?action=get_topscorers&league_id=${leagueId}&season=${seasonToUse}&APIkey=${APIkey}`;
        const data = await fetchRetry(url);

        if (!Array.isArray(data) || data.length === 0) continue;

        // sort by highest goals
        data.sort((a, b) => Number(b.goals) - Number(a.goals));

        const highestGoals = Number(data[0].goals) || 0;
        if (highestGoals === 0) continue;

        // include ties
        const topPlayers = data.filter(
          (p) => Number(p.goals) === highestGoals
        );

        for (const p of topPlayers) {
          results.push({
            priority: LEAGUE_PRIORITY[leagueId] || 0,
            league: leagueNames[leagueId] || "Unknown League",
            player: p.player_name,
            goals: highestGoals,
            team: truncateWords(p.team_name),
            image: p.player_image || ""
          });
        }
      } catch (leagueErr) {
        console.warn(`Skipped league ${leagueId}:`, leagueErr.message);
      }
    }

    results.sort((a, b) => {

      if (b.priority !== a.priority)
         return b.priority - a.priority;

      if (b.goals !== a.goals)
         return b.goals - a.goals;

      return a.player.localeCompare(b.player);

     });

    // limit
    if (results.length > limit) {
      results = results.slice(0, limit);
    }

    // save to cache
    topScorersCache.set(cacheKey, results);

    return res.json(results);

  } catch (err) {
    console.error("❌ Topscorers backend error:", err.stack);
    return res.status(500).json({
      error: "Failed to fetch top scorers",
      details: err.message,
    });
  }
};


// Get the active league ID

// cache for 10 minutes
const leaguesCache = new NodeCache({ stdTTL: 500 }); 

exports.getLeagues = async (req, res) => {
  const cacheKey = 'allLeagues';
  const cached = leaguesCache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await fetch(`https://apiv3.apifootball.com/?action=get_leagues&APIkey=${APIkey}`);
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'Failed to fetch leagues', details: text });
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Invalid response structure for leagues' });
    }

    //Set to cache
    leaguesCache.set(cacheKey, data);

    res.json(data);
  } catch (err) {
    console.error("Error fetching leagues:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



//league table for 5 team top beased on ranking

 const standingCache = new NodeCache({stdTTL: 600}); // cache for 10 minutes

 //standingCache.flushAll();

  const FEATURED_LEAGUES = {
    worldCup: {
        id: 1,
        name: "World Cup",
        startMonth: 6,
        endMonth: 7
    },

    premierLeague: {
        id: 152,
        name: "Premier League",
        startMonth: 8,
        endMonth: 5
    },

    npfl: {
        id: 403,
        name: "NPFL",
        startMonth: 1,
        endMonth: 12
    }

  };

  function getWorldCupGroupStandings(group){

    const groups = {

        "Group A":[
            {
                country:"Mexico",
                flag:"🇲🇽",
                played:0,
                won:0,
                drawn:0,
                lost:0,
                goalsFor:0,
                goalsAgainst:0,
                points:0
            },
            {
                country:"South Africa",
                flag:"🇿🇦",
                played:0,
                won:0,
                drawn:0,
                lost:0,
                goalsFor:0,
                goalsAgainst:0,
                points:0
            },
            {
                country:"South Korea",
                flag:"🇰🇷",
                played:0,
                won:0,
                drawn:0,
                lost:0,
                goalsFor:0,
                goalsAgainst:0,
                points:0
            },
            {
                country:"UEFA Playoff Winner",
                flag:"🌍",
                played:0,
                won:0,
                drawn:0,
                lost:0,
                goalsFor:0,
                goalsAgainst:0,
                points:0
            }
        ]

    };


    return groups[group] || [];

}

 function getFeaturedLeague(){

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth()+1;


    // FIFA World Cup 2026
    if(
        year === 2026 &&
        month >= 6 &&
        month <= 7
    ){

        return FEATURED_LEAGUES.worldCup;

    }
    // Default football season
    return FEATURED_LEAGUES.premierLeague;
  }

  exports.getTopStandings = async (req, res) => {
    const featuredLeague = getFeaturedLeague();
    const leagueId = featuredLeague.id;
    const season = getCurrentSeason();
    const currentYear = new Date().getFullYear();

    const seasonToUse =
    leagueId === 1
        ? currentYear
        : season;

    const cacheKey = `standings_${featuredLeague.name}_${seasonToUse}`;

    // Check cache
    const cached = standingCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

   try {
     const response = await fetch(
     `https://apiv3.apifootball.com/?action=get_standings&league_id=${leagueId}&season=${seasonToUse}&APIkey=${APIkey}`
   );
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'Failed to fetch standings', details: text });
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {

    if(featuredLeague.name === "World Cup"){

    const standings =
     await getWorldCupGroupStandings("Group A");


     return res.json({
      league:"World Cup",
      group:"Group A",
      standings
    });
    }

     return res.status(404).json({
        error: 'No standings data found.'
     });
    }

    const topFive = data.slice(0, 5);

     // Save to cache
     const result = {
      league: featuredLeague.name,
      leagueId: featuredLeague.id,
      group: leagueId === 1 ? "Group A" : null,
      season: seasonToUse,
      standings: topFive
     };

 standingCache.set(cacheKey, result);

return res.json(result);
  } catch (error) {
    console.error("Error fetching standings:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Function to fetch all matches with caching

const allMatchesCache = new NodeCache({ stdTTL: 900 }); // cache for 5 minutes

// Format YYYY-MM-DD
const formatDate = (date) => date.toISOString().split("T")[0];

// Fetch matches for ONE day (fast)
async function fetchDay(date) {
  const cacheKey = `day_${date}`;
  const cached = allMatchesCache.get(cacheKey);
  if (cached) return cached;

  const url = `https://apiv3.apifootball.com/?action=get_events&from=${date}&to=${date}&APIkey=${APIkey}&timezone=Europe/Berlin`;

  try {
    const res = await fetch(url, { timeout: 5000 });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    allMatchesCache.set(cacheKey, data);
    return data;
  } catch (e) {
    return [];
  }
}

exports.getAllMatches = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = formatDate(today);

    // Fetch TODAY ONLY (fast!)
    const todayMatches = await fetchDay(todayStr);

    const matchesData = {
      live: todayMatches.filter(m => {
        const s = m.match_status?.trim().toLowerCase();
        return s === "live" || (parseInt(s) > 0 && parseInt(s) < 90);
      }),
      highlight: todayMatches.filter(m => m.match_status === "Finished"),
      upcoming: todayMatches.filter(m => !m.match_status),
    };

    // Return instantly
    res.json(matchesData);

    // 🔥 Background: prefetch other days (non-blocking)
    const datesToPrefetch = [];
    for (let i = -7; i <= 7; i++) {
      if (i !== 0) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        datesToPrefetch.push(formatDate(d));
      }
    }

    datesToPrefetch.forEach(date => fetchDay(date)); // runs silently

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch match data" });
  }
};


//cntroller to get matches by date and cache 

const matchesByDateCache = new NodeCache({ stdTTL: 60 }); // cache for 1 minutes

exports.getMatchesByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }

  const cacheKey = `matchesByDate_${date}`;
  const cached = matchesByDateCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const url = `https://apiv3.apifootball.com/?action=get_events&from=${date}&to=${date}&APIkey=${APIkey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: "Failed to fetch from API", details: text });
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }

    const filtered = {
      live: [],
      highlight: [],
      upcoming: []
    };

    for (const match of data) {
      const status = match.match_status?.toLowerCase() || "";

      if (status.includes("ht") || (parseInt(status) > 0 && parseInt(status) < 90)) {
        filtered.live.push(match);
      } else if (status === "ft" || status === "finished") {
        filtered.highlight.push(match);
      } else {
        filtered.upcoming.push(match);
      }
    }

    // ✅ Set cache
    matchesByDateCache.set(cacheKey, filtered);

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching matches by date:", err);
    res.status(500).json({ error: "Failed to fetch match data" });
  }
};



//function to load statistic

const matchStatsCache = new NodeCache({ stdTTL: 60 }); // cache for 1 minutes

exports.getMatchStatistics = async (req, res) => {
  const { matchId } = req.query;

  if (!matchId) {
    return res.status(400).json({ error: 'Missing matchId parameter' });
  }

  const cacheKey = `matchStats_${matchId}`;
  const cached = matchStatsCache.get(cacheKey);
  if (cached) {
    return res.json({ statistics: cached });
  }

  try {
    const response = await fetch(`https://apiv3.apifootball.com/?action=get_statistics&match_id=${matchId}&APIkey=${APIkey}`);

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: "Failed to fetch from API", details: text });
    }

    const data = await response.json();

    const stats = data[matchId]?.statistics || [];

    // ✅ Set cache
    matchStatsCache.set(cacheKey, stats);

    res.json({ statistics: stats });
  } catch (error) {
    console.error("📉 Error fetching match statistics:", error);
    res.status(500).json({ error: 'Failed to fetch match statistics' });
  }
};


//functkion to det h2h
const h2hCache = new NodeCache({ stdTTL: 600 }); // Cache duration: 10 minutes

//function to det h2h
exports.getH2HData = async (req, res) => {
  const { homeTeam, awayTeam } = req.query;

  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'Missing homeTeam or awayTeam' });
  }

  const cacheKey = `h2h_${homeTeam}_${awayTeam}`;
  const cached = h2hCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const url = `https://apiv3.apifootball.com/?action=get_H2H&firstTeam=${encodeURIComponent(homeTeam)}&secondTeam=${encodeURIComponent(awayTeam)}&APIkey=${APIkey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'API Error', details: text });
    }

    const data = await response.json();

    const result = {
      h2h: data.firstTeam_VS_secondTeam || [],
      homeLast: data.firstTeam_lastResults || [],
      awayLast: data.secondTeam_lastResults || []
    };

    //Cache
    h2hCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error("H2H Fetch Error:", error);
    res.status(500).json({ error: 'Internal server error while fetching H2H data' });
  }
};



//function to load standings
const standingsCache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

// controller
exports.getStandings = async (req, res) => {
  const { leagueId } = req.query;

  if (!leagueId) {
    return res.status(400).json({ error: "Missing leagueId parameter" });
  }

  const cacheKey = `standings_${leagueId}`;
  const cached = standingsCache.get(cacheKey);

  if (cached) {
    return res.json({ leagueId, standings: cached }); //include leagueId
  }

  try {
    const url = `https://apiv3.apifootball.com/?action=get_standings&league_id=${leagueId}&APIkey=${APIkey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        leagueId,
        error: "Failed to fetch standings",
        details: text
      });
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("Invalid API response structure:", data);
      standingsCache.set(cacheKey, []); 
      return res.json({ leagueId, standings: [] }); //include leagueId
    }

    //Save to cache
    standingsCache.set(cacheKey, data);

    //Always return consistent shape
    res.json({ leagueId, standings: data });

  } catch (error) {
    console.error("Standings fetch error (backend):", error);
    res.status(500).json({ leagueId, error: "Server error fetching standings" });
  }
};

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

//lineupController.js
const lineupCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

exports.getLineups = async (req, res) => {
  const { matchId } = req.query;

  if (!matchId) {
    return res.status(400).json({ error: "Missing matchId parameter" });
  }

  const cacheKey = `lineup_${matchId}`;
  const cached = lineupCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    // Fetch both endpoints in parallel
    const [lineupRes, eventRes] = await Promise.all([
      fetch(`https://apiv3.apifootball.com/?action=get_lineups&match_id=${matchId}&APIkey=${APIkey}`),
      fetch(`https://apiv3.apifootball.com/?action=get_events&match_id=${matchId}&APIkey=${APIkey}`)
    ]);

    if (!lineupRes.ok || !eventRes.ok) {
      return res.status(502).json({ error: "API response failed" });
    }

    const lineupData = await safeJson(lineupRes);
    const eventData = await safeJson(eventRes);

    const lineup = lineupData[matchId]?.lineup || null;
    const match = Array.isArray(eventData) ? eventData[0] : eventData[matchId];

    const responsePayload = { lineup, match };

    lineupCache.set(cacheKey, responsePayload);

    res.json(responsePayload);
  } catch (err) {
    console.error("Error fetching lineups/events:", err);
    res.status(500).json({ error: "Failed to fetch lineup data" });
  }
};


// prediction 
const predictionCache = new NodeCache({ stdTTL: 300 });

const getDateString = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

exports.getTodayPredictions = async (req, res) => {
  const cacheKey = "todayPredictions";
  const cached = predictionCache.get(cacheKey);

  if (cached) return res.json(cached);

  const today = getDateString();

  try {
    const response = await fetch(
      `https://apiv3.apifootball.com/?action=get_predictions&from=${today}&to=${today}&APIkey=${APIkey}`
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Prediction API error:", data);
      return res.status(500).json([]);
    }

    const enriched = data.map(match => ({
      match_id: match.match_id,
      home: match.match_hometeam_name,
      away: match.match_awayteam_name,
      time: match.match_time,
      status: match.match_status,
      live: match.match_live,
      league_name: match.league_name,
      homeScore: match.match_hometeam_score,
      awayScore: match.match_awayteam_score,
      prob_home: parseFloat(match.prob_HW || 0),
      prob_away: parseFloat(match.prob_AW || 0),
      prob_draw: parseFloat(match.prob_D || 0)
    }));

    predictionCache.set(cacheKey, enriched);

    res.json(enriched);

  } catch (error) {
    console.error("Backend prediction error:", error);
    res.status(500).json([]);
  }
};