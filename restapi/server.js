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
server.get('/v1/state-machine/:id/current-state', resources.v1.state_machine_current_state.get)
server.get('/v1/state/:id', resources.v1.state.get)

// Start server
server.listen(config.restapi.port, function() {
  console.log('%s listening at %s', server.name, server.url)
})
