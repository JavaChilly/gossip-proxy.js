/*
 * Reload - wrapper around fs.watch
 * 
 * This will immediately call the passed function
 * with the file loaded (initial load) and will call 
 * the same function each time the specified path 
 * changes.
 *
 * reload.monitor('/path/to/file/, function( err, contents ) {
 *   ...
 * });
 */
const fs = require( 'fs' ),
  logger = require( './logger' ).named( 'lib/reload' );

var RELOAD_CHECK_INTERVAL = 5000; // 5 seconds

var fetchData = function( path, callback ) {
  fs.readFile( path, 'utf8', function( err, data ) {
    if ( err ) {
      callback( path, err );
    } else {
      logger.debug('fetched ' + path);
      callback( path, null, data );
    }
  });
}

var exports = module.exports;

exports.metrics = { 'reload_cache' : {} };
var RELOADING = exports.metrics.reload_cache;

exports.monitor = function( path, func, checkInterval ) {
  logger.debug( 'reload monitoring ' + path );
  if (arguments.length < 3) {
    checkInterval = 60000;
  }
  
  // store the filepath to be reloaded and 
  // the function to call when its reloaded
  // this object will be referred to as 'state' in the setInterval below
  RELOADING[ path ] = { 'triggered' : false, 'interval' : checkInterval, 'func' : func, 'lastLoaded' : (new Date()).getTime() };
  
  // perform the initial loading
  fetchData( path, function( path, err, data ) {
    if ( err ) {
      logger.error( 'fatal error while initializing [' + path + '] for reload' );
    } else {  
      fs.watchFile( path, function( curr, prev ) {
        // we can't trust the watch function to only report one event for one change
        // so we check if its been modified since we lastLoaded
        if ( curr.mtime.getTime() > RELOADING[ path ].lastLoaded ) {
          logger.debug( 'watched path ' + path + ' has changed and will be reloaded soon' );
          RELOADING[ path ].triggered = true;
        }
      });
    }
    RELOADING[ path ].func( err, data );
  });
}

setInterval(function() {
  // check each path we're watching to see if any were triggered recently
  RELOADING.forEach(function( state, path ) {
    if ( state.triggered ) {
      // if it was triggered, we reset the flag and call our function
      state.triggered = false;
      fetchData( path, function( path, err, data ) {
        if ( err ) {
          logger.error( 'error while reloading [' + path + ']', err );
        }
        // no matter what, we call the function, it can deal with any errors
        state.lastLoaded = (new Date()).getTime();
        state.func( err, data );
      });
    }
  });
}, RELOAD_CHECK_INTERVAL);
