var test         = require('tape');
var PostgresRepo = require('../');
var Promise      = require('es6-promise').Promise;
var EventEmiiter = require('events').EventEmitter;

var RET = [{}];

// mock client to see what we call
function MockClient()
{
  var sql = this.sql = [];
  var params = this.params = [];
  var ret = this.ret = RET;
  this.query = function(opts) {

    // store what was passed
    sql.push(opts.text);
    params.push(opts.values);

    // Fake it out
    var q = new EventEmiiter();
    process.nextTick(function() {
      q.emit('end', { rows: RET });
    });
    return q;
  };
}


test('get', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.get(123).then(function() {
    t.deepEqual(client.sql, ['SELECT * FROM user WHERE id = $1']);
    t.deepEqual(client.params, [[123]]);
  });

});
