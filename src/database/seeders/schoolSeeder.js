'use strict';

require('dotenv').config();

const { sequelize, connectDatabase } = require('../connection');
const School = require('../../models/School');
const logger = require('../../utils/logger');

/**
 * Sample seed data — 10 real Indian schools with accurate coordinates.
 * Run with: npm run seed
 */
const schools = [
  {
    name: 'Delhi Public School, R.K. Puram',
    address: 'Sector 4, R.K. Puram, New Delhi, Delhi 110022',
    latitude: 28.5679,
    longitude: 77.1866,
  },
  {
    name: 'The Doon School',
    address: 'Mall Road, Dehradun, Uttarakhand 248001',
    latitude: 30.3256,
    longitude: 78.0335,
  },
  {
    name: 'Bishop Cotton School',
    address: 'Shimla, Himachal Pradesh 171001',
    latitude: 31.1048,
    longitude: 77.1734,
  },
  {
    name: 'Kendriya Vidyalaya No. 1, Chandigarh',
    address: 'Sector 15, Chandigarh, Punjab 160015',
    latitude: 30.7333,
    longitude: 76.7794,
  },
  {
    name: 'Cathedral & John Connon School',
    address: 'Parsi Wada, Fort, Mumbai, Maharashtra 400001',
    latitude: 18.9322,
    longitude: 72.8347,
  },
  {
    name: "St. Xavier's Collegiate School",
    address: '30 Park Street, Kolkata, West Bengal 700016',
    latitude: 22.5498,
    longitude: 88.3528,
  },
  {
    name: 'The Hyderabad Public School',
    address: 'Begumpet, Hyderabad, Telangana 500016',
    latitude: 17.4400,
    longitude: 78.4564,
  },
  {
    name: 'Sardar Patel Vidyalaya',
    address: 'Lodi Estate, New Delhi, Delhi 110003',
    latitude: 28.5983,
    longitude: 77.2207,
  },
  {
    name: 'Modern School, Barakhamba Road',
    address: 'Barakhamba Road, Connaught Place, New Delhi 110001',
    latitude: 28.6284,
    longitude: 77.2244,
  },
  {
    name: 'The Lawrence School, Sanawar',
    address: 'Kasauli Hills, Sanawar, Himachal Pradesh 173104',
    latitude: 30.8947,
    longitude: 76.9543,
  },
];

async function seed() {
  try {
    await connectDatabase();

    logger.info('🌱 Starting database seeding…');

    let created = 0;
    let skipped = 0;

    for (const schoolData of schools) {
      const [school, wasCreated] = await School.findOrCreate({
        where: { name: schoolData.name },
        defaults: schoolData,
      });

      if (wasCreated) {
        logger.info(`  ✅ Created: "${school.name}"`);
        created++;
      } else {
        logger.info(`  ⏭️  Skipped (already exists): "${school.name}"`);
        skipped++;
      }
    }

    logger.info(`\n✅ Seeding complete — ${created} created, ${skipped} skipped.`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

seed();
