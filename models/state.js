var sequelize = require('sequelize'),
    db = require('../lib/db.js')

var State = db.define('states', {
  name: sequelize.STRING,
  data: sequelize.TEXT
})

module.exports = State
