'use strict';

const express = require('express');
const schoolRoutes = require('./schoolRoutes');

const router = express.Router();

/**
 * Mount all versioned route groups here.
 * Adding new resource routes is as simple as:
 *   router.use('/students', require('./studentRoutes'));
 */
router.use('/schools', schoolRoutes);

module.exports = router;
