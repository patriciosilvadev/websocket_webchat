const express = require('express');

// Main
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(`${__dirname}/public`));

// Setup cross origin
app.use(require('cors')());

// Bringing in the routes
app.use('/user', require('./routes/user'));
app.use('/test', require('./routes/test'));
app.use('/canned-response', require('./routes/cannedResponse'));

// Setup Error Handlers
const errorHandlers = require('./handlers/errorHandlers');

app.use(errorHandlers.notFound);
app.use(errorHandlers.mongooseErrors);
if (process.env.ENV === 'DEVELOPMENT') {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

module.exports = app;
