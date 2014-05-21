var ranaly = require('ranaly');
try {
  var ranalyConf = require('./ranaly_config');
  var _redis = require('redis');
} catch (e) {}

function Ranaly(redis, config) {
  redis = redis || _redis.createClient();
  config = config || ranalyConf;

  if (!redis) throw new Error('No redis connection!');
  if (!config) throw new Error('No config file!');
  if (!(this instanceof Ranaly)) {
    return new Ranaly(redis, config);
  }
  var self = this;
  self.client = ranaly.createClient(redis, 'ranaly:');

  for (var i = 0; i < config.clients.length; i++) {
    var client = config.clients[i];
    if (['Amount', 'Realtime', 'DataList'].indexOf(client.type) === -1) {
      throw new Error('Type must be one of Amount, Realtime, DataList!');
    }
    var keys = Object.keys(client.methods);
    self[client.name] = {};
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      var value = client.methods[key];
      if (client.type.toLowerCase() === 'amount') {
        self[client.name + key] = new self.client.Amount(config.name.toLowerCase() + ':' + client.name + ':' + key);
        self[client.name][key] = self[client.name + key][value].bind(self[client.name + key]);
      }
      if (client.type.toLowerCase() === 'realtime') {
        self[client.name + key] = new self.client.Realtime(config.name.toLowerCase() + ':' + client.name + ':' + key);
        self[client.name][key] = self[client.name + key][value].bind(self[client.name + key]);
      }
      if (client.type.toLowerCase() === 'datalist') {
        self[client.name + key] = new self.client.DataList(config.name.toLowerCase() + ':' + client.name + ':' + key);
        self[client.name][key] = self[client.name + key][value].bind(self[client.name + key]);
      }
    }
  }
}

module.exports = Ranaly;
