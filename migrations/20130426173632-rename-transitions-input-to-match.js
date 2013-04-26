var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.renameColumn('transitions', 'input', 'match', callback)
};

exports.down = function(db, callback) {
  db.renameColumn('transitions', 'match', 'input', callback)
};
