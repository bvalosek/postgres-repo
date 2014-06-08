var test = require('tape');

var PostgresRepo = require('../index.js');

test('sql expand', function(t) {
  t.plan(1);

  var repo = new PostgresRepo('fake');

  var r = repo._prepareArgs('@a @b @c', { a: 1, b: 2, c: 3 });

  t.deepEqual(r, {
    sql: '$1 $2 $3',
    args: [1,2,3]
  });

});

test('throws on missing var', function(t) {
  t.plan(1);

  var repo = new PostgresRepo('fake');

  t.throws(function() {
    var r = repo._prepareArgs('@a @nope', { a: 1 });
  });

});

test('extra ok', function(t) {
  t.plan(1);

  var repo = new PostgresRepo('fake');

  var r = repo._prepareArgs('@a b c', { a: 1, b: 2, c: 3 });

  t.deepEqual(r, {
    sql: '$1 b c',
    args: [1]
  });

});
