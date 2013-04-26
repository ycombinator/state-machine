module.exports = {
  db: {
    logging: false
  },
  restapi: {
    port: process.env.PORT,
    baseuri: 'http://state-machine.herokuapp.com'
  }
}
