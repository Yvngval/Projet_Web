const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Accepte les routes avec ou sans slash final
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    req.url = req.url.slice(0, -1) || '/';
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/participants', require('./routes/participants'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(require('./middleware/errorHandler'));

const { sequelize } = require('./models');
const seed = require('./seed');
sequelize.sync().then(async () => {
  await seed();
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
});
