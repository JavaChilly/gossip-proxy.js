const express = require( 'express' ),
       gossip = require('../lib/gossip' ),
      logging = require('../lib/logger' );

const logger = logging.named('routes/index' );

let router = express.Router();

/* GET gossip connection status */
router.get('/', function(req, res, next) {
  gossip.status().then( status => {
    res.json( status );
  }).catch( err => {
    res.status(500).json( err );
  });
});

module.exports = router;
