/*
  RabbitMQ subscriber that listens for job.created, job.updated, job.deleted
  and updates applicant.jobSnapshot if needed.
*/
const amqp = require('amqplib');
const Applicant = require('../models/Applicant');

module.exports = async function startSubscriber() {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    console.log('No RABBITMQ_URL set — skipping subscriber');
    return;
  }
  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  const exchange = 'jobs_exchange';
  await ch.assertExchange(exchange, 'topic', { durable: false });
  const q = await ch.assertQueue('', { exclusive: true });
  await ch.bindQueue(q.queue, exchange, 'job.*');

  ch.consume(q.queue, async msg => {
    if (!msg) return;
    try {
      const routingKey = msg.fields.routingKey;
      const payload = JSON.parse(msg.content.toString());
      console.log('Received', routingKey);
      if (routingKey === 'job.updated' || routingKey === 'job.created') {
        // update jobSnapshot in applicants that reference this job
        await Applicant.updateMany(
          { appliedFor: payload._id || payload.id },
          { $set: { jobSnapshot: { title: payload.title, minExperience: payload.minExperience, skillsRequired: payload.skillsRequired } } }
        );
      } else if (routingKey === 'job.deleted') {
        await Applicant.updateMany(
          { appliedFor: payload.id },
          { $unset: { jobSnapshot: "" } }
        );
      }
    } catch (e) { console.error('subscriber processing error', e); }
    ch.ack(msg);
  });

  console.log('jobSubscriber connected and listening for job.* events');
};
