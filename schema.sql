-- ============================================================
--  School Management API — MySQL Schema
--  Compatible with: MySQL 8.0+ / MariaDB 10.5+
--  Run this BEFORE starting the application for the first time.
-- ============================================================

-- 1. Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS school_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_management_db;

-- 2. Create `schools` table
CREATE TABLE IF NOT EXISTS schools (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(255)      NOT NULL,
  address       VARCHAR(500)      NOT NULL,
  latitude      FLOAT             NOT NULL,
  longitude     FLOAT             NOT NULL,
  createdAt     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Composite index for geolocation queries
  INDEX idx_schools_location (latitude, longitude),

  -- Index for name-based lookups / deduplication
  INDEX idx_schools_name (name)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Stores school records with GPS coordinates';

-- 3. Optional: verify creation
SHOW TABLES;
DESCRIBE schools;
