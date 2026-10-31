'use strict';

// Core's scenario pages scan as the baseline recorded (tests/helpers/baseline-test.js).

const test = require('node:test');
const { scenarioTest } = require('./helpers/baseline-test.js');

scenarioTest(test, 0);
