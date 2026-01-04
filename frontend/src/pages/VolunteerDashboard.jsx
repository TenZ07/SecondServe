import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { getUserFromToken, clearToken } from '../utils/auth';

export default function VolunteerDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || user.role !== 'VOLUNTEER') {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAvailableFood = async () => {
    try {
      const res = await api.get('/food');
      setFoods(res.data);
    } catch (err) {
      setError('Failed to load available food');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const handleClaim = async (foodId) => {
    const user = getUserFromToken();
    if (!user) {
      setError('You must be logged in to claim food');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setClaimingId(foodId);
    try {
      await api.put(`/food/${foodId}/claim`, { claimedBy: user._id });
      setError('Food claimed successfully!');
      setTimeout(() => setError(''), 3000);
      fetchAvailableFood();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim food');
      setTimeout(() => setError(''), 3000);
    } finally {
      setClaimingId(null);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-violet-800">Volunteer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-violet-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Claim available food from hostels for redistribution.
        </p>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        {loading ? (
          <p className="text-gray-600">Loading available food...</p>
        ) : foods.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="text-gray-500">No available food at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {foods.map((food) => (
              <div key={food._id} className="bg-white p-4 rounded-xl shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="mb-3 md:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        food.foodType === 'VEG' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {food.foodType}
                      </span>
                      <span className="text-sm text-gray-600">Qty: {food.quantity}</span>
                    </div>
                    <p className="font-medium">📍 {food.location}</p>
                    <p className="text-sm text-gray-500">
                      Available until: {new Date(food.availableUntil).toLocaleString()}
                    </p>
                  </div>

                  <div className="w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleClaim(food._id)}
                      disabled={claimingId === food._id}
                      className="bg-violet-600 text-white px-3 py-1.5 rounded text-sm hover:bg-violet-700 transition disabled:opacity-50"
                    >
                      {claimingId === food._id ? 'Claiming...' : 'Claim Food'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}