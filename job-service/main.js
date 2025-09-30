require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./database/db');
const jdRoutes = require('./routes/jdRoutes');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

connectDB();

app.use('/api/jds', jdRoutes);
app.get('/health', (req,res)=>res.json({ok: true, service: 'job-service'}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>console.log(`job-service listening on ${PORT}`));
