// create a socket connection
var socket = io.connect("http://174.121.252.222/live");

// diff_match_patch
var dmp = new diff_match_patch();

// our local copy of source
var source = "";

// when we receive a current_document event
socket.on('current_document', function (doc)
{
	console.log("Receiving the current document...");
	console.log(doc);
	source = doc;
	$('#source').val(doc);
	
	update();
});

// when we receive new patches
socket.on('patch', function (patches)
{
	if (document.getSelection().rangeCount > 0)
		var range = document.getSelection().getRangeAt(0);		
	
	source = dmp.patch_apply(patches, source)[0];
	$('#source').val(source);
	
	if (range != undefined && range)
		document.createRange(range);
	
	update();
});

$(function()
{
	$('#source').keydown(function (event)
	{								
		if (event.which == 9) // TAB
		{
			event.preventDefault();
			var selection = window.getSelection();
			selection.collapseToStart();
			document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
		}
		
		update();					
	});
	
	$('#source').keyup(function (event) { update(); });
	
	// when we scroll
	$('#source').scroll(function ()
	{
		$('#gutter').scrollTop($('#source').scrollTop());
	});	

	// toggle visibility
	$('#toggle_source').click(function (event)
	{
		if ($('.top').css('display') != "none" && $('.bottom').css('display') != "none")
		{
			$('.code').fadeOut(250, function ()
			{
				$('.top').animate({ bottom : '100%' }, 250, function () { $(this).css('display', 'none'); });
				$('.bottom').animate({ top : '0%' }, 250);
			});
		}
		else if ($('.bottom').css('display') != "none")
		{
			$('.top').css('display', 'block');
			$('.top').animate({ bottom : '50%' }, 250, function () { $('.code').fadeIn(250); });
			$('.bottom').animate({ top : '50%' }, 250);
		}
	});
	
	// toggle visibility
	$('#toggle_preview').click(function (event)
	{
		if ($('.bottom').css('display') != "none" && $('.top').css('display') != "none")
		{
			$('.preview').fadeOut(250, function ()
			{
				$('.top').animate({ bottom : '0%' }, 250);
				$('.bottom').animate({ top : '100%' }, 250, function () { $(this).css('display', 'none'); });
			});
		}
		else if ($('.top').css('display') != "none")
		{
			$('.bottom').css('display', 'block');
			$('.top').animate({ bottom : '50%' }, 250);
			$('.bottom').animate({ top : '50%' }, 250, function () { $('.preview').fadeIn(250); });
		}
	});
});

// this will be our updater
setInterval(function ()
{
	// don't update unless there is a change!
	if (source != $('#source').val())
	{
		// get patch old, new
		var patches = dmp.patch_make(source, $('#source').val());

		// update source with the patch
		source = dmp.patch_apply(patches, source)[0];
		
		// send patch to server
		if (source == $('#source').val())
			socket.emit('patch', patches);
	}
}, 100);

// this function updates the gutter			
function update()
{
	// update gutter
	var gutter_count = $('#gutter').children('div').length;
	
	if ($('#source').val().split('\n').length != $('.gutter').children('div').length)
	{
		$('#gutter').html('');
		$($('#source').val().split('\n')).each(function (i, c)
		{
			$('#gutter').append($('<div>').addClass('line').text(i + 1));
		});
	}
	
	var html = "";
	$($('#source').val().split('\n')).each(function (i, v) 
	{ 
		html += v.trim();
	});
	$('#preview').contents().find('body').html(html);
}