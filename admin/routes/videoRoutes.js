const express = require("express");
const router = express.Router();
const {
  getMatchVideo
  } = require("../controllers/videoController");

  router.get("/:matchId", getMatchVideo);

  module.exports = router;

