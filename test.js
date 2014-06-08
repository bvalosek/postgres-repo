var PostgresRepo = require('./index.js');

var todoItems = new PostgresRepo('postgres://local:local@localhost/jtypes', 'todo_item');

/*
todoItems.getAll().then(function(items) {
  console.log(items);
});
*/

todoItems.query('select * from todo_item where id = $1', [40]).then(function(res) {
  console.log(res);
});
