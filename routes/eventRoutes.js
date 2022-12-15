const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    createNewEvent,
    updateEvent,
    deleteEvent,
    getAnEvent
} = require("../controllers/eventsController")
const protect = require("../middleware/authMiddleware");

router.get("/", getAllEvents)
router.post("/", protect, createNewEvent)
router.route("/:id").get(protect, getAnEvent).patch(protect, updateEvent).delete(protect, deleteEvent)

module.exports = router;