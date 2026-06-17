import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { getUserFromToken, clearToken } from '../utils/auth';
import { useToast } from '../components/Toast';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function HostelDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const navigate = useNavigate();
  const addToast = useToast();

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

    if (!formData.hostelId || !formData.foodName || !formData.availableUntil || !formData.location) {
      addToast('Please fill all required fields', 'error');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/food', formData);
      addToast('Food listing added!', 'success');
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
      addToast(err.response?.data?.message || 'Failed to add food', 'error');
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
      addToast('Failed to load your food listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (foodId) => {
    try {
      const currentUser = getUserFromToken();
      await api.put(`/food/${foodId}/mark-collected`, { hostelId: currentUser._id });
      addToast('Collection confirmed!', 'success');
      fetchFoods();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to confirm collection', 'error');
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const availableFoods = foods.filter(food => food.status === 'AVAILABLE');
  const reservedFoods = foods.filter(food => food.status === 'RESERVED');
  const collectedFoods = foods.filter(food => food.status === 'COLLECTED');

  const renderFoodCard = (food) => (
    <div key={food._id} className="card-hover p-4">
      <img 
        src={food.imageUrl && food.imageUrl.trim() !== '' ? food.imageUrl : '/second-serve/default-food.svg'} 
        alt={food.foodName}
        className="w-full h-32 object-cover rounded-lg mb-3"
        onError={(e) => {
          if (e.target.src !== window.location.origin + '/second-serve/default-food.svg') {
            e.target.src = '/second-serve/default-food.svg';
          }
        }}
      />
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-800 truncate">{food.foodName}</h3>
          {food.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{food.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className={food.foodType === 'VEG' ? 'badge-green' : 'badge-red'}>
              {food.foodType}
            </span>
            <span className="text-xs text-gray-400">Qty: {food.quantity}</span>
          </div>
        </div>
        <span className={`ml-2 ${
          food.status === 'AVAILABLE' ? 'badge-blue' :
          food.status === 'RESERVED' ? 'badge-yellow' :
          'badge-green'
        }`}>
          {food.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Until {new Date(food.availableUntil).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">📍 {food.location}</p>
      {food.status === 'RESERVED' && food.reservedBy && (
        <div className="mt-2 pt-2 border-t border-primary-100 text-xs text-accent-600 space-y-0.5">
          <p>Reserved by: {food.reservedBy.name || 'Unknown'}</p>
          <p>Reserved: {new Date(food.reservedAt).toLocaleString()}</p>
        </div>
      )}
      {food.status === 'COLLECTED' && food.collectedBy && (
        <p className="mt-2 text-xs text-emerald-600">
          Collected by: {food.collectedBy.name || 'Unknown'}
        </p>
      )}
      {food.status === 'RESERVED' && (
        <button
          onClick={() => handleCollect(food._id)}
          className="mt-3 btn-accent w-full text-xs py-2"
        >
          Mark as Collected
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Hostel Dashboard</h1>
              {user && (
                <div className="mt-2 flex items-center gap-3 text-sm text-primary-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {user.role}
                  </span>
                  <span className="text-primary-300">|</span>
                  <span className="text-xs font-mono text-primary-400">ID: {user._id.slice(-6)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(true)} className="btn-ghost text-sm text-accent-600 hover:text-accent-700">
                Delete Account
              </button>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary-800 mb-6">Add Excess Food</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Food Name *</label>
              <input
                type="text"
                name="foodName"
                placeholder="e.g., Rice and Dal, Chicken Curry"
                className="input"
                value={formData.foodName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                placeholder="Brief description of the food..."
                className="input"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="label">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/food-image.jpg"
                className="input"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
              <p className="text-xs text-primary-300 mt-1.5">
                If no image URL is provided, a default image will be used.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Food Type *</label>
                <select
                  name="foodType"
                  className="input"
                  value={formData.foodType}
                  onChange={handleInputChange}
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="label">Quantity (servings) *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  className="input"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Available Until *</label>
              <input
                type="datetime-local"
                name="availableUntil"
                min={new Date().toISOString().slice(0, 16)}
                className="input"
                value={formData.availableUntil}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="label">Pickup Location *</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., 123 Hostel St, San Francisco, CA"
                className="input"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Food Listing'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 animate-pulse-soft">
                <div className="h-4 bg-primary-100 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-primary-50 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                Available Foods ({availableFoods.length})
              </h2>
              {availableFoods.length === 0 ? (
                <p className="text-primary-300 text-sm card p-6 text-center">No available food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableFoods.map(renderFoodCard)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Reserved Foods ({reservedFoods.length})
              </h2>
              {reservedFoods.length === 0 ? (
                <p className="text-primary-300 text-sm card p-6 text-center">No reserved food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reservedFoods.map(renderFoodCard)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Collected Foods ({collectedFoods.length})
              </h2>
              {collectedFoods.length === 0 ? (
                <p className="text-primary-300 text-sm card p-6 text-center">No collected food listings.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectedFoods.map(renderFoodCard)}
                </div>
              )}
            </div>
          </div>
        )}

        <DeleteAccountModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          userId={user?._id}
        />
      </div>
    </div>
  );
}