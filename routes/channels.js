const express = require( 'express' ),
      gossip = require('../lib/gossip' ),
      logging = require('../lib/logger' );

const logger = logging.named('routes/channels' );

let router = express.Router();

/* GET send a message to a channel */
router.post('/send/', function( req, res, next ) {
  let { name, message, channel } = JSON.parse(req.body.payload);
  gossip.channels.send( name, channel, message ).then( result => {
    logger.debug( result );
    res.send( 'SENT' );
  }).catch( err => {
    logger.error('channel.send error: ', err );
  });
});

module.exports = router;
