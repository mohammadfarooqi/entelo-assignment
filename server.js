const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server({ debug: { request: ['error'] } });

server.connection({
  host: 'localhost',
  port: 3000
});

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
    res('request body ' + JSON.stringify(req.payload));
  }
});

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

    server.start(err => {
      if (err) {
        throw err;
      }
    
      server.log('info', 'Server running at: ' + server.info.uri);      
    });
  }
);
