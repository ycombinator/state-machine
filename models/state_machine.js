var sequelize = require('sequelize'),
    db = require('../lib/db.js'),
    State = require('./state.js')

var StateMachine = db.define('state_machines', {
})

StateMachine.hasOne(State, { foreignKey: 'current_state_id' })

StateMachine.hasMany(State)
State.belongsTo(StateMachine)

module.exports = StateMachine
