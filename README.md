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

Create the repo by passing in an existing (connected) postgres client and the
table name. It will *not* be escaped by double-quotes, allowing it to be case
insensitive.

```javascript
var PostgresRepo = require('postgres-repo');
var Client       = require('pg').Client;

var client = new Client(process.env.DATABASE_URL);
client.connect();

var users = new PostgresRepo(client, 'users');
```

You can also specify a different primary key (default is simply `id`);

```javascript
var users = new PostgresRepo(client, 'users', 'user_id');
```

Basic CRUD-ish operations:

```javascript
// Get a single item by its primary key
users.get(id).then(function(user) { ... });

// Get all items
users.getAll().then(function(users) { ... });

// Add a row
users.add({ email: 'cool@awesome.net' }).then(function(user) { ... });

// Remove a row
users.remove({ id: 123 }).then(function() { ... });

// Update a row
users.update({ id: 123, email: 'new@email.net' }).then(function(user) { ... });
```

Queries are handled by the `pg` driver, such as parametric sql statements:

```javascript
// Run a query and get the results
users.query('select * from users where points > $1', [totalPoints])
  .then(function(users) { ... });

```

## Testing

```
$ npm test
```

## License

MIT

