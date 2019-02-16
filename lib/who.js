/*
 * who - functions for dealing with the WHO data file
 *
 * The WHO object is backed by a file written to by the MOO. This will
 * monitor the file, updating the WHO object whenever the file changes.
 * The WHO object is attached to app.locals for page template usage.

 * who.who() - returns the who object for currently connected players
 *
 * who.specific( obj ) => user - return the user object for a connected player
 */
const path = require( 'path' ),
    config = require( './config' ),
    logger = require( './logger' ).named( 'lib/' + path.basename( __filename, '.js') ),
    reload = require( './reload' );

const CHECK_INTERVAL = config.who.interval; // 90 seconds
const WHO_PATH = config.who.path;
let WHO = [];
const CHANGE_LISTENERS = [];

let updateWho = ( updated ) => {
  let additions = updated.filter( dude => !WHO.find( old => dude.object === old.object ) );
  let removals = WHO.filter( old => !updated.find( dude => old.object === dude.object ) );
  // notify change listeners
  CHANGE_LISTENERS.forEach( listener => {
    listener( additions, removals );
  });
  WHO = updated;
};

// monitor the who url and run this function when it changes
reload.monitor( WHO_PATH, ( err, data ) => {
  if ( err ) {
    logger.error( 'failed while reading who list', err );
  } else {
    try {
      let entries = data.split('\n');
      let i = 0;
      let w = [];
      for ( i = 0; i < entries.length; i++ ) {
        let values = entries[i].split('::');
        if (values.length < 2) {
          continue;
        }
        // Name , idle_seconds, is_ic, bit, who_hidden, profile, object, connection_host, session_token, wow
        w[i] = {
          name    : values[0],
          idle    : values[1],
          ic      : values[2] === '1',
          bit     : values[3],
          hidden  : values[4] !== '1',
          profile : values[5] === '1',
          object  : values[6],
          host    : values[7],
          session : values[8],
          wow     : values[9],
          bgbbname: (values[10] == "<no bgbb name>" ? '' : values[10]),
          linkbgbb: (values[11] === '1')
        };
      }
      updateWho( w );
      logger.info( 'who list loaded with ' + i + ' connected' );
    } catch ( err ) {
      logger.error( 'failed while parsing who list', err );
    }
  }
}, CHECK_INTERVAL);

exports = module.exports;

// returns the who list to be attached to the locals
exports.who = function() {
  return WHO;
};

exports.listen = function( func ) {
  CHANGE_LISTENERS.push( func );
};

exports.specific = function( obj ) {
  return WHO.find( ( user ) => {
    if ( user[ 'object' ] === ( '#' + obj ) ) return user;
    return null;
  });
};

exports.count = function() {
  return WHO.length;
};