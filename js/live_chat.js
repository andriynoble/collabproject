// create a socket connection
var socket_chat = io.connect('http://174.121.252.222/chat');

// your name
var you = "";

// waiting for op...
var waiting_for_op;

// for popping in and out the chat
var checking_left = false;
var checking_right = false;

// create the ting
var ting = document.createElement('audio');
ting.setAttribute('preload', 'auto');

// when we receive the log event we will update the chat with the current log
socket_chat.on('log', function (data)
{
	console.log("Incomming!")
	
	// loop over each message and update recursively
	$.each(data['messages'], function(i, message)
	{
		updateChat(message, true);
	});
});

// when we receive a message
socket_chat.on('msgin', function (message)
{
	// play the ting
	ting.setAttribute('src', 'res/ting.ogg');
	ting.play();
	
	// update the chat
	updateChat(message);
});

// when we receive a msgok that means our message went through fine
socket_chat.on('msgok', function ()
{
	// send updateChat your message in the object format
	updateChat({ name : 'You', message : $('#send').val() });
	// clear the input
	$('#send').val('');
	// clear the timeout 
	clearTimeout(waiting_for_op);
});

// adding messages to the chat log
function updateChat(message, old_message)
{
	// create the div
	$div = $('<div>').addClass('message');
	// if old_message is set then we will add the old_message class
	if (typeof(old_message) != 'undefined' && old_message)
		$div.addClass('old_message');
	// set the html for name and message also sanitizing
	$div.html('<span class="name">' + message['name'].replace(/(<([^>]+)>)/ig,"") + '</span>' + message['message'].replace(/(<([^>]+)>)/ig,""))	;
	// append the chat to the transcript
	$('#transcript').append($div);	
	// update scroll position
	scrollToBottom();
}

// scroll chat to the bottom
function scrollToBottom() { $('#transcript').scrollTop($('#transcript')[0].scrollHeight); }

// sending your message
function sendMessage()
{
	// take out those pesky html tags
	var message = $('#send').val().replace(/(<([^>]+)>)/ig,"");
	
	// if our name is blank
	if (you == "")
	{
		// pop up the name popup box to enter our name
		var ok_name = false;
		while (!ok_name)
		{
			var _you = prompt("What is your name?", "");
			you = _you.replace(/(<([^>]+)>)/ig,"");
			if (_you != "")
			{
				you = _you;
				localStorage.setItem('name', you);
				ok_name = true;
				break;
			}
		}			
	}
	
	// if our message is blank return
	if (message == "")
		return;
	
	// send our message to the server
	socket_chat.emit('msgout', { name : you, message : message });
	
	// after 30 seconds call the waitingForOP function
	waiting_for_op = setTimeout('waitingForOP()', 30000);
}

// waiting for the msgok this will be called after 30 seconds
function waitingForOP()
{
	alert("Something went wrong!  Your message did not reach the server.");
}

// jquery stuff
$(function()
{
	// grab the name if it's in local storage
	if (window['localStorage'])
	{
		var storage = window['localStorage'];
		if (storage.getItem('name'))
			you = storage.getItem('name');
	}
	
	// when you hit enter on your keyboard in the message box
	$('#send').keypress(function (event)
	{
		if (event.which == 13)
			sendMessage();
	});
	
	// toggle visibility
	$('#toggle_chat').click(function (event)
	{
		if ($('.right').css('display') != "none")
		{
			// fade out the chat first
			$('#transcript').fadeOut(250, function ()
			{
				$('.right').animate({ width : '0px'	}, 250, function () { $(this).css('display', 'none'); });
				$('.left').animate({ right : '0px' }, 250);
			});			
		}
		else
		{
			$('.right').css('display', 'block');
			scrollToBottom();
			$('.right').animate({ width : '320px' }, 250, function () { $('#transcript').fadeIn(250); });
			$('.left').animate({ right : '320px' }, 250);
		}
	});
});











