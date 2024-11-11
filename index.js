require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GameDig } = require('gamedig'); 
const { check, validationResult } = require('express-validator');
const validator = require('validator');
const allowedGameTypes = require('./gametypes');
const { rateLimit: rateLimitConfig } = require('./config');

const app = express();
const port = 2010;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow all origins
app.use(cors({
    origin: '*', // Allow requests from all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Define a validation and sanitization chain for the URL path parameters
const validateUrlParams = [
  check('game')
    .isIn(allowedGameTypes)
    .withMessage('Game is not supported.'),
  check('ip')
    .custom((value, { req }) => {
      if (validator.isIP(value) || validator.isFQDN(value)) {
        return true;
      }
      throw new Error('Invalid IP address or hostname.');
    })
    .withMessage('Invalid IP address or hostname.')
    .trim()
    .escape(),
  check('port')
    .isInt({ min: 1, max: 65535 })
    .withMessage('Invalid port number.'),
];

// Route handler with rate limit, validation, and sanitization
app.get('/api/:game/ip=:ip&port=:port', rateLimit(rateLimitConfig), validateUrlParams, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract error messages
    const errorMessages = errors.array().map(error => {
      return { [error.param]: error.msg };
    });

    // Format error messages and send a 400 response
    const prettyErrors = JSON.stringify(errorMessages, null, 2);
    return res.status(400).set('Content-Type', 'application/json').send(prettyErrors);
  }

  // Extract game, IP, and port from request parameters
  const { game, ip, port: gamePort } = req.params;

  try {
    // Query the game server using Gamedig
    const state = await GameDig.query({
      type: game,
      host: ip,
      port: gamePort,
      maxRetries: 0,
      requestRules: true,
      checkOldIDs: true,
    });

    // Add "online" property to the state object
    state.online = true;

    // Set Content-Type header and send the response
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(state, null, 2));
  } catch (error) {
    // Set Content-Type header to JSON
    res.set('Content-Type', 'application/json');

    // Send a response with "online false" property and error message
    const errorResponse = {
      online: false,
      error: `Failed to query the server: ${error.message}`
    };
    const prettyErrorResponse = JSON.stringify(errorResponse, null, 2);
    res.status(500).send(prettyErrorResponse);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
