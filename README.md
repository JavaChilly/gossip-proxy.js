# gossip-proxy.js

Very rough http proxy for communicating with Grapevine from a MUD/MOO. Uses the `gossiphaus` NPM module to communicate with gossip and listens on an http port for commands from the MUD/MOO.

 1. `cp config/template.js config/<configname>.js`

 1. `vi config/<configname>.js` 

 1. (enter your details, `ESC:wq` to save)

 1. `export NODE_ENV=<configname>`

 1. `node gossip-proxy.js`
 
 ----
 
 config keys to edit:
 
 * `http.port` - the http port your MUD/MOO will talk to send messages to gossip
 * `debug` - set to `true` for moar logging info
 * `utf8` - if `false` or missing, will strip non ASCII characters.
 * `gossip.client_id`
 * `gossip.client_secret`
 * `gossip.channels` - gossip channels this proxy will relay to the MUD/MOO
 * `ban.path` - this file will be monitored for changes every `ban.interval` milliseconds (expected format of each line: `name@game|||whatever`)
 * `who.path` - this file will be monitored for changes every `who.interval` milliseconds (expected fields:  Name , idle_seconds, is_ic, bit, who_hidden, profile, object, connection_host, session_token, wow, separated by `::`)
 * `moo.host` - where your MUD/MOO is hosted
 * `moo.port` - what port your MUD/MOO listens for machine requests (might be your main port)
 * `moo.secret` - a token value that shows your trusted to send a machine request to the MUD/MOO
 * `moo.commands` - each of these is a command your MUD/MOO needs to support from unauthenticated users. When a command is sent, the first parameter will be the `moo.secret` defined in your config file.
 
 ----
 
 MUD/MOO command format:
 
 RECEIVE_BROADCAST: `${config.moo.commands.RECEIVE_BROADCAST} ${MOO_SECRET} "${payload.channel}" "${payload.name}@${payload.game}" ${msg}`
 
 RECEIVE_TELL: `${config.moo.commands.RECEIVE_TELL} ${MOO_SECRET} "${payload.from_game}" "${payload.from_name}" "${payload.to_name}" ${msg}`
 
 PLAYER_SIGNIN: `${config.moo.commands.PLAYER_SIGNIN} ${MOO_SECRET} "${payload.name}@${payload.game}"`

 PLAYER_SIGNIN: `${config.moo.commands.PLAYER_SIGNOUT} ${MOO_SECRET} "${payload.name}@${payload.game}"`

----

RESTful API exposed:

`/v1/channels/send/`: `POST` `JSON`

body parameter: `payload={ name, message, channel }`