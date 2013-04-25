var config = require('config'),
    childProcess = require('child_process'),
    os = require('os'),
    fs = require('fs')

var dbConfig = {
  dev: {
    driver: 'pg',
    user: config.db.username,
    password: config.db.password,
    host: config.db.host,
    database: config.db.name
  }
}

var dbConfigTempFilePath = os.tmpdir() + '/database.json'
fs.writeFile(dbConfigTempFilePath, JSON.stringify(dbConfig), function(err) {

  if (err) {
    console.error('Could not create database config file. Aborting.')
    process.exit(1)
  }

  var cmd = 'node_modules/db-migrate/bin/db-migrate --config ' + dbConfigTempFilePath + ' up'
  childProcess.exec(cmd, function(err, stdout, stderr) {

    console.log(stdout)
    if (err) {
      console.error(stderr)
    }

    fs.unlinkSync(dbConfigTempFilePath)

  })

})
