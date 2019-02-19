/*
 * powered by @gossip-block within the MOO
 * list of playerName@gameName to filter incoming broadcasts
 */
const path = require( 'path' ),
      config = require( './config' ),
      logger = require( './logger' ).named( 'lib/' + path.basename( __filename, '.js') ),
      reload = require( './reload' );

const CHECK_INTERVAL = config.ban.interval; // XX seconds (ms)
const BAN_PATH = config.ban.path;
let BANLIST = [];

const DELIMITER = "|||";

// monitor the who url and run this function when it changes
reload.monitor( BAN_PATH, ( err, data ) => {
  if ( err ) {
    logger.error( 'failed while reading ban list', err );
  } else {
    try {
      let lines = data.split('\n');
      let updatedList = [];
      lines.forEach( line => {
        // we don't care about the other fields in the file, just the part to be banned.
        let parts = line.split(DELIMITER);
        updatedList.push( parts[ 0 ].toLowerCase() );
      });

      BANLIST = updatedList;

      logger.info( 'ban list loaded with ' + BANLIST.length + ' banned names' );
    } catch ( err ) {
      logger.error( 'failed while parsing ban list', err );
    }
  }
}, CHECK_INTERVAL);

exports = module.exports;

// returns the who list to be attached to the locals
exports.isBanned = function( name ) {
  return BANLIST.includes( name.toLowerCase() );
};

exports.count = function() {
  return BANLIST.length;
};