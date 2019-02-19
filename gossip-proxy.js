const config = require('./lib/config' ),
      gossip = require( './lib/gossip' ),
        http = require( 'http' ),
     express = require( 'express' ),
      logger = require('morgan' ),
      routes = { index: require( './routes' ), channels: require( './routes/channels' ) };

let app = express();
app.server = http.createServer( app );

app.use( logger( config.morgan ) );

app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );

app.use( '/', routes.index );
app.use('/:version/channels', routes.channels );

// catch 404
app.use(function( req, res, next ) {
  res.json( { code: 404, message: 'Unsupported API Method' } );
});

// error handler
app.use(function( err, req, res ) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};

  // render the error page
  res.status( err.status || 500 );
  res.json( err );
});

gossip.setup().then(() => {
  app.server.listen( config.http.port, () => {
    console.log(`Gossip Proxy listening on port ${app.server.address().port}`);
  });
}).catch( err => {
  console.log( 'fatal error while setting up gossip connection', err );
  process.exit(1);
});
