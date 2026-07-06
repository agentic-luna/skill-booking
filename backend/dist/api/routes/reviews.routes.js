"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, reviews_controller_1.ReviewsController.createReview);
router.get('/event/:eventId', reviews_controller_1.ReviewsController.getEventReviews);
exports.default = router;
