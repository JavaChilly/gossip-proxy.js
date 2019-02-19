/*
 * moo - functions for communicating directly with the moo
 *
 * Given a 'command', this will invoke 'lineParsefunction'
 * with a line of text output from the moo. When the connection
 * is closed, the 'finishedFunction' will be called.
 *
 * moo.request( req, command, lineParseFunction, finishedFunction);
 *
 */
const net = require( 'net' ),
     path = require( 'path' ),
   config = require( './config' ),
   logger = require( './logger' ).named( 'lib/moo' );

var mooRequest = function( command, lineParser, finished ) {
  var moo = net.connect( config.moo.port , config.moo.host, function() {
    moo.write(command + "\r\n");
  });

  moo.on( 'data',
    function( data ) {
      data = data.toString();
      var lines = data.split(/\r\n/);
      //logger.debug( lines );
      for ( var i = 0; i < lines.length; i++ ) {
        if (lineParser) lineParser( moo, lines[i] );
      }
    });

  moo.on( 'error', function() {
    logger.error(arguments);
  });

  if (finished != null) {
    moo.on( 'end', finished);
  }
};

exports = module.exports;

exports.request = function( command, lineParser, finished ) {
  if ( finished === undefined ) {
    finished = null;
  }
  mooRequest( command, lineParser, finished);
};
