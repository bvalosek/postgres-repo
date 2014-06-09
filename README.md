# postgres-repo

[![Build Status](https://travis-ci.org/bvalosek/postgres-repo.png?branch=master)](https://travis-ci.org/bvalosek/postgres-repo)
[![NPM version](https://badge.fury.io/js/postgres-repo.png)](http://badge.fury.io/js/postgres-repo)

A light, promise-based alternative to a full ORM that simply wraps a repository
pattern around basic PostgreSQL calls.

## Installation

```
$ npm install postgres-repo
```

## Usage

Create a new repo by providing the database connection URL and a table name.
This will use the built-in connection pools setup on the global `pg` object.

```
var PostgresRepo = require('postgres-repo');

var users = new PostgresRepo(DATABASE_URL, 'user');
```

You can also specify a different primary key (default is simply `id`);

```javascript
var users = new PostgresRepo(client, 'users', 'user_id');
```

Get a row from the table by its primary key

```javascript
users.get(id).then(function(user) { ... });
```

Get an array of all of the items in the table

```javascript
users.getAll().then(function(users) { ... });
```

Add a new row to the table. The returned representation will be what is stored,
including any default values set during the `INSERT` command.

```javascript
var user = { email: 'billy@awesome.net', name: 'Billy' };
users.add().then(function(user) { ... });
```

Remove a row that correlates to some object representation. This checks the
identity primary key (e.g, `id`) to execute the `DELETE` command.

```javascript
users.remove(user).then(function() { ... });
```

Update a row that correlates to some object representation. This checks the
identity primary key and executes an `UPDATE` command.

```javascript
user.name = 'Bob';
users.update(user).then(function(user) { ... });
```

Execute a query with parametric values (automatically escaped appropriately by
the underlying `pg` driver)

```javascript
users.query('select * from user where points > @points and group = @group',
  { points: 100, group: 'ballers' })
    .then(function(users) { ... });
```

## Testing

```
$ npm test
```

## License

MIT

