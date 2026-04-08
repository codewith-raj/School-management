'use strict';

/**
 * setup.js — One-time database setup script.
 *
 * 1. Connects to MySQL using your .env credentials
 * 2. Creates the database if it doesn't exist
 * 3. Creates the `schools` table with proper indexes
 *
 * Run: node setup.js
 */

require('dotenv').config();
const mysql2 = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'school_management_db',
} = process.env;

async function setup() {
  let connection;

  console.log('\n🔧 School Management API — Database Setup\n');
  console.log(`  Host     : ${DB_HOST}:${DB_PORT}`);
  console.log(`  User     : ${DB_USER}`);
  console.log(`  Database : ${DB_NAME}\n`);

  try {
    // Connect WITHOUT specifying a database (so we can create it)
    connection = await mysql2.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      user: DB_USER,
      password: DB_PASSWORD,
    });

    console.log('✅ Connected to MySQL server.');

    // Step 1: Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database "${DB_NAME}" is ready.`);

    // Step 2: Switch to the new database
    await connection.query(`USE \`${DB_NAME}\``);

    // Step 3: Create schools table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        name       VARCHAR(255)  NOT NULL,
        address    VARCHAR(500)  NOT NULL,
        latitude   FLOAT         NOT NULL,
        longitude  FLOAT         NOT NULL,
        created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_schools_location (latitude, longitude),
        INDEX idx_schools_name (name)
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
        COMMENT='Stores school records with GPS coordinates'
    `);
    console.log('✅ Table "schools" is ready.');

    // Step 4: Show confirmation
    const [rows] = await connection.query('DESCRIBE schools');
    console.log('\n📋 Table structure:');
    console.table(rows.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null, Key: r.Key })));

    console.log('\n🎉 Setup complete! You can now run:\n');
    console.log('   npm run dev      ← start development server');
    console.log('   npm run seed     ← insert 10 sample schools');
    console.log('   npm start        ← start production server\n');

  } catch (err) {
    console.error('\n❌ Setup failed!\n');

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  Wrong MySQL username or password.');
      console.error(`  Check DB_USER and DB_PASSWORD in your .env file.`);
      console.error(`  Current: user="${DB_USER}", password="${DB_PASSWORD ? '(set)' : '(empty)'}"\n`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('  MySQL server is not running on this machine.');
      console.error('  Start MySQL from Windows Services or MySQL Workbench.\n');
    } else {
      console.error(`  Error code: ${err.code}`);
      console.error(`  Message   : ${err.message}\n`);
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
