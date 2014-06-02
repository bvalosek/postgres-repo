# postgres-repo

[![Build Status](https://travis-ci.org/bvalosek/postgres-repo.png?branch=master)](https://travis-ci.org/bvalosek/postgres-repo)
[![NPM version](https://badge.fury.io/js/postgres-repo.png)](http://badge.fury.io/js/postgres-repo)

A light alternative to a full ORM that simply wraps a repository pattern around
PostgreSQL calls.

## Installation

```
$ npm install postgres-repo
```

## Usage

```javascript
var PostgresRepo = require('postgres-repo');
var users = new PostgresRepo('users');

// Get a single item by its primary key
users.get(id).then(function(user) { ... });

// Get all items
users.getAll().then(function(users) { ... });

// Run a query and get the results
users.query('select * from users where points > $1', [totalPoints])
  .then(function(users) { ... });

// Add a row
users.add({ email: 'cool@awesome.net' }).then(function(user) { ... });

// Remove a row
users.remove({ id: 123 }).then(function() { ... });

// Update a row
users.update({ id: 123, email: 'new@email.net' }).then(function(user) { ... });
```

## Testing

```
$ npm test
```

## License

MIT

