var express = require('express');
var GraphHTTP = require('express-graphql');
var session = require('express-session');
var User = require('./db/db').User;
var app = express();
var http = require('http').Server(app); //Should be https.  Change later after testing
var port = process.env.PORT || 3000;
var Schema = require('./db/Schema');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyparser = require('body-parser');
var cors = require('cors');
require('./auth/auth');

var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync(__dirname + '/key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);


var os = require('os');
var io = require('socket.io')(httpsServer);


app.use(express.static('client'));
app.use(express.static(__dirname + '/../client/'));
app.use(session({secret: 'lets ReTok'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
// app.use(bodyparser.json());

// // configure strategy
// function verifyPassword(password, dbPassword) {
// 	if (password === dbPassword) {
// 		return true;
// 	} else {
// 		return false
// 	}
// };


// passport.use(new LocalStrategy(
// 	function(username, password, done) {
// 	// search username and password for comparison
// 		User.findAll({where: {username: username}})
// 		.then(function(user) {
// 			console.log('user: ', user);
// 			if (user.length === 0) {return done(null, false, {message: 'wrong username'});}
// 			if (!verifyPassword(password, user[0].password)) {return done(null, false, {message: 'wrong message'});}
// 			return done(null, user);
// 		});
// 	}
// ));

// passport.serializeUser(function(user, done) {
// 	console.log('user in serializeUser: ', user);
// 	done(null, user[0].id);
// });
// passport.deserializeUser(function(id, done) {
// 	console.log('id: ', id);
// 	User.findAll({where: {id: id}})
// 	.then(function(user) {
// 		console.log("done", done);
// 		done(null, user);
// 	})
// 	.catch(function(err){
// 		done(err, null);
// 	})
// });

app.use('/graphql', GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: true
}));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// app.post('/test', function(req, res) {
// 	console.log('checking req body', req.body);
// });

app.post('/login', passport.authenticate('local', {
  // successRedirect: '/',
  failureRedirect: '/',
}) ,function(req, res) {

  var userID = req.session.passport.user;
  console.log('checking my request over here -------->', req.session.passport.user);

  User.findAll({where:{id: userID}}).then(function(user) {
    console.log('confirming i have user information', user);
    res.status(200).send(user);
  });

  // var url = req.url;
  // res.render('/profile');

  // res.redirect('/profile/' + req.user.username);
});

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('connection', function(socket) {
  	log('socket has connected');
  });

  socket.on('message', function(message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var numClients = Object.keys(io.sockets.sockets).length;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 1) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients >= 2) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else if(numClients > 2) {
    	var user = io.sockets.adapter.rooms[room];
    	console.log(user, 'number of users', user.length);
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        } 
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });


	res.status(200).send('welcome');
	// res.redirect('/profile/' + req.user.username);

});

app.get('/logout', function (req, res){
	req.logout();
	res.redirect('/');
});

http.listen(port, function(data) {
  console.log('listening on ' + port);

});


httpsServer.listen(8443);