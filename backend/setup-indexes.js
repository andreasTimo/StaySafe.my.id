/**
 * StaySafe.my.id — setup-indexes.js
 *
 * One-time script to establish 2dsphere and TTL indexes on the 'reports' collection.
 * Run locally: MONGODB_URI=... node setup-indexes.js
 */

const { getDb } = require('./common/db');

async function main() {
  console.log('Connecting to database...');
  try {
    const db = await getDb();
    const reportsCollection = db.collection('reports');

    console.log('Creating geospatial index on location...');
    await reportsCollection.createIndex({ location: '2dsphere' });
    console.log('Geospatial index created successfully.');

    console.log('Creating TTL index on createdAt (30 days)...');
    // 30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds
    await reportsCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 2592000 }
    );
    console.log('TTL index created successfully.');

    console.log('Creating compound index on category and createdAt...');
    await reportsCollection.createIndex({ category: 1, createdAt: -1 });
    console.log('Compound index created successfully.');

    console.log('Indexes setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error establishing indexes:', error);
    process.exit(1);
  }
}

main();
