var config = require('config'),
    async = require('async'),
    models = require('../../../models')

var validateRequest = function(req, cb) {

  var stateId = req.params.id

  models.state.find(stateId)
    .success(function(dbState) {
      if (dbState) {
        cb(null, dbState)
      } else {
        cb({code: 404, message: 'State not found'})
      }
    })
    .error(cb)

} // END function - validateRequest

var makeStateBody = function(dbState, cb) {

  var body = {
    meta: {
      links: {
        self: config.restapi.baseuri + '/v1/state/' + dbState.id,
        stateMachine: config.restapi.baseuri + 'v1/state-machine/' + dbState.state_machine_id
      }
    },
    state: {
      name: dbState.name
    }
  }

  if (dbState.data) {
    body.state.data = dbState.data
  }

  cb(null, body)

} // END function - makeStateUri

exports.get = function(req, res) {

  async.waterfall([
    function(cb) { validateRequest(req, cb) },
    makeStateBody
  ], function(err, body) {
    if (err) {
      res.send(err.code || 500, err.message || err.toString())
    }
    res.send(200, body)
  })

}
