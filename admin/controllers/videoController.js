const https = require("https");

exports.getMatchVideo = async (req, res) => {
  const { homeTeam, awayTeam } = req.query;

  const options = {
    method: "GET",
    hostname: "football-live-stream-api.p.rapidapi.com",
    path: "/all-match",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "football-live-stream-api.p.rapidapi.com"
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      try {
        const apiData = JSON.parse(data);

        // Ensure we have an array
        const matches = Array.isArray(apiData)
          ? apiData
          : apiData.data || [];

          const leagues = [...new Set(matches.map(m => m.league))];

console.log("=== AVAILABLE LEAGUES ===");
leagues.sort().forEach(league => console.log(league));
console.log("========================");

        console.log("Searching Stream Match:");
        console.log("Home Team:", homeTeam);
        console.log("Away Team:", awayTeam);

        // Normalize names for comparison
        const normalize = (str = "") =>
          str
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .trim();

        const match = matches.find((m) =>
          normalize(m.home_name) === normalize(homeTeam) &&
          normalize(m.away_name) === normalize(awayTeam)
        );

        if (!match) {
          console.log("No stream match found");

          return res.status(404).json({
            success: false,
            message: "Match not found"
          });
        }

        console.log(
          "Matched Stream:",
          JSON.stringify(match, null, 2)
        );

        res.json({
          success: true,
          streamMatchId: match.id,
          match
        });

      } catch (err) {
        console.error("Video API Parse Error:", err);

        res.status(500).json({
          success: false,
          error: err.message
        });
      }
    });
  });

  apiReq.on("error", (err) => {
    console.error("RapidAPI Error:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  });

  apiReq.end();
};