const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { protect } = require('./middleware/auth.middleware');
const { checkExpiredReservations } = require('./controllers/food.controller');

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/food', protect, require('./routes/food.routes'));
app.get('/', (req, res) => {
  res.send('Food Wastage MVP Backend Running!');
});

// Check for expired reservations every 10 minutes
setInterval(checkExpiredReservations, 10 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});