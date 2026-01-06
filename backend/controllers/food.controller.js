const Food = require('../models/food');
const User = require('../models/user');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const addFood = async (req, res) => {
  try {
    const { hostelId, foodName, description, foodType, quantity, availableUntil, location } = req.body;

    if (!hostelId || !foodName || !foodType || !quantity || !availableUntil || !location) {
      return res.status(400).json({ message: 'Required fields: hostelId, foodName, foodType, quantity, availableUntil, location' });
    }

    const hostel = await User.findById(hostelId);
    if (!hostel || hostel.role !== 'HOSTEL') {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }

    // Handle image - use uploaded file or default image
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      imageUrl = '/second-serve/default-food.svg';
    }

    const food = await Food.create({
      hostelId,
      foodName,
      description: description || '',
      imageUrl,
      foodType,
      quantity,
      availableUntil,
      location
    });

    res.status(201).json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFoodByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }
    const foods = await Food.find({ hostelId })
      .populate('reservedBy', 'name')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFoodListings = async (req, res) => {
  try {
    // Get all foods with populated user names for display
    const foods = await Food.find({})
      .populate('reservedBy', 'name')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reserveFood = async (req, res) => {
  try {
    const { reservedBy } = req.body;
    const foodId = req.params.id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Food is not available for reservation' });
    }

    const volunteer = await User.findById(reservedBy);
    if (!volunteer || volunteer.role !== 'VOLUNTEER') {
      return res.status(400).json({ message: 'Invalid volunteer ID' });
    }

    // Check if this volunteer has previously reserved this food and let it expire
    const hasExpiredReservation = food.reservationHistory.some(
      history => history.userId.toString() === reservedBy && history.expired
    );

    if (hasExpiredReservation) {
      return res.status(400).json({ message: 'You cannot reserve this food again after letting a previous reservation expire' });
    }

    food.status = 'RESERVED';
    food.reservedBy = reservedBy;
    food.reservedAt = new Date();
    await food.save();

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { userId } = req.body;
    const foodId = req.params.id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Food is not reserved' });
    }

    if (food.reservedBy.toString() !== userId) {
      return res.status(400).json({ message: 'You can only cancel your own reservation' });
    }

    food.status = 'AVAILABLE';
    food.reservedBy = null;
    food.reservedAt = null;
    await food.save();

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsCollected = async (req, res) => {
  try {
    const foodId = req.params.id;
    const { hostelId } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Food must be reserved first' });
    }

    // Verify this is the correct hostel
    if (food.hostelId.toString() !== hostelId) {
      return res.status(400).json({ message: 'You can only mark your own food as collected' });
    }

    // Check if reservation has expired (2 hours)
    const reservationTime = new Date(food.reservedAt);
    const currentTime = new Date();
    const timeDiff = (currentTime - reservationTime) / (1000 * 60 * 60); // in hours

    if (timeDiff > 2) {
      // Mark reservation as expired and make available
      food.reservationHistory.push({
        userId: food.reservedBy,
        reservedAt: food.reservedAt,
        expired: true
      });
      food.status = 'AVAILABLE';
      food.reservedBy = null;
      food.reservedAt = null;
      await food.save();
      return res.status(400).json({ message: 'Reservation has expired. Food is now available for others.' });
    }

    food.status = 'COLLECTED';
    food.collectedBy = food.reservedBy; // The person who reserved it is the one who collected it
    await food.save();

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility function to check and expire reservations
const checkExpiredReservations = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const expiredReservations = await Food.find({
      status: 'RESERVED',
      reservedAt: { $lt: twoHoursAgo }
    });

    for (const food of expiredReservations) {
      food.reservationHistory.push({
        userId: food.reservedBy,
        reservedAt: food.reservedAt,
        expired: true
      });
      food.status = 'AVAILABLE';
      food.reservedBy = null;
      food.reservedAt = null;
      await food.save();
    }
  } catch (error) {
    console.error('Error checking expired reservations:', error);
  }
};

module.exports = {
  addFood,
  getFoodListings,
  reserveFood,
  cancelReservation,
  markAsCollected,
  getFoodByHostel,
  checkExpiredReservations,
  upload
};