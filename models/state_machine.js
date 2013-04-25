var sequelize = require('sequelize'),
    db = require('../lib/db.js'),
    State = require('./state.js')

var StateMachine = db.define('state_machines', {
  current_state_id: sequelize.INTEGER
})

StateMachine.hasMany(State)
State.belongsTo(StateMachine)

module.exports = StateMachine
