// Notes for improvements
//    1) add Joi for validating inputs for routes
//    2) split this file into multiple files (ex. routes, server, etc...)
//    3) maybe use POST instead of get with params to send email (make call to elastic api)

// Import env vars
require('dotenv').config({ silent: true });

// Imports 
const Hapi = require('hapi');
const Joi = require('joi');
const Good = require('good');
const Wreck = require('wreck');

// Create instance of Server
const server = new Hapi.Server({ debug: { request: ['error'] } });

// Server connection settings
server.connection({
  host: process.env.SERVER_HOST || '0.0.0.0',
  port: process.env.PORT || '3000',
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
  config: {
    validate: {
      payload: {
        to: Joi.string().required(),
        subject: Joi.string().required(),
        body: Joi.string().required()
      }
    },
    handler: async (req, res) => {
      // console.log('req.payload = ', req.payload);
  
      // Body details for email 
      const to = req.payload.to;
      const subject = req.payload.subject;
      const body = req.payload.body;
  
      if (!to || !subject || !body) {
        return res('Missing parameters').code(400);
      } 

      const msgInfo = '&from=mohammad.farooqi@gmail.com&subject=' + encodeURI(subject) + '&to=' + encodeURI(to) + '&bodyHtml=' + encodeURI(body);
  
      console.log('msgInfo = ', msgInfo);
  
      // http get call to elastic email api
      const { resp, payload } = await Wreck.get('http://api.elasticemail.com/v2/email/send?apikey=' + process.env.ELASTIC_EMAIL_API_KEY + msgInfo);
  
      console.log('payload.toString = ', payload.toString());
  
      // console.log(JSON.stringify({
      //   sent: 'to = ' + to + ' subject = ' + subject + ' body = ' + body,
      //   resp: resp,
      //   pay: payload.toString()
      // }));
  
      // converting buffer to str
      const payloadJSON = JSON.parse(payload.toString());
  
      if (payloadJSON && payloadJSON.success) {
        return res(payloadJSON).code(200);
      } else if (payloadJSON && !payloadJSON.success) {
        return res(payloadJSON).code(400);
      }
    }
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
