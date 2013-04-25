var dbm = require('db-migrate'),
    async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'state_machines', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      current_state_id: { type: 'int' },
      created_at: 'datetime',
      updated_at: 'datetime'
    }),
    db.createTable.bind(db, 'states', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true },
      state_machine_id: { type: 'int', notNull: true },
      data: { type: 'text' },
      created_at: 'datetime',
      updated_at: 'datetime'
    }),
    db.createTable.bind(db, 'transitions', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      state_id: { type: 'int', notNull: true },
      input: { type: 'string', notNull: true },
      next_state_id: { type: 'int', notNull: true },
      created_at: 'datetime',
      updated_at: 'datetime'
    }),
    db.runSql.bind(db, 'ALTER TABLE state_machines ADD CONSTRAINT fk_state_id FOREIGN KEY (current_state_id) REFERENCES states(id)'),
    db.runSql.bind(db, 'ALTER TABLE states ADD CONSTRAINT fk_state_machine_id FOREIGN KEY (state_machine_id) REFERENCES state_machines(id)'),
    db.runSql.bind(db, 'ALTER TABLE transitions ADD CONSTRAINT fk_state_id FOREIGN KEY (state_id) REFERENCES states(id)'),
    db.runSql.bind(db, 'ALTER TABLE transitions ADD CONSTRAINT fk_next_state_id FOREIGN KEY (next_state_id) REFERENCES states(id)')
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.dropTable.bind(db, 'transitions'),
    db.dropTable.bind(db, 'states'),
    db.dropTable.bind(db, 'state_machines')
  ], callback)
};
