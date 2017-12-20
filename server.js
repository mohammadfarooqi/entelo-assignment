// Notes for improvements
//    1) add Joi for validating inputs for routes
//    2) split this file into multiple files (ex. routes, server, etc...)

// Imports 
const Hapi = require('hapi');
const Good = require('good');

// Create instance of Server
const server = new Hapi.Server({ debug: { request: ['error'] } });

// Server connection settings
server.connection({
  host: 'localhost',
  port: 3000
});

// Routes: 
server.route({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    res('/ route working!');
  }
});

server.route({
  method: 'POST',
  path: '/sendEmail',
  handler: (req, res) => {
    // Body details for email 
    const to = req.payload.to;
    const subject = req.payload.subject;
    const body = req.payload.body;

    res('to = ' + to + ' subject = ' + subject + ' body = ' + body);
  }
});

// Register Hapi Good plugin
server.register(
  {
    register: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                response: '*',
                log: '*'
              }
            ]
          },
          {
            module: 'good-console'
          },
          'stdout'
        ]
      }
    }
  },
  err => {
    if (err) {
      throw err;
    }

    // Start Server
    server.start(err => {
      if (err) {
        throw err;
      }
    
      server.log('info', 'Server running at: ' + server.info.uri);      
    });
  }
);
