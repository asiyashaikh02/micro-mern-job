// migration/migrate.js
// Usage: set env vars OLD_URI, JOBS_URI, APPS_URI then: node migrate.js
const { MongoClient } = require('mongodb');

const OLD_URI = process.env.OLD_URI || 'mongodb://localhost:27017/mern-job-app';
const JOBS_URI = process.env.JOBS_URI || 'mongodb://localhost:27017/jobs_db';
const APPS_URI = process.env.APPS_URI || 'mongodb://localhost:27017/applicants_db';

async function migrate() {
  const oldClient = new MongoClient(OLD_URI);
  await oldClient.connect();
  const oldDb = oldClient.db();

  const jobsClient = new MongoClient(JOBS_URI);
  await jobsClient.connect();
  const jobsDb = jobsClient.db();

  const appsClient = new MongoClient(APPS_URI);
  await appsClient.connect();
  const appsDb = appsClient.db();

  const jds = await oldDb.collection('jobdescriptions').find().toArray();
  const applicants = await oldDb.collection('applicants').find().toArray();

  if (jds.length) {
    await jobsDb.collection('jobdescriptions').insertMany(jds);
    console.log(`migrated ${jds.length} JDs`);
  } else {
    console.log('no jds found in old db');
  }

  if (applicants.length) {
    await appsDb.collection('applicants').insertMany(applicants);
    console.log(`migrated ${applicants.length} applicants`);
  } else {
    console.log('no applicants found in old db');
  }

  await oldClient.close();
  await jobsClient.close();
  await appsClient.close();
  console.log('migration done');
}

migrate().catch(err => { console.error(err); process.exit(1); });
