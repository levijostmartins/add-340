const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");

const searchController = {};

/* ****************************************
 * Display search page
 **************************************** */
searchController.buildSearch = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const makes = await inventoryModel.getAllMakes();
    const models = await inventoryModel.getAllModels();

    res.render("search/search", {
      title: "Inventory Search",
      nav,
      results: [],
      make: "",
      model: "",
      yearMin: "",
      yearMax: "",
      priceMin: "",
      priceMax: "",
      makes,
      models,
      messages: req.flash("notice"),
    });
  } catch (err) {
    console.error("Error building search page:", err);
    req.flash("notice", "Unable to load search page.");
    res.render("search/search", {
      title: "Inventory Search",
      nav: [],
      results: [],
      make: "",
      model: "",
      yearMin: "",
      yearMax: "",
      priceMin: "",
      priceMax: "",
      makes: [],
      models: [],
      messages: req.flash("notice"),
    });
  }
};

/* ****************************************
 * Process search form
 **************************************** */
searchController.processSearch = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const { make, model, yearMin, yearMax, priceMin, priceMax } = req.body;

    const makes = await inventoryModel.getAllMakes();
    const models = await inventoryModel.getAllModels();

    if (!make && !model && !yearMin && !yearMax && !priceMin && !priceMax) {
      req.flash("notice", "Please select at least one search filter.");
      return res.render("search/search", {
        title: "Inventory Search",
        nav,
        results: [],
        make,
        model,
        yearMin,
        yearMax,
        priceMin,
        priceMax,
        makes,
        models,
        messages: req.flash("notice"),
      });
    }

    const filters = {
      make,
      model,
      yearMin: yearMin ? Number(yearMin) : null,
      yearMax: yearMax ? Number(yearMax) : null,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
    };

    let results = await inventoryModel.searchInventory(filters);

    // Ensure safe defaults for rendering
    results = results.map(v => ({
      ...v,
      inv_make: v.inv_make || "N/A",
      inv_model: v.inv_model || "N/A",
      inv_year: v.inv_year || "N/A",
      inv_price: v.inv_price || 0,
    }));

    res.render("search/search", {
      title: "Search Results",
      nav,
      results,
      make,
      model,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      makes,
      models,
      messages: results.length === 0 ? ["No results found."] : req.flash("notice"),
    });
  } catch (err) {
    console.error("Search error:", err);
    req.flash("notice", "There was a problem processing your search.");
    res.render("search/search", {
      title: "Inventory Search",
      nav: [],
      results: [],
      make: req.body.make || "",
      model: req.body.model || "",
      yearMin: req.body.yearMin || "",
      yearMax: req.body.yearMax || "",
      priceMin: req.body.priceMin || "",
      priceMax: req.body.priceMax || "",
      makes: [],
      models: [],
      messages: req.flash("notice"),
    });
  }
};

module.exports = searchController;
