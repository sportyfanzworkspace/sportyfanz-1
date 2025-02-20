require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User, Data } = require("../database/db.js");


const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(cors());

const users = [
    { username: "admin", password: "$2b$10$GjGWA1HRyM3nEd1blk/DD.sdCmes8IUQj1H9eIIAyD4lvesQ/4yTq", role: "super-admin" }, // Password: Admin@123
    { username: "editor", password: "$2b$10$iphbCHYYvUQ7fl239Hf6Ge2K6yO2NdBYRcGwN.LPjUbVtOsigNYLa", role: "editor" }  // Password: Editor@123
];

// 🔐 Secure Login Endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// 🛡️ Middleware to Protect Routes
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Access denied" });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// 📌 Protected Admin Dashboard Route
app.get("/admin-dashboard", verifyToken, (req, res) => {
    console.log("User Data from Token:", req.user); // ✅ Log decoded token
    if (req.user.role !== "super-admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    res.json({ message: "Welcome to Admin Dashboard" });
});



// Get Data for Visitors Dashboard
app.get("/data", async (req, res) => {
    try {
        const data = await Data.findOne();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Update Data from Admin Dashboard
app.post("/update", async (req, res) => {
    try {
        const { team1, team2, league, image, headline } = req.body;
        let data = await Data.findOne();

        if (!data) data = new Data({ liveMatch: {}, newsUpdate: {} });

        if (team1) data.liveMatch.team1 = team1;
        if (team2) data.liveMatch.team2 = team2;
        if (league) data.liveMatch.league = league;
        if (image) data.newsUpdate.image = image;
        if (headline) data.newsUpdate.headline = headline;

        await data.save();
        res.json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


// Admin Dashboard Script (admin-dashboard.js)
document.getElementById("update-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    const league = document.getElementById("league").value;
    const image = document.getElementById("news-image").value;
    const headline = document.getElementById("news-headline").value;

    await fetch("http://localhost:5000/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1, team2, league, image, headline })
    });
    alert("Updated Successfully");
});


// Visitors Dashboard Script (visitors-dashboard.js)
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://localhost:5000/data");
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const data = await response.json();
        if (!data) return;

        const teams = document.querySelectorAll(".live-match-demo .team");
        if (teams.length === 2) {
            teams[0].textContent = data.liveMatch?.team1 || "Team 1";
            teams[1].textContent = data.liveMatch?.team2 || "Team 2";
        }
        document.querySelector(".game-leag").textContent = data.liveMatch?.league || "League Name";
        document.querySelector(".news-image img").src = data.newsUpdate?.image || "default-news.jpg";
        document.querySelector(".news-headline").textContent = data.newsUpdate?.headline || "Latest News Headline";
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});


// Export `app` to use in `index.js`
module.exports = app;
