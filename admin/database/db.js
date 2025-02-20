const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Database Connected"))
  .catch(err => console.error("❌ Database Connection Error:", err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
});

const dataSchema = new mongoose.Schema({
    liveMatch: {
        team1: String,
        team2: String,
        league: String
    },
    newsUpdate: {
        image: String,
        headline: String
    }
});

const User = mongoose.model("User", userSchema);
const Data = mongoose.model("Data", dataSchema);

module.exports = { User, Data };

