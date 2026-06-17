import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { getUserFromToken, clearToken } from '../utils/auth';
import { useToast } from '../components/Toast';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function VolunteerDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const addToast = useToast();

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
      addToast('Failed to load food listings', 'error');
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
      addToast('You must be logged in to reserve food', 'error');
      return;
    }

    setReservingId(foodId);
    try {
      await api.put(`/food/${foodId}/reserve`, { reservedBy: currentUser._id });
      addToast('Food reserved! You have 2 hours to pick it up.', 'success');
      fetchFoods();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reserve food', 'error');
    } finally {
      setReservingId(null);
    }
  };

  const handleCancelReservation = async (foodId) => {
    const currentUser = getUserFromToken();
    if (!currentUser) {
      addToast('You must be logged in to cancel reservation', 'error');
      return;
    }

    setCancelingId(foodId);
    try {
      await api.put(`/food/${foodId}/cancel`, { userId: currentUser._id });
      addToast('Reservation cancelled successfully', 'info');
      fetchFoods();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel reservation', 'error');
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
    const expiryHours = 2;
    const timeDiff = expiryHours * 60 * 60 * 1000 - (currentTime - reservationTime);
    
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
      className="card-hover overflow-hidden cursor-pointer"
      onClick={() => openFoodModal(food)}
    >
      <div className="relative">
        <img 
          src={food.imageUrl && food.imageUrl.trim() !== '' ? food.imageUrl : '/second-serve/default-food.svg'} 
          alt={food.foodName}
          className="w-full h-40 object-cover"
          onError={(e) => {
            if (e.target.src !== window.location.origin + '/second-serve/default-food.svg') {
              e.target.src = '/second-serve/default-food.svg';
            }
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={food.foodType === 'VEG' ? 'badge-green' : 'badge-red'}>
            {food.foodType}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`${
            food.status === 'AVAILABLE' ? 'badge-blue' :
            food.status === 'RESERVED' ? 'badge-yellow' :
            'badge-green'
          }`}>
            {food.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-primary-800 mb-1 truncate">{food.foodName}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{food.description || 'No description'}</p>
        <div className="flex justify-between items-center text-xs text-primary-400">
          <span>Qty: {food.quantity}</span>
          <span>{new Date(food.availableUntil).toLocaleDateString()}</span>
        </div>
        {food.status === 'RESERVED' && food.reservedBy && typeof food.reservedBy === 'object' && food.reservedBy._id === user?._id && (
          <p className="text-xs text-accent-600 mt-2 font-medium">
            {getTimeRemaining(food.reservedAt)}
          </p>
        )}
        {food.status === 'RESERVED' && food.reservedBy && typeof food.reservedBy === 'object' && food.reservedBy._id !== user?._id && (
          <p className="text-xs text-primary-400 mt-2">
            Reserved by: {food.reservedBy.name || 'Unknown'}
          </p>
        )}
        {food.status === 'COLLECTED' && food.collectedBy && typeof food.collectedBy === 'object' && (
          <p className="text-xs text-emerald-600 mt-2">
            Collected by: {food.collectedBy.name || 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );

  const availableFoods = foods.filter(food => food.status === 'AVAILABLE');
  const reservedFoods = foods.filter(food => food.status === 'RESERVED');
  const myReservedFoods = foods.filter(food => 
    food.status === 'RESERVED' && food.reservedBy && typeof food.reservedBy === 'object' && food.reservedBy._id === user?._id
  );
  const myCollectedFoods = foods.filter(food => 
    food.status === 'COLLECTED' && food.collectedBy && typeof food.collectedBy === 'object' && food.collectedBy._id === user?._id
  );

  const sectionGrid = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

  return (
    <div className="min-h-screen bg-cream p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Volunteer Dashboard</h1>
              {user && (
                <div className="mt-2 flex items-center gap-3 text-sm text-primary-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent-400"></span>
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

        <div className="card p-4 mb-6">
          <p className="text-sm text-primary-500 leading-relaxed">
            Reserve food for 2 hours. Go to the hostel location to pick up the food. The hostel will mark it as collected when you arrive. Click on any food card for details.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse-soft">
                <div className="h-40 bg-primary-100"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-primary-100 rounded w-3/4"></div>
                  <div className="h-3 bg-primary-50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {reservedFoods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  Reserved Foods ({reservedFoods.length})
                </h2>
                <div className={sectionGrid}>
                  {reservedFoods.map(renderFoodCard)}
                </div>
              </div>
            )}

            {myReservedFoods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-400"></span>
                  My Reserved Foods ({myReservedFoods.length})
                </h2>
                <div className={sectionGrid}>
                  {myReservedFoods.map(renderFoodCard)}
                </div>
              </div>
            )}

            {myCollectedFoods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  My Collected Foods ({myCollectedFoods.length})
                </h2>
                <div className={sectionGrid}>
                  {myCollectedFoods.map(renderFoodCard)}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                Available Foods ({availableFoods.length})
              </h2>
              {availableFoods.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-primary-300 text-sm">No available food at the moment.</p>
                </div>
              ) : (
                <div className={sectionGrid}>
                  {availableFoods.map(renderFoodCard)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Food Detail Modal */}
        {selectedFood && (
          <div className="modal-overlay" onClick={closeFoodModal}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <button
                  onClick={closeFoodModal}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                >
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <img 
                  src={selectedFood.imageUrl && selectedFood.imageUrl.trim() !== '' ? selectedFood.imageUrl : '/second-serve/default-food.svg'} 
                  alt={selectedFood.foodName}
                  className="w-full h-64 object-cover rounded-t-2xl"
                  onError={(e) => {
                    if (e.target.src !== window.location.origin + '/second-serve/default-food.svg') {
                      e.target.src = '/second-serve/default-food.svg';
                    }
                  }}
                />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-800 mb-2">{selectedFood.foodName}</h2>
                      <div className="flex gap-2">
                        <span className={selectedFood.foodType === 'VEG' ? 'badge-green' : 'badge-red'}>
                          {selectedFood.foodType}
                        </span>
                        <span className={`${
                          selectedFood.status === 'AVAILABLE' ? 'badge-blue' :
                          selectedFood.status === 'RESERVED' ? 'badge-yellow' :
                          'badge-green'
                        }`}>
                          {selectedFood.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedFood.description && (
                    <div className="mb-5">
                      <h3 className="font-semibold text-primary-700 mb-1.5 text-sm">Description</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedFood.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                      <h3 className="font-semibold text-primary-700 text-sm mb-1">Quantity</h3>
                      <p className="text-gray-600">{selectedFood.quantity} servings</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-700 text-sm mb-1">Available Until</h3>
                      <p className="text-gray-600">{new Date(selectedFood.availableUntil).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-primary-700 text-sm mb-1">Pickup Location</h3>
                    <p className="text-gray-600">📍 {selectedFood.location}</p>
                  </div>

                  {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && typeof selectedFood.reservedBy === 'object' && selectedFood.reservedBy._id === user?._id && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <h3 className="font-semibold text-amber-800 mb-1">Your Reservation</h3>
                      <p className="text-amber-700 text-sm">Reserved: {new Date(selectedFood.reservedAt).toLocaleString()}</p>
                      <p className="text-amber-700 text-sm font-semibold mt-1">{getTimeRemaining(selectedFood.reservedAt)}</p>
                      <p className="text-amber-600 text-xs mt-2">Go to the pickup location. The hostel will mark it as collected when you arrive.</p>
                    </div>
                  )}

                  {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && typeof selectedFood.reservedBy === 'object' && selectedFood.reservedBy._id !== user?._id && (
                    <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                      <h3 className="font-semibold text-primary-700 mb-1">Reserved by Another Volunteer</h3>
                      <p className="text-primary-500 text-sm">Reserved by: {selectedFood.reservedBy.name || 'Unknown'}</p>
                      <p className="text-primary-500 text-sm">Reserved: {new Date(selectedFood.reservedAt).toLocaleString()}</p>
                    </div>
                  )}

                  {selectedFood.status === 'COLLECTED' && selectedFood.collectedBy && typeof selectedFood.collectedBy === 'object' && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <h3 className="font-semibold text-emerald-800 mb-1">Collected</h3>
                      <p className="text-emerald-700 text-sm">Collected by: {selectedFood.collectedBy.name || 'Unknown'}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {selectedFood.status === 'AVAILABLE' && (
                      <button
                        onClick={() => {
                          handleReserve(selectedFood._id);
                          closeFoodModal();
                        }}
                        disabled={reservingId === selectedFood._id}
                        className="btn-accent flex-1"
                      >
                        {reservingId === selectedFood._id ? 'Reserving...' : 'Reserve Food'}
                      </button>
                    )}

                    {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && typeof selectedFood.reservedBy === 'object' && selectedFood.reservedBy._id === user?._id && (
                      <button
                        onClick={() => {
                          handleCancelReservation(selectedFood._id);
                          closeFoodModal();
                        }}
                        disabled={cancelingId === selectedFood._id}
                        className="btn-danger flex-1"
                      >
                        {cancelingId === selectedFood._id ? 'Canceling...' : 'Cancel Reservation'}
                      </button>
                    )}

                    {selectedFood.status === 'COLLECTED' && selectedFood.collectedBy && typeof selectedFood.collectedBy === 'object' && selectedFood.collectedBy._id === user?._id && (
                      <div className="flex-1 bg-primary-50 text-primary-500 py-3 px-4 rounded-xl text-center text-sm font-medium">
                        Food Collected Successfully
                      </div>
                    )}

                    {selectedFood.status === 'RESERVED' && selectedFood.reservedBy && typeof selectedFood.reservedBy === 'object' && selectedFood.reservedBy._id !== user?._id && (
                      <div className="flex-1 bg-primary-50 text-primary-400 py-3 px-4 rounded-xl text-center text-sm">
                        Reserved by {selectedFood.reservedBy.name || 'Another Volunteer'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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