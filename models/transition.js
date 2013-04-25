var sequelize = require('sequelize'),
    db = require('../lib/db.js'),
    State = require('./state.js')

var Transition = db.define('transitions', {
  input: { type: sequelize.STRING, notNull: true }
})

Transition.belongsTo(State, { as: 'State', foreignKey: 'state_id' })
State.hasMany(Transition, { foreignKey: 'state_id'})

Transition.belongsTo(State, { as: 'NextState', foreignKey: 'next_state_id' })

module.exports = Transition
