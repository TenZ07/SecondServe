const express = require('express');
const {
  addFood,
  getFoodListings,
  reserveFood,
  cancelReservation,
  markAsCollected,
  getFoodByHostel
} = require('../controllers/food.controller');

const router = express.Router();

router.post('/', addFood);
router.get('/', getFoodListings);
router.get('/hostel/:hostelId', getFoodByHostel);
router.put('/:id/reserve', reserveFood);
router.put('/:id/cancel', cancelReservation);
router.put('/:id/mark-collected', markAsCollected);

module.exports = router;