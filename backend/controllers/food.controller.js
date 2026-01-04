const Food = require('../models/food');
const User = require('../models/user');
const mongoose = require('mongoose');

const addFood = async (req, res) => {
  try {
    const { hostelId, foodType, quantity, availableUntil, location } = req.body;

    if (!hostelId || !foodType || !quantity || !availableUntil || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hostel = await User.findById(hostelId);
    if (!hostel || hostel.role !== 'HOSTEL') {
      return res.status(400).json({ message: 'Invalid hostel ID' });
    }

    const food = await Food.create({
      hostelId,
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
    const foods = await Food.find({ hostelId }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFoodListings = async (req, res) => {
  try {
    const foods = await Food.find({ status: 'AVAILABLE' }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const claimFood = async (req, res) => {
  try {
    const { claimedBy } = req.body;
    const foodId = req.params.id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Food is not available' });
    }

    const volunteer = await User.findById(claimedBy);
    if (!volunteer || volunteer.role !== 'VOLUNTEER') {
      return res.status(400).json({ message: 'Invalid volunteer ID' });
    }

    food.status = 'CLAIMED';
    food.claimedBy = claimedBy;
    await food.save();

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const collectFood = async (req, res) => {
  try {
    const foodId = req.params.id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.status !== 'CLAIMED') {
      return res.status(400).json({ message: 'Food must be claimed first' });
    }

    food.status = 'COLLECTED';
    await food.save();

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addFood,
  getFoodListings,
  claimFood,
  collectFood,
  getFoodByHostel
};