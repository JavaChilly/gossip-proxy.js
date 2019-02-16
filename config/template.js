module.exports = {
  'http' : {
    // proxy will listen on this port
    'port' : 5589
  },

  // morgan format 'dev' 'tiny' 'short' 'common' combined'
  'morgan' : 'dev',

  // to log logger.debug messages or not
  'debug' : true,

  // gossip init options
  'gossip' : {
    'client_id' : 'GRAPEVINE GAME CLIENT ID',
    'client_secret' : 'GRAPEVINE GAME CLIENT SECRET',
    'supports' : [ 'games', 'channels', 'players' ],
    'channels' : [ 'testing', 'gossip' ]
  },

  'who' : {
    'path' : '/path/to/who.list',
    'interval' : 90000
  },

  'moo' : {
    'name' : 'Sindome',   // this will be appended to the player's name (Johnny@Sindome) when communicating with the gossip network
    'host' : 'localhost',
    'port' : 5555,
    'secret' : 'MOO SHARED SECRET KEY',
    'commands' : {
      'RECEIVE_BROADCAST' : 'cgi-interface-node_gossip_receive_broadcast',
      'RECEIVE_TELL' : 'cgi-interface-node_gossip_receive_tell',
      'PLAYER_SIGNIN' : 'cgi-interface-node_gossip_player_signin',
      'PLAYER_SIGNOUT' : 'cgi-interface-node_gossip_player_signout'
    }
  }
};