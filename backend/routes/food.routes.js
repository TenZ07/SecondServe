const express = require('express');
const {
  addFood,
  getFoodListings,
  reserveFood,
  cancelReservation,
  markAsCollected,
  getFoodByHostel,
  upload
} = require('../controllers/food.controller');

const router = express.Router();

router.post('/', upload.single('image'), addFood);
router.get('/', getFoodListings);
router.get('/hostel/:hostelId', getFoodByHostel);
router.put('/:id/reserve', reserveFood);
router.put('/:id/cancel', cancelReservation);
router.put('/:id/mark-collected', markAsCollected);

module.exports = router;