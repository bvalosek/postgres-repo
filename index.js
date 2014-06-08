module.exports = PostgresRepo;

var Promise = require('bluebird').Promise;
var debug   = require('debug')('PostgresRepo');
var pg      = require('pg');
var Client  = require('pg').Client;

/**
 * Repository interface around a PostgreSQL table
 * @param {string|Client} connection the postgres connection string or a client instance
 * @param {string} table Table name
 * @param {string} primaryKey table primary key
 * @constructor
 */
function PostgresRepo(connection, table, primaryKey)
{
  if (!connection)
    throw new TypeError('connectionString');

  this._connection = connection;
  this._table      = table;
  this._primaryKey = primaryKey || 'id';
}

/**
 * Run a SQL query and return an array of objects (or an array of arrays of
 * objects in the case of a multi-table join query).
 * @param {string} sql
 * @param {object} params
 * @return {Promise}
 */
PostgresRepo.prototype.query = function(sql, params)
{
  params = params || [];

  // Translate the args
  var _ref = this._prepareArgs(sql, params);
  sql = _ref.sql;
  params = _ref.args;

  debug('query: %s', sql);
  debug('params: %s', params.join(','));

  // build the query
  var query = {
    text: sql,
    values: params,
    rowMode: 'array'
  };

  // Attempt to get a client from the pool and execute the query
  var _this = this;
  return this._getClient().then(function(client) {
    return new Promise(function(resolve, reject) {
      client.query(query, function(err, result) {
        _this._freeClient(client);
        _this._logPool();
        if (err) return reject (err);
        resolve(result.rows);
      });
    });
  });

};

/**
 * debug out info about the pool after every query
 * @private
 */
PostgresRepo.prototype._logPool = function()
{
  var connection = this._connection;

  if (typeof connection !== 'string') return;

  // log info about connection pool
  var pool = pg.pools.getOrCreate(connection);
  var size = pool.getPoolSize();
  var available = pool.availableObjectsCount();
  debug('pool: %d / %d', size - available, size);
};

/**
 * Use either the single injected client or use the pg global to get one from
 * the pool.
 * @return {Promise} Client
 */
PostgresRepo.prototype._getClient = function()
{
  var connection = this._connection;
  if (typeof connection === 'string') {
    return new Promise(function(resolve, reject) {
      pg.connect(connection, function(err, client, done) {
        if (err) return reject (err);
        client.done = done;
        resolve(client);
      });
    });
  }

  // Use a single connection
  return Promise.resolve(connection);
};

/**
 * Free the client if its from the pool, otherwise nop
 * @param {Client} client
 */
PostgresRepo.prototype._freeClient = function(client)
{
  if (client.done)
    client.done();
};

/**
 * Get a model from the store.
 * @param {string} id
 * @return {Promise}
 */
PostgresRepo.prototype.get = function(id)
{
  var sql = 'SELECT * FROM ' + this._table + ' WHERE ' +
    this._primaryKey + ' = $1';

  return this.query(sql, [id]).then(firstOrNull);
};

/**
 * @param {number} skip
 * @param {number} take
 * @return {Promise}
 */
PostgresRepo.prototype.getAll = function()
{
  return this.query('SELECT * FROM ' + this._table);
};

/**
 * Remove am model from the store.
 * @param {object} obj Model
 * @return {Promise}
 */
PostgresRepo.prototype.remove = function(obj)
{
  var id = obj[this._primaryKey];

  var sql = 'DELETE FROM ' + this._table + ' WHERE ' +
    this._primaryKey + ' = $1';

  return this.query(sql, [id]);
};

/**
 * @param {object} obj
 * @return {Promise}
 */
PostgresRepo.prototype.add = function(obj)
{
  var sql     = 'INSERT INTO ' + this._table + ' (';
  var sValues = '';
  var values  = [];

  var n = 0;
  for (var key in obj) {
    if (key === this._primaryKey) continue;
    if (n++) sql += ', ';
    sql += key;
    values.push(obj[key]);

    if (n > 1) sValues += ', ';
    sValues += '$' + n;
  }

  sql += ') VALUES (' + sValues + ') RETURNING *';

  return this.query(sql, values).then(firstOrNull);
};

/**
 * Populate an existing model with data from the store.
 * @param {object} obj
 * @return {Promise}
 */
PostgresRepo.prototype.fetch = function(obj)
{
  return this.get(obj[this._primaryKey]);
};

/**
 * @return {Promise}
 */
PostgresRepo.prototype.update = function(item)
{
  var sql    = 'UPDATE ' + this._table + ' SET ';
  var values = [];

  var n = 0;
  for (var key in item) {
    if (key === this._primaryKey) continue;
    if (n++) sql += ', ';
    values.push(item[key]);
    sql += key + ' = $' + n;
  }

  sql += ' WHERE ' + this._primaryKey + ' = $' + (++n);
  values.push(item[this._primaryKey]);
  sql += ' RETURNING *';
  return this.query(sql, values).then(firstOrNull);
};

/**
 * Given a hash and parametric sql string, swap all of the @vars into $N args
 * and create an array
 * @param {string} sql Parametric sql string
 * @param {object} hash All of the named arguments
 * @return {{sql:string, args:array.<any>}}
 */
PostgresRepo.prototype._prepareArgs = function(sql, hash)
{
  var args = [];

  var keys = sql.match(/@\S+/g);
  var aKeys = sql.match(/\$\d+/g);

  if (keys && aKeys)
    throw new Error(
      'Cannot use both array-style and object-style parametric values');

  // Array-style (native)
  if (aKeys) {
    return { sql: sql, args: hash };
  }

  // No params
  if (!keys) {
    return { sql: sql, args: args };
  }

  var n = 1;
  keys.forEach(function(key) {
    key = key.substr(1);
    var val = hash[key];
    if (val === undefined)
      throw new Error('No value for @' + key + ' provided');
    args.push(val);
    sql = sql.replace('@' + key, '$' + n++);
  });

  return { sql: sql, args: args };
};

function firstOrNull(result)
{
  if (result && result.length)
    return result[0];
  else
    return null;
}

