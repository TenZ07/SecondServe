# Second Serve

<div align="center">

![Second Serve](https://img.shields.io/badge/Second%20Serve-363636?style=for-the-badge&logo=restaurant&logoColor=white)


**A web application to reduce food waste by connecting hostels with volunteers**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

## Features

- **Modern UI** with responsive container-style cards and modal dialogs
- **Real-time food management** with status tracking (Available, Reserved, Collected)
- **Role-based access** for hostels and volunteers with proper authorization
- **2-hour reservation system** with automatic expiry and prevention of re-reservation
- **Transparent operations** showing volunteer names for all reservations
- **Image support** for food listings with URL input and fallback handling
- **Account deletion** functionality for both hostels and volunteers with password confirmation
- **Mobile-optimized** design for seamless cross-device experience

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/second-serve.git
cd second-serve
```

2. Install server dependencies
```bash
cd backend
npm install
```

3. Install client dependencies
```bash
cd ../frontend
npm install
```

### Configuration

Create `backend/.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Quickstart — run locally

1) Start the backend and frontend (two terminals)
```bash
# Terminal 1 — Backend server
cd backend
npm run dev

# Terminal 2 — Frontend client
cd frontend
npm run dev
```

2) Access the application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## User Workflows

### Hostel Workflow
1. **Register/Login** as hostel administrator
2. **Add food listings** with name, description, and images (provide image URL or use default)
3. **Monitor reservations** in real-time dashboard
4. **Mark as collected** when volunteers arrive for pickup
5. **Delete account** option available with password confirmation

### Volunteer Workflow
1. **Register/Login** as volunteer
2. **Browse available food** in container-style cards
3. **Reserve items** with 2-hour pickup window
4. **Visit pickup location** for food collection
5. **Hostel confirms** collection upon arrival
6. **Delete account** option available with password confirmation

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `DELETE /api/auth/user/:userId` - Delete user account (requires password confirmation)

### Food Management
- `GET /api/food` - Retrieve all food listings with user details
- `POST /api/food` - Create new food listing with optional image URL (Hostel only)
- `GET /api/food/hostel/:id` - Get hostel-specific listings
- `PUT /api/food/:id/reserve` - Reserve food item (Volunteer only)
- `PUT /api/food/:id/cancel` - Cancel reservation (Volunteer only)
- `PUT /api/food/:id/mark-collected` - Mark as collected (Hostel only)

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers and business logic
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Utility functions
│   └── server.js        # Main server entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page-level components
│   │   ├── utils/       # Client-side utilities
│   │   └── main.jsx     # Application entry point
│   └── package.json
└── README.md
```

## Configuration & Behavior

- **Frontend routing** and authentication are handled in `frontend/src/App.jsx`
- **Backend models** define the data structure in `backend/models/`
- **Role-based permissions** are enforced through middleware in `backend/middleware/`
- **Reservation logic** includes automatic expiry and user restrictions

## Development Notes

- The frontend uses **Vite** for fast HMR and development server
- The backend uses **nodemon** for automatic server reloads during development
- **JWT tokens** handle authentication with proper expiration
- **MongoDB populate** is used for efficient user name retrieval

## Troubleshooting

- If you see `MongoDB connection failed`, verify your `MONGO_URI` in the `.env` file
- If authentication fails, check that `JWT_SECRET` is properly configured
- For frontend connection issues, ensure the backend server is running on the correct port
- Check browser console and server logs for detailed error messages

## Contributing

PRs and issues are welcome. Suggested workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please include tests or manual verification steps for non-trivial features.

## License

This project is licensed under the ISC License.

---

<p align="center">
Peace ;)
</p>