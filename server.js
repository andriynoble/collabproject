// grab our variables we need
var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
	mongodbsessionstore = require('connect-mongodb'),
	dmpmod = require('diff_match_patch');

// start listening on port 80
app.listen(80);

// respond to incomming HTTP requests
function handler(request, response)
{
	// we are only going to serve up the index
	var url;
	if (request['url'].indexOf('.') == -1)
	{	
		if (request['url'] == '/')
			url = 'views/index.html';
		else
			url = 'views' + request['url'] + '.html'; 
	}
	else
		url = '.' + request['url'];
	
	// read the file
	fs.readFile(url, function(error, data)
	{
		// if there was a problem loading the file we will return a 500 error
		if (error)
		{
			response.writeHead(500);
			return response.end("Error loading " + url);
		}

		// 200 OK 
		// send the file to the browser
		response.writeHead(200);
		response.end(data);
	});
}

/**
 * login
 */



/**
 * chat
 */
// our logs object that stores a log of the chat 
var log = {	"messages" : [] };

// when we receive a socket connect
var chat = io.of('/chat').on('connection', function (socket) 
{	
	// send out a log of the messages so far
	socket.emit('log', log);
	
	// when we receive a message
    socket.on('msgout', function (data) 
	{
		// store the message in the log
		log['messages'].push(data);
		// emit back a message that we got the message
		socket.emit('msgok');
		// broadcast to everyone else this message
		socket.broadcast.emit('msgin', data);
	});
});

/**
 * live
 */

// get an instance off diff_match_patch
var dmp = new dmpmod.diff_match_patch();

// storing the server's copy of the source file
var documents = [];

var users = [];

var live = io.of('/live').on('connection', function (socket)
{
	// send them the current document
	socket.emit('current_document', source);
	
	// receive changes
	socket.on('patch', function (patches)
	{
		// apply the patch to the source
		source = dmp.patch_apply(patches, source)[0];
		
		// broadcast the patch to everyone else
		socket.broadcast.emit('patch', patches)
	});
});
