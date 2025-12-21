// routes/food.routes.js
const express = require('express');
const {
  addFood,
  getFoodListings,
  claimFood,
  collectFood
} = require('../controllers/food.controller');

const router = express.Router();

router.post('/', addFood);
router.get('/', getFoodListings);
router.put('/:id/claim', claimFood);
router.put('/:id/collect', collectFood);

module.exports = router;