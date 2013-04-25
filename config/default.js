var matches = []
if (process.env.DATABASE_URL) {

  var dbUrlRegex = /([^:]+):\/\/([^:]+):([^@]+)@([^:]+):([\d]+)\/(.+)/
  matches = process.env.DATABASE_URL.match(dbUrlRegex)

}

module.exports = {
  db: {
    dialect: matches[1] || 'postgres',
    name: matches[6] || 'statemachine',
    username: matches[2] || 'statemachine',
    password: matches[3] || '',
    host: matches[4] || 'localhost',
    port: matches[5] || 5432,
    logging: console.log
  },
  restapi: {
    port: process.env.PORT || 8080,
    baseuri: 'http://localhost:8080'
  }
}
