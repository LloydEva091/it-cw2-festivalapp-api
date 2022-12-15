const express = require('express');
const router = express.Router();
const {
    getAllComedians,
    createNewComedian,
    updateComedian,
    deleteComedian,
    getAComedian
} = require("../controllers/comediansController")
const protect = require("../middleware/authMiddleware")


router.get("/", getAllComedians)
router.post("/", protect, createNewComedian)
router.route("/:id").get(protect, getAComedian).put(protect, updateComedian).delete(protect, deleteComedian)

module.exports = router;

