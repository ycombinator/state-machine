var config = require('config'),
    async = require('async'),
    models = require('../../../models')

var validateRequest = function(req, cb) {

  var stateMachineId = req.params.id

  models.state_machine.find(stateMachineId)
    .success(function(dbStateMachine) {
      if (dbStateMachine) {
        cb(null, dbStateMachine)
      } else {
        cb({code: 404, message: 'State machine not found'})
      }
    })
    .error(cb)

} // END function - validateRequest

var getCurrentState = function(dbStateMachine, cb) {

  models.state.find(dbStateMachine.current_state_id)
    .success(function(dbState) {
      cb(null, dbState)
    })
    .error(cb)

} // END function - getCurrentState

var makeStateUri = function(dbState, cb) {

  cb(null, config.restapi.baseuri + '/v1/state/' + dbState.id)

} // END function - makeStateUri

exports.get = function(req, res) {

  async.waterfall([
    function(cb) { validateRequest(req, cb) },
    getCurrentState,
    makeStateUri
  ], function(err, stateUri) {
    if (err) {
      res.send(err.code || 500, err.message || err.toString())
    }
    res.setHeader('Location', stateUri)
    res.send(303, null)
  })

}
