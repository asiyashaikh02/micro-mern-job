require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./database/db');
const applicantRoutes = require('./routes/applicantRoutes');
const startSubscriber = require('./subscribers/jobSubscriber');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

connectDB();

// start subscriber to listen for job updates (optional caching)
startSubscriber().catch(err=>console.error('subscriber err', err));

app.use('/api/applicants', applicantRoutes);
app.get('/health', (req,res)=>res.json({ok: true, service: 'applicant-service'}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, ()=>console.log(`applicant-service listening on ${PORT}`));
