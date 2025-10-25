const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const hostawayService = require("../services/hostawayService");
const fs = require("fs");
const path = require("path");

// GET all normalized reviews from Hostaway
router.get("/hostaway", reviewController.getAllReviews);

// GET reviews with filters
router.get("/search", reviewController.getFilteredReviews);

// GET review statistics
router.get("/stats", reviewController.getReviewStats);

// GET all approved reviews (MUST be before /:id route)
router.get("/approved", reviewController.getApprovedReviews);

// GET a specific review by ID (MUST be after specific routes)
router.get("/:id", reviewController.getReviewById);

// POST approve a review
router.post("/:id/approve", reviewController.approveReview);

// DELETE unapprove a review
router.delete("/:id/approve", reviewController.unapproveReview);

module.exports = router;
