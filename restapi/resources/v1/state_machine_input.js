var config = require('config'),
    async = require('async'),
    models = require('../../../models')

var validateRequest = function(req, cb) {

  var body
  try {
    body = JSON.parse(req.body)
  } catch (err) {
    cb({code: 400, message: err})
  }

  // Ensure 'input' propert is present
  if (!body.hasOwnProperty('input')) {
    cb({code: 400, message: 'Missing top-level property \'input\''})
  }
  var input = body.input

  var stateMachineId = req.params.id

  models.state_machine.find(stateMachineId)
    .success(function(dbStateMachine) {
      if (dbStateMachine) {
        cb(null, dbStateMachine, input)
      } else {
        cb({code: 404, message: 'State machine not found'})
      }
    })
    .error(cb)

} // END function - validateRequest

var getCurrentState = function(dbStateMachine, input, cb) {

  models.state.find(dbStateMachine.current_state_id)
    .success(function(dbState) {
      cb(null, dbStateMachine, dbState, input)
    })
    .error(cb)

} // END function - getCurrentState

var processInput = function(dbStateMachine, dbState, input, cb) {

  dbState.getTransitions()
    .success(function(transitions) {

      var dbNextState
      async.filter(
        transitions,
        function(dbTransition, callback) {

          var matches = input.match(new RegExp(dbTransition.match))
          if (matches) {
            dbTransition.getNextState()
              .success(function(dbns) { dbNextState = dbns; callback(true) })
              .error(function() { callback(false) })
          } else {
            callback(false)
          }
          
        },
        function(results) {
          if (!(results instanceof Array) || (results.length == 0)) {
            cb({code: 404, message: 'No transition found for that input'})        
          } else {
            cb(null, dbStateMachine, dbNextState)
          }
        }
      )

    })
    .error(cb)

} // END function - processInput

var updateCurrentState = function(dbStateMachine, dbState, cb) {

  dbStateMachine.current_state_id = dbState.id
  dbStateMachine.save()
    .success(function() { cb(null, dbState) })
    .error(cb)

} // END function - updateCurrentState

var makeStateUri = function(dbState, cb) {

  cb(null, config.restapi.baseuri + '/v1/state/' + dbState.id)

} // END function - makeStateUri

exports.post = function(req, res) {

  async.waterfall([
    function(cb) { validateRequest(req, cb) },
    getCurrentState,
    processInput,
    updateCurrentState,
    makeStateUri
  ], function(err, stateUri) {
    if (err) {
      res.send(err.code || 500, err.message || err.toString())
    }
    res.setHeader('Location', stateUri)
    res.send(303, null)
  })

}
