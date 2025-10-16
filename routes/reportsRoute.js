const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const reportsController = require("../controllers/reportsController");

// Public access: no session required
router.get(
  "/",
  utilities.handleErrors(async (req, res) => {
    try {
      const data = await reportsController.buildDashboard(req, res);
      res.render("reports/dashboard", { data, user: null }); 
    } catch (err) {
      console.error(err);
      res.status(500).send("Sorry, we appear to have lost that page.");
    }
  })
);

module.exports = router;
