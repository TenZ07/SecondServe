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
    foodName: '',
    description: '',
    imageUrl: '',
    foodType: 'VEG',
    quantity: 10,
    availableUntil: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUserFromToken();
    if (!currentUser || currentUser.role !== 'HOSTEL') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData((prev) => ({
      ...prev,
      hostelId: currentUser._id
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

    if (!formData.hostelId || !formData.foodName || !formData.availableUntil || !formData.location) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/food', formData);
      alert('Food listing added!');
      setFormData({
        hostelId: formData.hostelId,
        foodName: '',
        description: '',
        imageUrl: '',
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
      const currentUser = getUserFromToken();
      const res = await api.get(`/food/hostel/${currentUser._id}`);
      setFoods(res.data);
    } catch (err) {
      setError('Failed to load your food listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (foodId) => {
    try {
      const currentUser = getUserFromToken();
      await api.put(`/food/${foodId}/mark-collected`, { hostelId: currentUser._id });
      alert('Food collection confirmed!');
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm collection');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to delete your account');
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/auth/user/${user._id}`, {
        data: { password: deletePassword }
      });
      alert('Account deleted successfully');
      clearToken();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Separate foods by status
  const availableFoods = foods.filter(food => food.status === 'AVAILABLE');
  const reservedFoods = foods.filter(food => food.status === 'RESERVED');
  const collectedFoods = foods.filter(food => food.status === 'COLLECTED');

  const renderFoodCard = (food) => (
    <div key={food._id} className="bg-white p-4 rounded-lg border shadow-sm">
      <img 
        src={food.imageUrl && food.imageUrl.trim() !== '' ? food.imageUrl : '/second-serve/default-food.svg'} 
        alt={food.foodName}
        className="w-full h-32 object-cover rounded-md mb-3"
        onError={(e) => {
          if (e.target.src !== window.location.origin + '/second-serve/default-food.svg') {
            e.target.src = '/second-serve/default-food.svg';
          }
        }}
      />
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{food.foodName}</h3>
          {food.description && (
            <p className="text-sm text-gray-600 mb-2">{food.description}</p>
          )}
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            food.foodType === 'VEG' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {food.foodType}
          </span>
          <p className="text-sm mt-1">Qty: {food.quantity}</p>
          <p className="text-sm text-gray-600">📍 {food.location}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded font-bold ${
          food.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
          food.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {food.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Until: {new Date(food.availableUntil).toLocaleString()}
      </p>
      {food.status === 'RESERVED' && food.reservedBy && (
        <div className="text-xs text-yellow-600 mb-2">
          <p>Reserved by: {food.reservedBy.name || 'Unknown'}</p>
          <p>Reserved: {new Date(food.reservedAt).toLocaleString()}</p>
        </div>
      )}
      {food.status === 'COLLECTED' && food.collectedBy && (
        <p className="text-xs text-green-600 mb-2">
          Collected by: {food.collectedBy.name || 'Unknown'}
        </p>
      )}
      {food.status === 'RESERVED' && (
        <button
          onClick={() => handleCollect(food._id)}
          className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
        >
          Mark as Collected
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User ID */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-violet-800">Second Serve - Hostel Dashboard</h1>
              {user && (
                <div className="mt-2 p-2 bg-violet-50 rounded-lg">
                  <p className="text-sm text-violet-700">
                    <span className="font-semibold">User ID:</span> {user._id}
                  </p>
                  <p className="text-sm text-violet-700">
                    <span className="font-semibold">Role:</span> {user.role}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="text-violet-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Add Food Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Excess Food</h2>
          
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name *
              </label>
              <input
                type="text"
                name="foodName"
                placeholder="e.g., Rice and Dal, Chicken Curry"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={formData.foodName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Brief description of the food..."
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/food-image.jpg"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                If no image URL is provided, a default Second Serve image will be used.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Type *
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
                  Quantity (servings) *
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

        {/* Food Listings by Status */}
        {loading ? (
          <p className="text-gray-600">Loading food listings...</p>
        ) : (
          <div className="space-y-8">
            {/* Available Foods */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Available Foods ({availableFoods.length})
              </h2>
              {availableFoods.length === 0 ? (
                <p className="text-gray-500 bg-white p-4 rounded-lg">No available food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableFoods.map(renderFoodCard)}
                </div>
              )}
            </div>

            {/* Reserved Foods */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-yellow-800 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Reserved Foods ({reservedFoods.length})
              </h2>
              {reservedFoods.length === 0 ? (
                <p className="text-gray-500 bg-white p-4 rounded-lg">No reserved food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reservedFoods.map(renderFoodCard)}
                </div>
              )}
            </div>

            {/* Collected Foods */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                Collected Foods ({collectedFoods.length})
              </h2>
              {collectedFoods.length === 0 ? (
                <p className="text-gray-500 bg-white p-4 rounded-lg">No collected food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectedFoods.map(renderFoodCard)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone. 
                All your food listings will also be deleted.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}