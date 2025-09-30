const JobDescription = require('../models/JobDescription');
const amqp = require('amqplib');

async function publishEvent(type, payload) {
  try {
    const url = process.env.RABBITMQ_URL;
    if (!url) return;
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();
    const exchange = 'jobs_exchange';
    await ch.assertExchange(exchange, 'topic', { durable: false });
    ch.publish(exchange, type, Buffer.from(JSON.stringify(payload)));
    setTimeout(()=>{ ch.close(); conn.close(); }, 500);
  } catch (e) {
    console.error('Failed to publish event', e.message);
  }
}

exports.createJD = async (req, res, next) => {
  try {
    const jd = await JobDescription.create(req.body);
    // publish created event
    publishEvent('job.created', jd);
    res.status(201).json(jd);
  } catch (err) { next(err); }
};

exports.getAllJDs = async (req, res, next) => {
  try {
    const jds = await JobDescription.find();
    res.json(jds);
  } catch (err) { next(err); }
};

exports.getJDById = async (req, res, next) => {
  try {
    const jd = await JobDescription.findById(req.params.id);
    if (!jd) return res.status(404).json({ message: 'JD not found' });
    res.json(jd);
  } catch (err) { next(err); }
};

exports.updateJD = async (req, res, next) => {
  try {
    const jd = await JobDescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!jd) return res.status(404).json({ message: 'JD not found' });
    publishEvent('job.updated', jd);
    res.json(jd);
  } catch (err) { next(err); }
};

exports.deleteJD = async (req, res, next) => {
  try {
    const jd = await JobDescription.findByIdAndDelete(req.params.id);
    if (!jd) return res.status(404).json({ message: 'JD not found' });
    publishEvent('job.deleted', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
