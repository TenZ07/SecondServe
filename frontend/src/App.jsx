// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HostelDashboard from './pages/HostelDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hostel" element={<HostelDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;