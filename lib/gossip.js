const config = require( './config' ),
     logging = require( './logger' ),
         moo = require( './moo' ),
   banfilter = require( './banfilter' ),
         who = require( './who' ),
       clean = require( 'clean-text-utils' ),
      gossip = require( 'gossiphaus' );

const DEBUG = config.debug;
const logger = logging.named('lib/gossip' );

const GAME_NAME = config.moo.name || "GossipProxy.js";
const MOO_SECRET = config.moo.secret || (logger.error('fatal error, config.moo.secret undefined') && process.exit(1));

exports.setup = async () => {
  let emitter = gossip.init( config.gossip );

  emitter.on( 'error', err => logger.error( err ));

  emitter.on( 'channels/broadcast', payload => {
    logger.debug( payload );
    // relay to moo for channel

    if ( banfilter.isBanned(`${payload.name}@${payload.game}` ) ) return logger.warn( `BAN msg from ${payload.name}@${payload.game}` );

    logger.debug('message from : ' + payload.name + ' on ' + payload.game);

    // the moo does not support UTF-8, so we have to strip the characters here.
    const msg = clean.strip.nonASCII( payload.message );
    let cmd = `${config.moo.commands.RECEIVE_BROADCAST} ${MOO_SECRET} "${payload.channel}" "${payload.name}@${payload.game}" ${msg}`;
    moo.request( cmd, null, () => logger.debug( `MSG ${payload.channel}|${payload.name} + ${DEBUG ? '>> ' + payload.message : ''}`));
  });

  emitter.on( 'tells/receive', payload => {
    const msg = clean.strip.nonASCII( payload.message );
    let cmd = `${config.moo.commands.RECEIVE_TELL} ${MOO_SECRET} "${payload.from_game}" "${payload.from_name}" "${payload.to_name}" ${payload.message}`;
  });

  emitter.on( 'players/sign-in', payload => {
    let cmd = `${config.moo.commands.PLAYER_SIGNIN} ${MOO_SECRET} "${payload.name}@${payload.game}"`;
    moo.request( cmd, null, () => logger.info( `CON ${payload.name}@${payload.game}` ));
  });

  emitter.on( 'players/sign-out', payload => {
    let cmd = `${config.moo.commands.PLAYER_SIGNOUT} ${MOO_SECRET} "${payload.name}@${payload.game}"`;
    moo.request( cmd, null, () => logger.info( `DIS ${payload.name}@${payload.game}` ));
  });

  // connect to gossip network
  await gossip.connect();
  logger.debug( 'connected to gossip' );

  // listen for player changes from our who file
  // listen for player changes from our who file
  who.listen( ( additions, removals ) => {
    try {
      logger.debug( 'processing who updates ...' );
      if ( removals ) removals.forEach( async dude => {
        logger.debug( 'maybe removing ' + dude.name + ' (' + dude.hidden + ')' );
        if ( !dude.hidden ) {
          let answer = await gossip.removePlayer( dude.bgbbname );
          logger.debug( 'removed: ', answer );
        }
      } );
      if ( additions ) additions.forEach( async dude => {
        logger.debug( 'maybe adding ' + dude.name + ' (' + dude.hidden + ')' );
        if ( !dude.hidden ) {
          let answer = await gossip.addPlayer( dude.bgbbname );
          logger.debug( 'added: ', answer );
        }
      } );
    } catch (e) {
      logger.error( 'error while processing who updates:', e );
    }
  }, true); // true means we want to invoke this function with whatever is already in the who list
};

//let exports = module.exports;
exports.status = async () => {
  return {
    alive: gossip.isAlive(),
    games: gossip.games
  }
};

exports.channels = {
  send : async ( name, channel, message ) => {
    logger.debug('sending msg to gossip');
    let result = await gossip.send( 'channels/send',{ channel, name, message } );
    if ( result && result.status !== 'success' ) throw new Error( `error sending message: ${result.message}` );
    return result;
  }
};

