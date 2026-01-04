// src/pages/HostelDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser,clearUser } from '../utils/auth';

export default function HostelDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hostelId: '', // will be filled after login (for MVP, user enters it manually)
    foodType: 'VEG',
    quantity: 10,
    availableUntil: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

 useEffect(() => {
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return;
  }
  // Auto-fill hostelId from logged-in user
  setFormData(prev => ({
    ...prev,
    hostelId: user._id
  }));
  }, [navigate]);

  // For MVP: we don't have "logged-in user" context, so we ask hostelId
  // Later: we'll store user after login and auto-fill this

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.hostelId || !formData.availableUntil) {
      setError('Please fill all fields');
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post('/api/food', formData);
      console.log('Food added:', res.data);
      alert('Food listing added!');
      setFormData({
        ...formData,
        foodType: 'VEG',
        quantity: 10,
        availableUntil: '',
        location: ''
      });
      fetchFoods(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add food');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await axios.get('/api/food'); // gets AVAILABLE only
      setFoods(res.data);
    } catch (err) {
      setError('Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Later: replace this with real user session
  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-violet-800">Hostel Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-violet-600 hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Add Food Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Excess Food</h2>
          
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Hostel ID
              </label>
              <input
                type="text"
                readOnly
                value={formData.hostelId}
                className="w-full px-3 py-2 bg-gray-100 rounded cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Type
                </label>
                <select
                  name="foodType"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={formData.foodType}
                  onChange={handleInputChange}
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (servings)
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Until (Date & Time) *
              </label>
              <input
                type="datetime-local"
                name="availableUntil"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={formData.availableUntil}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Pickup Address) *
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., 123 Hostel St, San Francisco, CA"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Food Listing'}
            </button>
          </form>
        </div>

        {/* Food Listings */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Food Listings</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading food listings...</p>
          ) : foods.length === 0 ? (
            <p className="text-gray-500">No available food listings.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foods.map((food) => (
                <div key={food._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        food.foodType === 'VEG' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {food.foodType}
                      </span>
                      <h3 className="font-medium mt-1">Qty: {food.quantity}</h3>
                      <p className="text-sm text-gray-600 mt-1">📍 {food.location}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {food.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Until: {new Date(food.availableUntil).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}