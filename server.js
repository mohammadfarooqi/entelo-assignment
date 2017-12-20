const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 3000
});

server.route({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    res('Hello World');
  }
});

server.start(err => {
  if (err) {
    throw err;
  }

  console.log('Server running on ' + server.info.uri);
})