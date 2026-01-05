import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { getUserFromToken, clearToken } from '../utils/auth';

export default function VolunteerDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservingId, setReservingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUserFromToken();
    if (!currentUser || currentUser.role !== 'VOLUNTEER') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const fetchFoods = async () => {
    try {
      const res = await api.get('/food');
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

  const handleReserve = async (foodId) => {
    const currentUser = getUserFromToken();
    if (!currentUser) {
      setError('You must be logged in to reserve food');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setReservingId(foodId);
    try {
      await api.put(`/food/${foodId}/reserve`, { reservedBy: currentUser._id });
      setError('Food reserved successfully! You have 2 hours. The hostel will mark it as collected when you pick it up.');
      setTimeout(() => setError(''), 5000);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve food');
      setTimeout(() => setError(''), 3000);
    } finally {
      setReservingId(null);
    }
  };

  const handleCancelReservation = async (foodId) => {
    const currentUser = getUserFromToken();
    if (!currentUser) {
      setError('You must be logged in to cancel reservation');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCancelingId(foodId);
    try {
      await api.put(`/food/${foodId}/cancel`, { userId: currentUser._id });
      setError('Reservation cancelled successfully!');
      setTimeout(() => setError(''), 3000);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCancelingId(null);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const getTimeRemaining = (reservedAt) => {
    const reservationTime = new Date(reservedAt);
    const currentTime = new Date();
    const timeDiff = 2 * 60 * 60 * 1000 - (currentTime - reservationTime); // 2 hours in ms
    
    if (timeDiff <= 0) return 'Expired';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const openFoodModal = (food) => {
    setSelectedFood(food);
  };

  const closeFoodModal = () => {
    setSelectedFood(null);
  };

  const renderFoodCard = (food) => (
    <div 
      key={food._id} 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => openFoodModal(food)}
    >
      <div className="relative">
        {food.imageUrl ? (
          <img 
            src={food.imageUrl} 
            alt={food.foodName}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            food.foodType === 'VEG' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {food.foodType}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 text-xs rounded font-bold ${
            food.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
            food.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {food.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{food.foodName}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{food.description || 'No description available'}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Qty: {food.quantity}</span>
          <span>{new Date(food.availableUntil).toLocaleDateString()}</span>
        </div>
        {food.status === 'RESERVED' && food.reservedBy === user?._id && (
          <p className="text-xs text-yellow-600 mt-2">
            {getTimeRemaining(food.reservedAt)}
          </p>
        )}
        {food.status === 'RESERVED' && food.reservedBy !== user?._id && food.reservedBy && (
          <p className="text-xs text-yellow-600 mt-2">
            Reserved by: {food.reservedBy.name || 'Unknown'}
          </p>
        )}
        {food.status === 'COLLECTED' && food.collectedBy && (
          <p className="text-xs text-green-600 mt-2">
            Collected by: {food.collectedBy.name || 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );

  // Separate foods by status for volunteer view
  const availableFoods = foods.filter(food => food.status === 'AVAILABLE');
  const reservedFoods = foods.filter(food => food.status === 'RESERVED');
  const myReservedFoods = foods.filter(food => 
    food.status === 'RESERVED' && food.reservedBy && food.reservedBy._id === user?._id
  );
  const myCollectedFoods = foods.filter(food => 
    food.status === 'COLLECTED' && food.collectedBy && food.collectedBy._id === user?._id
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with User ID */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-violet-800">Volunteer Dashboard</h1>
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
            <button
              onClick={handleLogout}
              className="text-violet-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl mb-6">
          <p className="text-gray-600">
            Reserve food for 2 hours. Go to the hostel location to pick up the food. The hostel will mark it as collected when you arrive. Click on any food card to see details.
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded mb-4 ${
            error.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading food listings...</p>
        ) : (
          <div className="space-y-8">
            {/* Reserved Foods (All) */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-yellow-800 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Reserved Foods ({reservedFoods.length})
              </h2>
              {reservedFoods.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center">
                  <p className="text-gray-500">No reserved food at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {reservedFoods.map(renderFoodCard)}
                </div>
              )}
            </div>

            {/* My Reserved Foods */}
            {myReservedFoods.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-orange-800 flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  My Reserved Foods ({myReservedFoods.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {myReservedFoods.map(renderFoodCard)}
                </div>
              </div>
            )}

            {/* My Collected Foods */}
            {myCollectedFoods.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  My Collected Foods ({myCollectedFoods.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {myCollectedFoods.map(renderFoodCard)}
                </div>
              </div>
            )}

            {/* Available Foods */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Available Foods ({availableFoods.length})
              </h2>
              {availableFoods.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center">
                  <p className="text-gray-500">No available food at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {availableFoods.map(renderFoodCard)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Food Detail Modal */}
        {selectedFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={closeFoodModal}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Food Image */}
                {selectedFood.imageUrl ? (
                  <img 
                    src={selectedFood.imageUrl} 
                    alt={selectedFood.foodName}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-500 text-lg">No Image Available</span>
                  </div>
                )}

                {/* Food Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedFood.foodName}</h2>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedFood.foodType === 'VEG' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedFood.foodType}
                        </span>
                        <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                          selectedFood.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
                          selectedFood.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedFood.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedFood.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedFood.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Quantity</h3>
                      <p className="text-gray-600">{selectedFood.quantity} servings</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Available Until</h3>
                      <p className="text-gray-600">{new Date(selectedFood.availableUntil).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-1">Pickup Location</h3>
                    <p className="text-gray-600">📍 {selectedFood.location}</p>
                  </div>

                  {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && selectedFood.reservedBy._id === user?._id && (
                    <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-1">Your Reservation</h3>
                      <p className="text-yellow-700">
                        Reserved: {new Date(selectedFood.reservedAt).toLocaleString()}
                      </p>
                      <p className="text-yellow-700 font-semibold">
                        {getTimeRemaining(selectedFood.reservedAt)}
                      </p>
                      <p className="text-yellow-700 text-sm mt-2">
                        Go to the pickup location. The hostel will mark it as collected when you arrive.
                      </p>
                    </div>
                  )}

                  {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && selectedFood.reservedBy._id !== user?._id && (
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-1">Reserved by Another Volunteer</h3>
                      <p className="text-gray-700">
                        Reserved by: {selectedFood.reservedBy.name || 'Unknown'}
                      </p>
                      <p className="text-gray-700">
                        Reserved: {new Date(selectedFood.reservedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedFood.status === 'COLLECTED' && selectedFood.collectedBy && (
                    <div className="mb-6 p-3 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-1">Collected</h3>
                      <p className="text-green-700">
                        Collected by: {selectedFood.collectedBy.name || 'Unknown'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedFood.status === 'AVAILABLE' && (
                      <button
                        onClick={() => {
                          handleReserve(selectedFood._id);
                          closeFoodModal();
                        }}
                        disabled={reservingId === selectedFood._id}
                        className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                      >
                        {reservingId === selectedFood._id ? 'Reserving...' : 'Reserve Food'}
                      </button>
                    )}

                    {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && selectedFood.reservedBy._id === user?._id && (
                      <button
                        onClick={() => {
                          handleCancelReservation(selectedFood._id);
                          closeFoodModal();
                        }}
                        disabled={cancelingId === selectedFood._id}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {cancelingId === selectedFood._id ? 'Canceling...' : 'Cancel Reservation'}
                      </button>
                    )}

                    {selectedFood.status === 'COLLECTED' && selectedFood.collectedBy && selectedFood.collectedBy._id === user?._id && (
                      <div className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-lg text-center">
                        Food Collected Successfully
                      </div>
                    )}

                    {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && selectedFood.reservedBy._id !== user?._id && (
                      <div className="flex-1 bg-gray-100 text-gray-600 py-3 px-4 rounded-lg text-center">
                        Reserved by {selectedFood.reservedBy.name || 'Another Volunteer'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}