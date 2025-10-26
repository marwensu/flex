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

// POST approve a review (legacy route)
router.post("/approve", (req, res) => {
  try {
    const { reviewId } = req.body;
    const approvedPath = path.join(__dirname, "../data/approvedReviews.json");
    
    // Get all reviews
    const allReviews = hostawayService.getNormalizedReviewsSync();
    const reviewToApprove = allReviews.find(r => r.id === reviewId);
    
    if (!reviewToApprove) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Read current approved reviews
    let approved = [];
    if (fs.existsSync(approvedPath)) {
      const data = fs.readFileSync(approvedPath);
      approved = JSON.parse(data);
    }
    
    // Check if already approved
    if (approved.some(r => r.id === reviewId)) {
      return res.status(400).json({ error: "Review already approved" });
    }
    
    // Add approved timestamp
    reviewToApprove.approvedAt = new Date().toISOString();
    approved.push(reviewToApprove);
    
    // Save to file
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
    
    res.json({ message: "Review approved successfully", review: reviewToApprove });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove approval
router.delete("/approve/:reviewId", (req, res) => {
  try {
    const { reviewId } = req.params;
    const approvedPath = path.join(__dirname, "../data/approvedReviews.json");
    
    if (!fs.existsSync(approvedPath)) {
      return res.status(404).json({ error: "No approved reviews found" });
    }
    
    const data = fs.readFileSync(approvedPath);
    let approved = JSON.parse(data);
    
    // Filter out the review
    approved = approved.filter(r => r.id !== parseInt(reviewId));
    
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
    
    res.json({ message: "Approval removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
