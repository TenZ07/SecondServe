import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { getUserFromToken, clearToken } from '../utils/auth';

export default function HostelDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hostelId: '',
    foodType: 'VEG',
    quantity: 10,
    availableUntil: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || user.role !== 'HOSTEL') {
      navigate('/login');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      hostelId: user._id
    }));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.hostelId || !formData.availableUntil || !formData.location) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/food', formData);
      alert('Food listing added!');
      setFormData({
        hostelId: formData.hostelId,
        foodType: 'VEG',
        quantity: 10,
        availableUntil: '',
        location: ''
      });
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add food');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const user = getUserFromToken();
      const res = await api.get(`/food/hostel/${user._id}`);
      setFoods(res.data);
    } catch (err) {
      setError('Failed to load your food listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (foodId) => {
    try {
      await api.put(`/food/${foodId}/collect`);
      alert('Food marked as collected!');
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as collected');
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  useEffect(() => {
    fetchFoods();
  }, []);

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
                Your Hostel ID (auto-filled)
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
                min={new Date().toISOString().slice(0, 16)}
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Food Listings</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading food listings...</p>
          ) : foods.length === 0 ? (
            <p className="text-gray-500">No food listings found.</p>
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
                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                      food.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
                      food.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {food.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Until: {new Date(food.availableUntil).toLocaleString()}
                  </p>
                  {food.status === 'CLAIMED' && (
                    <button
                      onClick={() => handleCollect(food._id)}
                      className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Mark as Collected
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}