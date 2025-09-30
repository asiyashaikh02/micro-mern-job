const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobs_db';

module.exports = function connectDB() {
  mongoose.connect(uri, {useNewUrlParser:true, useUnifiedTopology:true})
    .then(()=>console.log('job-service connected to Mongo'))
    .catch(err=>console.error('job-service mongo error', err));
};
