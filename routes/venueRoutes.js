const express = require('express');
const router = express.Router();
const {
  getAllVenues,
  createNewVenue,
  updateVenue,
  deleteVenue,
} = require("../controllers/venuesController")
const protect = require("../middleware/authMiddleware")

router.get("/", getAllVenues)
router.post("/", protect, createNewVenue)
router.route("/:id").put(protect, updateVenue).delete(protect, deleteVenue)

module.exports = router