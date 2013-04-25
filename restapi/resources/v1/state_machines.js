var async = require('async'),
    config = require('config'),
    models = require('../../../models')

var validateRequest = function(req, cb) {

  var body
  try {
    body = JSON.parse(req.body)
  } catch (err) {
    cb({code: 400, message: err})
  }

  // Ensure 'states' property is present
  if (!body.hasOwnProperty('states')) {
    cb({code: 400, message: 'Missing top-level property \'states\''})
  }
  var states = body.states

  // Ensure 'initialState' property is present
  if (!body.hasOwnProperty('initialState')) {
    cb({code: 400, message: 'Missing top-level property \'initalState\''})
  }
  var initialState = body.initialState

  for (var state in states) {
    
    if (state.hasOwnProperty('transitions') && (state.transitions instanceof Array)) {
      
      for (var tid in transitions) {

        var transition = transitions[tid]

        // Ensure transition has 'input' property present
        if (!transition.hasOwnProperty('input')) {
          cb({code: 400, message: 'Missing transition property \'input\''})
        }

        // Ensure transition has 'newState' property present
        if (!transition.hasOwnProperty('newState')) {
          cb({code: 400, message: 'Missing transition property \'newState\''})
        }

      } // END for - transitions

    } // END if - transitions exist

  } // END for - states

  // Ensure that initial state is one of the defined states
  if (!states.hasOwnProperty(initialState)) {
    cb({code: 400, message: 'Initial state is not one of the defined state'})
  }

  for (var state in states) {

    for (var tid in state.transitions) {

      var transition = state.transitions[tid]
      var input = transition.input
      var transitionState = transition.newState

      // Ensure transition state is one of the defined states
      if (!states.hasOwnProperty(transitionState)) {
        cb({code: 400, message: 'Transition state for state \'' + state + '\' and input \'' + input + '\' not found'})
      }

    } // END for - transitions

  } // END for - states

  cb(null, body)

} // END function - validateRequest

var persistStateMachine = function(stateMachine, cb) {

  models.state_machine.create()
    .success(function(sm) { cb(null, stateMachine, sm) })
    .error(cb)

} // END function - persistStateMachine

var persistInitialState = function(stateMachine, dbStateMachine, cb) {

  var initialState = stateMachine.initialState

  models.state.find({ where: { name: initialState }})
    .success(function(state) {
      dbStateMachine.current_state_id = state.id
      dbStateMachine.save()
        .success(function(dbsm) {
          console.log(dbsm.current_state_id)
          cb(null, stateMachine, dbsm)
        })
        .error(cb)
    })
    .error(cb)

} // END function - persistInitialState

var persistStates = function(stateMachine, dbStateMachine, cb) {

  var states = []
  for (name in stateMachine.states) {
    
    var state = stateMachine.states[name]
    state.name = name

    states.push(models.state.build(state))

  }

  dbStateMachine.setStates(states)
    .success(function() { cb(null, stateMachine, dbStateMachine) })
    .error(cb)

} // END function - persistStates

var persistTransitions = function(stateMachine, dbStateMachine, cb) {

  var states = []
  for (stateName in stateMachine.states) {
    var state = stateMachine.states[stateName]
    state.name = stateName
    if ((state.transitions instanceof Array) && (state.transitions.length > 0)) {
      states.push(state)
    }
  }

  async.each(
    states,
    function(state, callback) {
      
      models.state.find({ where: { name: state.name, state_machine_id: dbStateMachine.id }})
        .success(function(dbState) {
          
          async.each(
            state.transitions,
            function(transition) {
              
              models.state.find({ where: { name: transition.nextState, state_machine_id: dbStateMachine.id }})
                .success(function(dbNextState) {
                  
                  models.transition.create({
                    state_id: dbState.id,
                    input: transition.input,
                    next_state_id: dbNextState.id
                  })
                    .success(function(t) { callback() })
                    .error(callback)
                  
                }) // END - success - dbNextState
                .error(callback)
              
            }
          )
            
            })
        .error(callback)
      
    },
    function(err) {
      if (err) {
        cb(err)
      } else {
        cb(null, stateMachine, dbStateMachine)
      }
    }
  ) // END each  

    } // END function - persistTransitions

var makeStateMachineUri = function(stateMachine, dbStateMachine, cb) {

  cb(null, config.restapi.baseuri + '/v1/state-machine/' + dbStateMachine.id)

} // END function - makeStateMachineUri

exports.post = function(req, res) {

  async.waterfall([
    function(cb) { validateRequest(req, cb) },
    persistStateMachine,
    persistStates,
    persistInitialState,
    persistTransitions,
    makeStateMachineUri
  ], function(err, stateMachineUri) {
    if (err) {
      res.send(err.code || 500, err.message || err.toString())
    }
    res.setHeader('Location', stateMachineUri)
    res.send(201, { meta: { links: { self: stateMachineUri } } } )
  })

}
