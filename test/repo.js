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

test('fetch', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.fetch({ id: 123 }).then(function() {
    t.deepEqual(client.sql, ['SELECT * FROM user WHERE id = $1']);
    t.deepEqual(client.params, [[123]]);
  });
});

test('add', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.add({ name: 'bob' }).then(function() {
    t.deepEqual(client.sql, ['INSERT INTO user (name) VALUES ($1) RETURNING *']);
    t.deepEqual(client.params, [['bob']]);
  });
});

test('remove', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.remove({ id: 123 }).then(function() {
    t.deepEqual(client.sql, ['DELETE FROM user WHERE id = $1']);
    t.deepEqual(client.params, [[123]]);
  });
});

test('update', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.update({ id: 123, name: 'bob' }).then(function() {
    t.deepEqual(client.sql, [
      'UPDATE user SET name = $1 WHERE id = $2 RETURNING *']);
    t.deepEqual(client.params, [['bob', 123]]);
  });
});

test('get all', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.getAll().then(function() {
    t.deepEqual(client.sql, [
      'SELECT * FROM user']);
    t.deepEqual(client.params, [[]]);
  });
});

test('query', function(t) {
  t.plan(2);
  var client = new MockClient();
  var repo   = new PostgresRepo(client, 'user');

  repo.query('shit brah', [123]).then(function() {
    t.deepEqual(client.sql, ['shit brah']);
    t.deepEqual(client.params, [[123]]);
  });
});
