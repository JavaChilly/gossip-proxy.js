/*!
 * config abstraction
 * Make sure you have $NODE_ENV defined with the name of a config in the /config directory.
 */

var myName = process.env.NODE_ENV;
if ( myName ) {
  module.exports = require( "../config/" + myName );
}
