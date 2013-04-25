var config = require('config'),
    restify = require('restify'),
    resources = require(__dirname + '/resources')

// Define server
var server = restify.createServer({
  name: 'state-machine-restapi',
  version: '0.0.1'
})

server.use(restify.bodyParser())
server.use(restify.CORS())
server.use(restify.fullResponse())

// Routes
server.post('/v1/state-machines', resources.v1.state_machines.post)

// Start server
server.listen(config.restapi.port, function() {
  console.log('%s listening at %s', server.name, server.url)
})
