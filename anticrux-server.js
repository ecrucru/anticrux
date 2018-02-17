/*
	AntiCrux - Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile and Node.js
	Copyright (C) 2016-2018, ecrucru

		https://github.com/ecrucru/anticrux/
		http://ecrucru.free.fr/?page=anticrux

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	@license
*/

"use strict";


//======== Libraries
var net = require('net');
var AntiCrux = require('anticrux');


//======== Instance of the server
var server = net.createServer(function(pSocket) {
		//-- Rejects extra connections
		if (server.acsrv_connections >= server.acsrv_maxConnections)
		{
			server.acsrv_quit(pSocket, 'Too many connections.');
			return;
		}
		else
		{
			//pSocket.setTimeout(36000000);		//10 minutes
			server.acsrv_connections++;
			server.acsrv_session++;
			pSocket.acsrv_session = server.acsrv_session;
		}

		//-- Registers the socket
		if (!server.hasOwnProperty('acsrv_sockets'))
			server.acsrv_sockets = [];
		server.acsrv_sockets[pSocket.acsrv_session] = pSocket;

		//-- Default options
		pSocket.acsrv_options = {
			// Changeable options
			style : 1,								//Format to send the board
			block : false,							//Use blocks to parse the output of a sent command
			defprompt : false,						//Display "fics%" when a prompt is needed
			seekinfo : false,						//Receive the games waiting for a new player
			seekremove : false,						//Receive notifications for games no more waiting for players
			level : 5,								//Strength of the AI
			mode960 : false,						//Use predefined start positions
			noticePossibleVictory : true,			//Use kibitz to tell that the AI will win the current game
			// Internal variables (do not change)
			_lastBlock : '',						//Identifier of the last received block
			_pendingChallenge : false,				//Is accept/decline pending ?
			// Protected options
			_maxLevel : 20,							//The level impacts the memory, especially when you have multiple players
			_playOnConnect : false,					//Proposition of a new game on startup
			_enableDebug : false,					//Debug: enable some extra commands
			_consoleInboundFlow : false,			//Debug: show all the received commands
			_consoleOutboundFlow : false,			//Debug: show all the emitted commands
			_shutdownPassword : ''					//Password to shutdown the server remotely (disabled if blank)
		};

		//-- New AI
		pSocket.acsrv_ai = new AntiCrux();
		pSocket.acsrv_ai.setLevel(pSocket.acsrv_options.level);
		pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.none;

		//-- Functions
		pSocket.acsrv_send_seeks = function() {
			if (this.acsrv_options.seekinfo && (this.acsrv_state !== 'playing'))
			{
				this.acsrv_post_raw('<sc>');
				if (!this.acsrv_options._pendingChallenge)
					this.acsrv_post_raw('<s> '+this.acsrv_session+' w=AntiCrux ti=02 rt='+this.acsrv_ai.options.ai.elo+'E t=180 i=180 r=u tp=suicide c=? rr=0-9999 a=t f=t');
				return true;
			}
			else
				return false;
		};

		pSocket.acsrv_remove_seeks = function() {
			if (this.acsrv_options.seekremove)
			{
				this.acsrv_post_raw('<sr> '+this.acsrv_session);
				return true;
			}
			else
				return false;
		};

		pSocket.acsrv_post = function(pContent, pDefPrompt) {
			var buffer;

			// Data to the client
			buffer = pContent;
			if (buffer.length > 0)
				buffer += "\r\n";
			if (this.acsrv_options.block && (this.acsrv_options._lastBlock.length > 0))
				buffer = String.fromCharCode(15) + this.acsrv_options._lastBlock + String.fromCharCode(16) + buffer + String.fromCharCode(17) + "\r\n";
			this.acsrv_options._lastBlock = '';
			if (pDefPrompt && this.acsrv_options.defprompt)
				buffer += 'fics% ';
			this.write(buffer);

			// Data to the console
			if (pSocket.acsrv_options._consoleOutboundFlow)
			{
				buffer = pContent.split("\r").join('').split("\n").join("\\n");
				if (buffer.length > 0)
					server.acsrv_console(pSocket, '> '+buffer);
			}
		};

		pSocket.acsrv_post_raw = function(pContent) {
			var tmp = this.acsrv_options._lastBlock;
			this.acsrv_options._lastBlock = '';
			this.acsrv_post(pContent, false);
			this.acsrv_options._lastBlock = tmp;
		};

		pSocket.acsrv_set_state = function(pState) {
			this.acsrv_state = pState;
			if (this.acsrv_options._consoleInboundFlow || this.acsrv_options._consoleOutboundFlow)
				server.acsrv_console(pSocket, 'State changed to "'+this.acsrv_state+'"');
		};

		//-- Welcome screen
		pSocket.acsrv_post(
			"\r\n" +
			"      ______________________________________________\r\n" +
			"    < AntiCrux " + pSocket.acsrv_ai.options.ai.version + " will win unless you are good... >\r\n" +
			"      ----------------------------------------------\r\n" +
			"             \\   ^__^\r\n" +
			"              \\  (oo)\\_______\r\n" +
			"                 (__)\\       )\\/\\\r\n" +
			"                  U  ||----w |\r\n" +
			"                     ||     ||\r\n" +
			"\r\n" +
			"\r\n" +
			"  Get it for free at https://github.com/ecrucru/anticrux/\r\n" +
			"\r\n" +
			"  To be compatible with any existing chess program, the server\r\n" +
			"  mimics FICS, but it is not a FICS server. Don't be confused !\r\n" +
			"\r\n" +
			"  Activate AntiChess960 with the command : set mode960 on\r\n" +
			"  Change the level between 1 and 20 with : set level 10\r\n" +
			"\r\n" +
			"\r\n" +
			"========================================================================\r\n" +
			"\r\n", false);
		pSocket.write('login: ');
		pSocket.acsrv_set_state('login');

		//-- Events for the socket
		pSocket.on('data', function(data) {
			if (!pSocket.hasOwnProperty('acsrv_datastream'))
				pSocket.acsrv_datastream = '';
			pSocket.acsrv_datastream += data;
			server.acsrv_process(pSocket);
		})
		.on('error', function(/*err*/) {
			//throw err;
		})
		.on('close', function(/*had_error*/) {
			server.acsrv_connections--;
		});
	})

	//-- Events for the server
	.on('error', function(err) {
		throw err;
	})
	.on('listening', function() {
		// Definitions
		server.acsrv_upDate = (new Date().toUTCString());
		server.acsrv_maxConnections = 6;
		server.acsrv_connections = 0;
		server.acsrv_session = 0;
		server.acsrv_stats = { win:0, loss:0, draw:0 };
		// Verboses
		console.log('');
		console.log('AntiCrux Server '+(new AntiCrux().options.ai.version)+' is now listening to new connections on port '+server.address().port+'...');
		console.log('https://github.com/ecrucru/anticrux/');
		console.log('License: GNU Affero General Public License version 3');
		console.log('');
		console.log('Press Ctrl+C to kill the server.');
		console.log('');
	})
;


//======== Routines

server.acsrv_fixedString = function(pMessage, pLength, pBefore) {
	var result = pMessage;
	if (pBefore === undefined)
		pBefore = false;
	if (typeof result !== 'string')
		result = result.toString();
	while (result.length < pLength)
	{
		if (pBefore)
			result = ' ' + result;
		else
			result += ' ';
	}
	return result;//.substring(0, pLength);
};

server.acsrv_uptime = function(pSeconds) {
	var d, h, m, s;

	//-- Converts
	s = Math.floor(pSeconds);
	d = Math.floor(s / 86400);
	h = Math.floor((s - 86400*d) / 3600);
	m = Math.floor((s - 86400*d - 3600*h) / 60);
	s = s - 86400*d - 3600*h - 60*m;

	//-- Formats
	return d+' days, '+h+' hrs, '+m+' mins, '+s+' secs';
};


//======== Processing

server.acsrv_count_sockets = function() {
	var session, counter;

	//-- Identifies the valid connections
	counter = 0;
	for (session in server.acsrv_sockets)
	{
		if (server.acsrv_sockets[session].destroyed)
		{
			delete server.acsrv_sockets[session];
			continue;
		}
		counter++;
	}
	return counter;
};

server.acsrv_process = function(pSocket) {
	var pos, line, match, tab, i, b, news, move, node, hist, buffer, tmp, white, black;

	while (true)
	{
		//-- Gets the next line of data
		pos = pSocket.acsrv_datastream.indexOf("\n");
		if (pos === -1)
			break;
		line = pSocket.acsrv_datastream.substring(0, pos);
		pSocket.acsrv_datastream = pSocket.acsrv_datastream.substring(pos+1);
		line = line.split("\r").join('');
		line = line.split('@').join('');
		line = line.split('$').join('').trim();
		match = line.match(/^([0-9])+\s(.*)$/);
		if (match !== null)
		{
			pSocket.acsrv_options._lastBlock = match[1];
			line = match[2].trim();
		}
		else
			pSocket.acsrv_options._lastBlock = '';
		if (pSocket.acsrv_options._consoleInboundFlow && (line.length !== 0))
			server.acsrv_console(pSocket, '< '+line);
		tab = line.toLowerCase().split(' ');
		for (i=0 ; (i<10) || (i<tab.length) ; i++)
			if (typeof tab[i] === 'undefined')
				tab[i] = '';

		//-- Global commands
		if (['login', 'confirm_login'].indexOf(pSocket.acsrv_state) == -1)
		{
			//- Quits the application
			if (	((tab[0] == 'quit') || (tab[0] == 'bye') || (tab[0] == 'exit')) &&
					(pSocket.acsrv_state != 'playing')
			) {
				server.acsrv_quit(pSocket, 'Bye!');
				return;
			}

			//- Shutdown (unofficial)
			if (tab[0] == 'shutdown')
			{
				line = line.substring(9, line.length);
				if (pSocket.acsrv_options._shutdownPassword.length === 0)
					pSocket.acsrv_post('This command is disabled.', true);
				else
					if (line == pSocket.acsrv_options._shutdownPassword)
						server.acsrv_shutdown();
					else
					{
						server.acsrv_console(pSocket, 'Failed attempt to shutdown the server');
						pSocket.acsrv_post('Incorrect password to shut down the server.', true);
					}
				continue;
			}

			//- Best players
			if (tab[0] == 'best')
			{
				pSocket.acsrv_post(
					"         Suicide\r\n" +
					"   1. AntiCrux     " + pSocket.acsrv_ai.options.ai.elo + "\r\n" +
					"   2. " + server.acsrv_fixedString(pSocket.acsrv_login, 12) + " ++++",
					true);
				continue;
			}
			if (tab[0] == 'cbest')
			{
				pSocket.acsrv_post("         Suicide\r\n   1. AntiCrux     " + pSocket.acsrv_ai.options.ai.elo, true);
				continue;
			}
			if (tab[0] == 'hbest')
			{
				pSocket.acsrv_post("         Suicide\r\n   1. " + server.acsrv_fixedString(pSocket.acsrv_login, 12) + " ++++", true);
				continue;
			}

			//- Date
			if (tab[0] == 'date')
			{
				pSocket.acsrv_post('Server time    - '+(new Date().toUTCString()), true);
				continue;
			}

			//- Debug
			if ((tab[0] == 'debug') && pSocket.acsrv_options._enableDebug)
			{
				pSocket.acsrv_post(line.substring(6, line.length), true);
				continue;
			}

			//- Uptime
			if (tab[0] == 'uptime')
			{
				pSocket.acsrv_post(
					"AntiCrux Server " + pSocket.acsrv_ai.options.ai.version + "\r\n" +
					"The server has been up since " + server.acsrv_upDate + ".\r\n" +
					"(Up for " + server.acsrv_uptime(process.uptime()) + ")\r\n" +
					"\r\n" +
					"There are currently "+server.acsrv_count_sockets()+" players.\r\n" +
					"\r\n" +
					"Player limit: "+server.acsrv_maxConnections+" users (+ 0 admins)\r\n" +
					"Unregistered user restriction at "+server.acsrv_maxConnections+" users.",
					true
				);
				continue;
			}

			//- News
			if (tab[0] == 'news')
			{
				buffer = '';
				news = [	'1 (Sat, Feb  4, 2017) AntiCrux Server is under development',
							'2 (Sun, Feb  5, 2017) AntiCrux Server will be available on GitHub',
							'3 (Sun, Feb 12, 2017) The first release of AntiCrux Server is ready',
							'4 (Thu, Feb 16, 2017) AntiCrux Server now plays AntiChess960',
							'5 (Sat, Feb 17, 2018) AntiCrux Server is improved',
						];
				for (i=0 ; i<news.length ; i++)
				{
					if (buffer.length > 0)
						buffer += "\r\n";
					buffer += news[i];
				}
				pSocket.acsrv_post(buffer, true);
				continue;
			}

			//- Message to the server
			if (tab[0] == 'say')
			{
				server.acsrv_console(pSocket, line.substring(4));
				pSocket.acsrv_post('', true);
				continue;
			}

			//- Message to all the users on the server
			if (tab[0] == 'shout')
			{
				server.acsrv_shout(pSocket, line.substring(6));
				continue;
			}

			//- Group of users
			if (tab[0] == 'showlist')
			{
				if (tab[1].length === 0)
					pSocket.acsrv_post("Lists:\r\n\r\ncomputer             is PUBLIC", true);
				else
					if (tab[1] == 'computer')
						pSocket.acsrv_post("-- computer list: 1 name --\r\nAntiCrux", true);
					else
						pSocket.acsrv_post('"'+tab[1]+'" does not match any list name.', true);
				continue;
			}

			//- Limits
			if (tab[0] == 'limits')
			{
				pSocket.acsrv_post(
					"Current hardcoded limits (maximums unless specified otherwise):\r\n" +
					"  Server:\r\n" +
					"    Channels: 0\r\n" +
					"    Players: "+server.acsrv_maxConnections+"\r\n" +
					"    Connections: "+server.acsrv_maxConnections+" users (+ 0 admins)\r\n" +
					"\r\n" +
					"  Lists:\r\n" +
					"    Censor: 0\r\n" +
					"    Channels: 0\r\n" +
					"    Gnotify: 0\r\n" +
					"    Noplay: 0\r\n" +
					"    Notify: 0\r\n" +
					"\r\n" +
					"  Games:\r\n" +
					"    Adjourned games: 0\r\n" +
					"    History games: 0\r\n" +
					"    Journal entries: 0\r\n" +
					"    Observed games: 0\r\n" +
					"    RD to be active: 0\r\n" +
					"    Seeks pending: 1\r\n" +
					"    Simul participants: 0\r\n" +
					"\r\n" +
					"  Misc:\r\n" +
					"    Aliases: 0\r\n" +
					"    Messages: 0\r\n" +
					"    Messages to a player in 24 hours: 0\r\n" +
					"    Maximum communication size: 0 character.",
					true
				);
				continue;
			}

			//- Active games
			if (tab[0] == 'games')
			{
				server.acsrv_games(pSocket);
				continue;
			}

			//- List of players
			if (tab[0] == 'handles')
			{
				server.acsrv_handles(pSocket, tab[1]);
				pSocket.acsrv_post('', true);
				continue;
			}

			//- List of players for starting a game : AntiCrux only :-)
			if (tab[0] == 'who')
			{
				pSocket.acsrv_post(pSocket.acsrv_ai.options.ai.elo + ' AntiCrux(C)', true);
				continue;
			}

			//- Options and silenced commands
			if (tab[0] == 'alias')
			{
				pSocket.acsrv_post('', true);
				continue;
			}
			if (tab[0] == 'style')
			{
				tab = ['set', 'style', '12'];
				//No continue
			}
			if ((tab[0] == 'set') || (tab[0] == 'iset'))
			{
				if (tab[1] == 'interface')
					server.acsrv_console(pSocket, 'Declared software: ' + line.substring(14));
				else if ((tab[1] == 'style') && (tab[2].length > 0))
				{
					pSocket.acsrv_options.style = parseInt(tab[2]);
					pSocket.acsrv_post('Style '+pSocket.acsrv_options.style+' set.', true);
				}
				else if (tab[1] == 'level')
				{
					if (!tab[2].match(/^[0-9]+$/))
						pSocket.acsrv_post('Unknown level '+tab[2]+'.', true);
					else
					{
						i = Math.max(1, Math.min(parseInt(tab[2]), pSocket.acsrv_options._maxLevel, 20));
						if (pSocket.acsrv_ai.setLevel(i))
						{
							pSocket.acsrv_options.level = i;
							pSocket.acsrv_post('Level '+i+' set.', true);
							pSocket.acsrv_send_seeks();
						}
						else
							throw 'Internal error';
					}
				}
				else
				{
					if (!tab[1].match(/^[a-zA-Z0-9]+$/) || !pSocket.acsrv_options.hasOwnProperty(tab[1]))
						pSocket.acsrv_post('No such variable "'+tab[1]+'".', true);
					else
					{
						switch (typeof pSocket.acsrv_options[tab[1]])
						{
							case 'string':
								pSocket.acsrv_options[tab[1]] = tab[2];
								break;
							case 'boolean':
								pSocket.acsrv_options[tab[1]] = (['true', 'on', '1'].indexOf(tab[2].toLowerCase()) !== -1);
								break;
							case 'number':
								pSocket.acsrv_options[tab[1]] = parseInt(tab[2]);
								break;
							default:
								throw 'Internal error';
						}
						pSocket.acsrv_post('Variable "'+tab[1]+'" set.', true);
						if (tab[1].indexOf('seek') !== -1)
							pSocket.acsrv_send_seeks();
					}
				}
				continue;
			}

			//- Variables
			if (['var', 'variable', 'variables'].indexOf(tab[0]) !== -1)
			{
				buffer = "Variable settings of "+pSocket.acsrv_login+":\r\n";
				for (tmp in pSocket.acsrv_options)
					if (tmp.substring(0, 1) != '_')			//Private values
						buffer += "\r\n" + tmp + '=' + pSocket.acsrv_options[tmp];
				pSocket.acsrv_post(buffer, true);
				continue;
			}

			//- Refresh
			if (tab[0] == 'refresh')
			{
				if (pSocket.acsrv_state != 'playing')
				{
					pSocket.acsrv_post('You are neither playing, observing nor examining a game.', true);
					continue;
				}
			}

			//- Finger
			if (tab[0] == 'finger')
			{
				if (tab[1].length === 0)
					pSocket.acsrv_post('You are '+pSocket.acsrv_login+'.', true);
				else if (tab[1] == pSocket.acsrv_login.toLowerCase())
					pSocket.acsrv_post(
						"Finger of "+pSocket.acsrv_login+":\r\n" +
						"\r\n" +
						"Session: "+pSocket.acsrv_session+"\r\n" +
						"\r\n" +
						" 1: Your account cannot be registered.\r\n" +
						" 2: You only have one opponent, aka AntiCrux "+pSocket.acsrv_ai.options.ai.version+" rated at "+pSocket.acsrv_ai.options.ai.elo+".\r\n" +
						" 3: Do you enjoy classical chess ? It is the wrong place to be here, unless you also like suicide chess.\r\n",
						true
					);
				else if (tab[1] == 'anticrux')
					pSocket.acsrv_post(
						"Finger of AntiCrux(C):\r\n" +
						"\r\n" +
						"On for: "+server.acsrv_uptime(process.uptime())+"\r\n" +
						"\r\n" +
						"          rating     RD      win    loss    draw   total   best\r\n" +
						"Suicide   "+pSocket.acsrv_ai.options.ai.elo+"       ?       "+server.acsrv_fixedString(server.acsrv_stats.win, 4)+"   "+server.acsrv_fixedString(server.acsrv_stats.loss, 4)+"    "+server.acsrv_fixedString(server.acsrv_stats.draw, 4)+"   "+server.acsrv_fixedString(server.acsrv_stats.win+server.acsrv_stats.loss+server.acsrv_stats.draw, 4)+"    "+pSocket.acsrv_ai.options.ai.elo+" (today)\r\n" +
						"\r\n" +
						"Timeseal: Off\r\n" +
						"\r\n" +
						" 1: This computer plays AntiChess only, a.k.a. suicide chess.\r\n" +
						" 2: The engine born in 2016 is AntiCrux "+pSocket.acsrv_ai.options.ai.version+" available on GitHub.\r\n" +
						" 3: I use neither database, nor time control. Using the opening book depends on the selected strength.\r\n" +
						" 4: I use classical techniques to play, unless you change my level.\r\n" +
						" 5: I play unrated games, so I will accept most of your commands.\r\n" +
						" 6: I will certainly never play other variants than AntiChess.",
						true
					);
				else
					pSocket.acsrv_post('There is no player matching the name '+tab[1]+'.', true);
				continue;
			}

			//- Help based on the online documentation (http://www.freechess.org/Help/HelpFiles/[COMMAND].html)
			if ((tab[0] == 'info') || (tab[0] == 'help'))
			{
				pSocket.acsrv_post(
					"\r\n" +
					"Supported commands:\r\n" +
					"  abort                   Cancel the current game\r\n" +
					"  accept                  Accept a match proposed by AntiCrux\r\n" +
					"  best/cbest/hbest        Show the best rated players\r\n" +
					"  date                    Show the date\r\n" +
					"  debug [command]         Ask the server to send a given command (debug)\r\n" +
					"  decline                 Refuse a match proposed by AntiCrux\r\n" +
					"  draw                    Offer a draw\r\n" +
					"  finger [player]         Show some information about a player\r\n" +
					"  flip                    Rotate the board\r\n" +
					"  games                   List the active games\r\n" +
					"  getgame                 Invoke 'match AntiCrux suicide'\r\n" +
					"  handles [mask]          Show the list of players\r\n" +
					"  help/info               Show the list of available commands\r\n" +
					"  history                 View the history games (unmanaged)\r\n" +
					"  journal                 View the journal (unmanaged)\r\n" +
					"  limits                  Display the limits of the server\r\n" +
					"  match AntiCrux suicide  Start an unrated game against AntiCrux\r\n" +
					"  moves                   Show the history of the moves\r\n" +
					"  news                    Show the news of the server\r\n" +
					"  nickname [name]         Change your name\r\n" +
					"  play [id]               Play the game which ID is given by 'sought' or seek\r\n" +
					"  promote                 Predefine the piece for the promotions\r\n" +
					"  quit                    Leave the program\r\n" +
					"  refresh                 Display the board\r\n" +
					"  rematch                 Ask for a new match\r\n" +
					"  resign                  Declare one's own defeat\r\n" +
					"  say [message]           Send a message to AntiCrux\r\n" +
					"  seek unrated suicide    Find a partner\r\n" +
					"  showlist                Display the list of users\r\n" +
					"  shout [message]         Send a message to all the players\r\n" +
					"  shutdown [password]     Remote shutdown of the server\r\n" +
					"  sought                  List the available games\r\n" +
					"  stored                  View the adjourned games (unmanaged)\r\n" +
					"  switch                  Exchange the players\r\n" +
					"  takeback                Undo your last move\r\n" +
					"  uptime                  Give some details about the server\r\n" +
					"  variable                Show the active options\r\n" +
					"  who                     Show the available players\r\n" +
					"\r\n" +
					"Unsupported commands:\r\n" +
					"  addlist, adjourn, alias, allobservers, assess, backward, bell,\r\n" +
					"  boards, bsetup, bugwho, clearmessages, convert_bcf, convert_elo,\r\n" +
					"  convert_uscf, copygame, crank, cshout, examine, flag, fmessage,\r\n" +
					"  follow, forward, gnotify, goboard, hrank, inchannel, it, jkill,\r\n" +
					"  jsave, kibitz, llogons, logons, mailhelp, mailmess, mailmoves,\r\n" +
					"  mailoldmoves, mailsource, mailstored, messages, mexamine, moretime,\r\n" +
					"  next, observe, oldmoves, password, pause, pending, pfollow, play,\r\n" +
					"  pobserve, pstat, qtell, rank, resume, revert, set, simabort,\r\n" +
					"  simadjourn, simallabort, simalladjourn, simgames, simmatch, simnext,\r\n" +
					"  simobserve, simopen, simpass, simprev, smoves, smposition, sposition,\r\n" +
					"  statistics, style, sublist, tell, time, unalias, unexamine, unobserve,\r\n" +
					"  unpause, unseek, swhisper, withdraw, xkibitz, xtell, xwhisper, znotify\r\n",
					true
				);
				continue;
			}
		}

		//-- Logs under the provided name
		if (pSocket.acsrv_state == 'login')
		{
			if (line.match(/^[a-zA-Z0-9]+$/) && !line.match(/anticrux/i))
				pSocket.acsrv_login = line;
			else
			{
				server.acsrv_quit(pSocket, 'Invalid login name');		//Timeseal is not supported
				return;
			}

			pSocket.acsrv_post('Press return to enter the server as "' + pSocket.acsrv_login + '":', false);
			pSocket.acsrv_set_state('confirm_login');
			continue;
		}

		//-- Confirms the login
		if ((pSocket.acsrv_state == 'confirm_login') && (line.length === 0))
		{
			//- Accepts the player
			pSocket.acsrv_post("**** Starting FICS session as " + pSocket.acsrv_login + "(U) ****\r\nfics% ", false);	//Important syntax to recognize the type of server
			server.acsrv_console(pSocket, 'New connected player');

			//- Transmits the notification
			pSocket.acsrv_set_state('home');
			if (pSocket.acsrv_options._playOnConnect)
			{
				pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.none;		//The color is always random, but the player can force it by proposing another match
				pSocket.acsrv_options._pendingChallenge = true;
				buffer = "Challenge: AntiCrux ("+pSocket.acsrv_ai.options.ai.elo+") "+pSocket.acsrv_login+" (++++) unrated suicide 180 180.\r\n" +
						'You can "accept" or "decline", or propose different parameters.';
				pSocket.acsrv_post(buffer, true);
			}
			continue;
		}

		//-- Command during the game
		if (pSocket.acsrv_state == 'playing')
		{
			switch (tab[0])
			{
				//- Leaves the game
				case 'bye':
				case 'exit':
				case 'quit':
				case 'adjourn':
					pSocket.acsrv_post('You must first abort the game.', true);
					break;

				//- Aborts the current game (automatically accepted)
				case 'abort':
					if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
						pSocket.acsrv_post('{Game '+pSocket.acsrv_session+' (AntiCrux vs. '+pSocket.acsrv_login+') Game aborted by mutual agreement} *', true);
					else
						pSocket.acsrv_post('{Game '+pSocket.acsrv_session+' ('+pSocket.acsrv_login+' vs. AntiCrux) Game aborted by mutual agreement} *', true);
					pSocket.acsrv_set_state('home');
					pSocket.acsrv_send_seeks();
					break;

				//- Resigns the current game (automatically accepted)
				case 'resign':
					server.acsrv_stats.win++;
					if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
						pSocket.acsrv_post('{Game '+pSocket.acsrv_session+' (AntiCrux vs. '+pSocket.acsrv_login+') '+pSocket.acsrv_login+' resigns} 1-0', true);
					else
						pSocket.acsrv_post('{Game '+pSocket.acsrv_session+' ('+pSocket.acsrv_login+' vs. AntiCrux) '+pSocket.acsrv_login+' resigns} 0-1', true);
					pSocket.acsrv_set_state('home');
					pSocket.acsrv_send_seeks();
					break;

				//- Accepts a new game
				case 'play':
					pSocket.acsrv_post('You cannot accept seeks while you are playing a game.', true);
					break;

				//- Rotates the board
				case 'flip':
					pSocket.acsrv_ai.options.board.rotated = !pSocket.acsrv_ai.options.board.rotated;
					server.acsrv_board(pSocket);
					break;

				//- Switches the board
				case 'switch':
					pSocket.acsrv_post('AntiCrux accepts the switch request.', false);
					pSocket.acsrv_aicolor = (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.black ? pSocket.acsrv_ai.constants.player.white : pSocket.acsrv_ai.constants.player.black);
					server.acsrv_play_ai(pSocket);
					server.acsrv_board(pSocket);
					server.acsrv_end_game(pSocket);
					break;

				//- Receives a draw offer
				case 'draw':
					if (!pSocket.acsrv_ai.isDraw() && !pSocket.acsrv_ai.isPossibleDraw())
						pSocket.acsrv_post('AntiCrux declines the draw request.', true);
					else
					{
						server.acsrv_stats.draw++;
						buffer = "AntiCrux accepts the draw request.\r\n";
						if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
							buffer += "{Game "+pSocket.acsrv_session+" (AntiCrux vs. "+pSocket.acsrv_login+") Game drawn by mutual agreement} 1/2-1/2\r\n";
						else
							buffer += "{Game "+pSocket.acsrv_session+" ("+pSocket.acsrv_login+" vs. AntiCrux) Game drawn by mutual agreement} 1/2-1/2\r\n";
						buffer += 'No ratings adjustment done.';
						pSocket.acsrv_post(buffer, true);
						pSocket.acsrv_set_state('home');
						pSocket.acsrv_send_seeks();
					}
					break;

				//- Reverts the last move
				case 'takeback':
					if (pSocket.acsrv_ai.getHistory().length >= 2)
					{
						pSocket.acsrv_post('AntiCrux accepts the takeback request.', true);
						pSocket.acsrv_ai.undoMove();
						pSocket.acsrv_ai.undoMove();
					}
					else
						pSocket.acsrv_post('AntiCrux declines the takeback request.', true);
					server.acsrv_board(pSocket);
					break;

				//- Defines the piece to promote
				case 'promote':
					buffer = '';
					switch (tab[1])
					{
						case 'q':
							pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.queen;
							buffer = 'QUEEN';
							break;
						case 'r':
							pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.rook;
							buffer = 'ROOK';
							break;
						case 'b':
							pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.bishop;
							buffer = 'BISHOP';
							break;
						case 'k':
						case 'n':
							pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.knight;
							buffer = 'KNIGHT';
							break;
						case 'ki':
							pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.king;
							buffer = 'KING';
							break;
						default:
							tab[1] = '';
							break;
					}
					buffer = (buffer.length > 0 ? 'Promotion piece set to '+buffer+'.' : '');
					if (tab[1].length === 0)
						buffer +=	"Purpose:  set the piece a pawn will be promoted to at the back rank\r\n" +
									"Usage:    promote {q,r,b,[kn],ki}\r\n" +
									"Examples: promote q; promote b";
					pSocket.acsrv_post(buffer, true);
					break;

				//- Refreshes the board
				case 'refresh':
					server.acsrv_board(pSocket);
					break;

				//- Moves
				case 'moves':
					// Checks
					if ((tab[1].length > 0) && (parseInt(tab[1]) != pSocket.acsrv_session))
					{
						pSocket.acsrv_post('There is no such game.', true);
						continue;
					}

					// Init
					white = (pSocket.acsrv_aicolor==pSocket.acsrv_ai.constants.player.white ? 'AntiCrux' : pSocket.acsrv_login);
					black = (pSocket.acsrv_aicolor==pSocket.acsrv_ai.constants.player.black ? 'AntiCrux' : pSocket.acsrv_login);

					// Header
					buffer =	"Movelist for game "+pSocket.acsrv_session+":\r\n" +
								"\r\n" +
								white+" ("+(pSocket.acsrv_aicolor==pSocket.acsrv_ai.constants.player.white ? pSocket.acsrv_ai.options.ai.elo : '++++')+") vs. "+black+" ("+(pSocket.acsrv_aicolor==pSocket.acsrv_ai.constants.player.black ? pSocket.acsrv_ai.options.ai.elo : '++++')+") --- "+(new Date().toUTCString())+"\r\n" +
								"Unrated suicide match, initial time: 180 minutes, increment: 180 seconds.\r\n" +
								"\r\n" +
								"Move  " + server.acsrv_fixedString(white, 18) + " " + server.acsrv_fixedString(black, 18) + "\r\n" +
								"----  ----------------   ----------------\r\n";

					// History
					pSocket._trace = pSocket._trace || new AntiCrux();
					pSocket._trace.copyOptions(pSocket.acsrv_ai);
					if (pSocket._trace.loadFen(pSocket.acsrv_ai.getInitialPosition()))
					{
						hist = pSocket.acsrv_ai.getHistory();
						for (i=0 ; i<hist.length ; i++)
						{
							if (i % 2 === 0)
								buffer += server.acsrv_fixedString(Math.ceil((i+1)/2), 3, true) + '.  ';
							buffer += server.acsrv_fixedString(pSocket._trace.moveToString(hist[i]), 8) + '(0:00)     ';
							if (pSocket._trace.movePiece(hist[i], true, pSocket._trace.constants.player.none) == pSocket._trace.constants.noMove)
							{
								buffer = '';
								break;
							}
							if (i % 2 === 1)
								buffer += "\r\n";
						}
						if (i % 2 === 1)
							buffer += "\r\n";
					}

					// Status
					if (!pSocket.acsrv_ai.isEndGame())
						buffer += "	  {Still in progress} *\r\n";
					pSocket.acsrv_post(buffer, true);
					break;

				//- Move a piece
				default:
					line = line.split('-').join('');
					if (!pSocket.acsrv_ai.isMove(line))
					{
						if (tab[0].length > 0)
							pSocket.acsrv_post('Unknown command: '+tab[0], true);
					}
					else
					{
						if (pSocket.acsrv_ai.getPlayer() == pSocket.acsrv_aicolor)
							throw 'Internal error';

						node = pSocket.acsrv_ai._sy_copy(pSocket.acsrv_ai.getMainNode(), false);
						move = pSocket.acsrv_ai.movePiece(line, true, pSocket.acsrv_ai.getPlayer());
						if (move == pSocket.acsrv_ai.constants.noMove)
						{
							pSocket.acsrv_post('Invalid move', true);
							server.acsrv_board(pSocket);
						}
						else
						{
							// Trace the last move
							if (pSocket.acsrv_ai.hasPendingPromotion())
								move += 10000 * pSocket.acsrv_ai.promote(pSocket.acsrv_promote);
							pSocket.acsrv_lastMove = pSocket.acsrv_ai.moveToString(move, node);
							pSocket.acsrv_ai.updateHalfMoveClock();
							pSocket.acsrv_ai.logMove(move, null);

							// Next player
							pSocket.acsrv_ai.switchPlayer();
							server.acsrv_board(pSocket);
							if (!server.acsrv_end_game(pSocket))
							{
								server.acsrv_play_ai(pSocket);
								server.acsrv_board(pSocket);
								server.acsrv_end_game(pSocket);
							}
						}
					}
					break;
			}
			continue;
		}

		//-- Commands when not playing
		if (pSocket.acsrv_state == 'home')
		{
			//- Views the available games
			if (tab[0] == 'sought')
			{
				pSocket.acsrv_post(
					server.acsrv_fixedString(pSocket.acsrv_session, 3)+" "+pSocket.acsrv_ai.options.ai.elo+" AntiCrux(C)       180 180 unrated suicide                0-9999 m\r\n" +
					'1 ads displayed.', true);
				continue;
			}

			//- Rejects the proposal of a match
			if (tab[0] == 'decline')
			{
				if (pSocket.acsrv_options._pendingChallenge)
				{
					pSocket.acsrv_options._pendingChallenge = false;
					pSocket.acsrv_send_seeks();
				}
				else
					pSocket.acsrv_post('There is no pending challenge that you may decline.', true);
				continue;
			}

			//- Accepts the proposed game
			if (tab[0] == 'accept')
			{
				if (pSocket.acsrv_options._pendingChallenge)
					server.acsrv_start_game(pSocket);
				else
					pSocket.acsrv_post('There is no pending challenge that you may accept.', true);
				continue;
			}

			//- Plays a game
			if (tab[0] == 'play')
			{
				if (parseInt(tab[1]) != pSocket.acsrv_session)
					pSocket.acsrv_post('That seek is not available.', true);
				else
				{
					pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.none;
					server.acsrv_start_game(pSocket);
				}
				continue;
			}

			//- Ask for a game
			if (tab[0] == 'getgame')
			{
				tab = ['match', 'anticrux', 'suicide'];
				//No continue
			}

			//- Proposes a new match
			if (tab[0] == 'rematch')
			{
				// Checks if a match occurred already
				if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.none)
				{
					tab = ['match', 'anticrux', 'suicide'];
					//No continue
				}
				else
				// Starts a new match from the opposite side
				{
					pSocket.acsrv_post("AntiCrux accepts the match offer.\r\n", false);
					pSocket.acsrv_aicolor = (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white ? pSocket.acsrv_ai.constants.player.black : pSocket.acsrv_ai.constants.player.white);
					server.acsrv_start_game(pSocket);
					continue;
				}
			}

			//- Gets a match request
			if ((tab[0] == 'match') || (tab[0] == 'seek'))
			{
				// Checks that only the server is targetted
				if ((tab[0] == 'match') && (tab[1] != 'anticrux'))
				{
					pSocket.acsrv_post(tab[1] + ' declines the match offer.', true);
					continue;
				}

				// Verify the variant (suicide = antichess + unrated)
				b = false;
				for (i=1 ; i<tab.length ; i++)
				{
					if (tab[i] == 'rated')
					{
						b = false;
						break;
					}
					if (tab[i] == 'suicide')
						b = true;
				}
				if (!b)
				{
					pSocket.acsrv_post('AntiCrux declines the match offer.', true);
					continue;
				}

				// Predefines the color of the AI
				pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.none;
				for (i=2 ; i<tab.length ; i++)
				{
					if (tab[i] == 'black')
						pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.white;
					if (tab[i] == 'white')
						pSocket.acsrv_aicolor = pSocket.acsrv_ai.constants.player.black;
				}

				// Accepts the match
				pSocket.acsrv_post("AntiCrux accepts the match offer.\r\n", false);
				server.acsrv_start_game(pSocket);
				continue;
			}

			//- Nickname (unofficial)
			if (tab[0] == 'nickname')
			{
				if (tab[1].match(/^[a-zA-Z0-9]+$/) && !tab[1].match(/anticrux/i))
				{
					pSocket.acsrv_login = tab[1];
					pSocket.acsrv_post('Login changed to "'+pSocket.acsrv_login+'".', true);
				}
				else
					pSocket.acsrv_post('Invalid login name.', true);
				continue;
			}

			//- Adjourned games
			if (tab[0] == 'stored')
			{
				pSocket.acsrv_post(pSocket.acsrv_login + ' has no adjourned games.', true);
				continue;
			}

			//- History games
			if (tab[0] == 'history')
			{
				pSocket.acsrv_post(pSocket.acsrv_login + ' has no history games.', true);
				continue;
			}

			//- Journal
			if (tab[0] == 'journal')
			{
				pSocket.acsrv_post('Only registered players may keep a journal.', true);
				continue;
			}

			//- Unknown command
			if (tab[0].length > 0)
				pSocket.acsrv_post(tab[0] + ': Command not found.', false);
		}

		//-- Default output
		server.acsrv_console(pSocket, 'Unknown command: ' + line);
		pSocket.acsrv_post('', true);
	}
};

server.acsrv_games = function(pSocket) {
	var session, socket, ai, counter, buffer;

	//-- Identifies the valid connections
	counter = 0;
	buffer = '';
	for (session in server.acsrv_sockets)
	{
		socket = server.acsrv_sockets[session];
		if (socket.destroyed)
		{
			delete server.acsrv_sockets[session];
			continue;
		}

		//- Aliases
		if (socket.acsrv_state != 'playing')
			continue;
		ai = socket.acsrv_ai;

		//- Output
		buffer += server.acsrv_fixedString(session.toString(), 2) + ' ';
		if (socket.acsrv_aicolor == ai.constants.player.white)
			buffer += ai.options.ai.elo + ' AntiCrux    ++++ ' + server.acsrv_fixedString(socket.acsrv_login, 12);
		else
			buffer += '++++ ' + server.acsrv_fixedString(socket.acsrv_login, 12) + ' ' + ai.options.ai.elo + ' AntiCrux    ';
		buffer +=	' [pSu 180 180] 180:00 - 180:00 (' +
					server.acsrv_fixedString(ai._ai_countPiece(ai.constants.player.white).toString(), 2) +
					'-' +
					server.acsrv_fixedString(ai._ai_countPiece(ai.constants.player.black).toString(), 2) +
					') ' +
					(ai.getPlayer() == ai.constants.player.white ? 'W' : 'B') + ':' +
					server.acsrv_fixedString(Math.ceil(ai.getHistory().length/2).toString(), 2) +
					"\r\n";
		counter++;
	}
	buffer += counter + ' games displayed';
	pSocket.acsrv_post(buffer, true);
};

server.acsrv_handles = function(pSocket, pMask) {
	var session, socket, names, i, buffer;

	//-- Identifies the valid connections
	names = [];
	if ((pMask.length === 0) || ('anticrux'.indexOf(pMask) !== -1))
		names.push('AntiCrux');
	for (session in server.acsrv_sockets)
	{
		socket = server.acsrv_sockets[session];
		if (socket.destroyed)
		{
			delete server.acsrv_sockets[session];
			continue;
		}

		//- Gets the names
		if (pMask.length > 0)
			if (socket.acsrv_login.toLowerCase().indexOf(pMask) == -1)
				continue;
		if (names.indexOf(socket.acsrv_login) === -1)
			names.push(socket.acsrv_login);
	}

	//-- Sends the names
	names.sort();
	buffer = '';
	for (i=0 ; i<names.length ; i++)
	{
		buffer += server.acsrv_fixedString(names[i], 18);
		if (((i+1)%4 === 0) && (i!=names.length-1))
			buffer += "\r\n";
	}
	pSocket.acsrv_post("-- Matches: "+names.length+" player(s) --\r\n" + buffer, false);
};

server.acsrv_start_game = function(pSocket) {
	var b, buffer;

	//-- New game
	buffer = '';
	pSocket.acsrv_options._pendingChallenge = false;
	if (pSocket.acsrv_options.mode960)
	{
		pSocket.acsrv_ai.defaultBoard(pSocket.acsrv_ai.getNewFischerId());
		buffer += "You are playing AntiChess"+pSocket.acsrv_ai.fischer+".\r\n";
	}
	else
		pSocket.acsrv_ai.defaultBoard();
	pSocket.acsrv_promote = pSocket.acsrv_ai.constants.piece.queen;		//Reset at every new game
	pSocket.acsrv_lastMove = '';
	pSocket.acsrv_aikills = false;
	pSocket.acsrv_playerkills = false;

	//-- Chooses the side and White always starts
	if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.none)
	{
		b = (Math.round(Math.random() * 99) % 2 === 0);
		pSocket.acsrv_aicolor = (b ? pSocket.acsrv_ai.constants.player.white : pSocket.acsrv_ai.constants.player.black);
		pSocket.acsrv_ai.options.board.rotated = b;
	}
	else
		pSocket.acsrv_ai.options.board.rotated = (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white);

	//-- Creates the game
	pSocket.acsrv_remove_seeks();
	pSocket.acsrv_set_state('playing');
	if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
		buffer = "Creating: AntiCrux ("+pSocket.acsrv_ai.options.ai.elo+") "+pSocket.acsrv_login+" (++++) unrated suicide 180 180\r\n" +
				"{Game "+pSocket.acsrv_session+" (AntiCrux vs. "+pSocket.acsrv_login+") Creating unrated suicide match.}\r\n\r\n";
	else
		buffer = "Creating: "+pSocket.acsrv_login+" (++++) AntiCrux ("+pSocket.acsrv_ai.options.ai.elo+") unrated suicide 180 180\r\n" +
				"{Game "+pSocket.acsrv_session+" ("+pSocket.acsrv_login+" vs. AntiCrux) Creating unrated suicide match.}\r\n\r\n";
	pSocket.acsrv_post(buffer, true);

	//-- Plays the first round
	if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.getPlayer())
	{
		server.acsrv_board(pSocket);
		server.acsrv_play_ai(pSocket);
		server.acsrv_end_game(pSocket);		//Not expected
	}
	server.acsrv_board(pSocket);
};

server.acsrv_play_ai = function(pSocket) {
	var move, score;

	//-- Checks the current player
	if (pSocket.acsrv_aicolor != pSocket.acsrv_ai.getPlayer())
		return false;

	//-- Plays
	move = pSocket.acsrv_ai.getMoveAI();
	pSocket.acsrv_lastMove = pSocket.acsrv_ai.moveToString(move);
	pSocket.acsrv_ai.movePiece(move, true);
	pSocket.acsrv_ai.updateHalfMoveClock();
	pSocket.acsrv_ai.logMove(move, null);
	pSocket.acsrv_ai.switchPlayer();

	//-- Analyzes the score
	score = pSocket.acsrv_ai.getScore();
	if (score.value == pSocket.acsrv_ai.constants.player.mapping_rev[pSocket.acsrv_aicolor] * -pSocket.acsrv_ai.constants.bitmask.valuationValue)
	{
		if (!pSocket.acsrv_aikills)
			pSocket.acsrv_post('AntiCrux(C)('+pSocket.acsrv_ai.options.ai.elo+')['+pSocket.acsrv_session+'] kibitzes: I will get you !', false);
		pSocket.acsrv_aikills = true;
	}
	else
		pSocket.acsrv_aikills = false;
	if (pSocket.acsrv_options.noticePossibleVictory)
	{
		if (score.value == pSocket.acsrv_ai.constants.player.mapping_rev[pSocket.acsrv_aicolor] * pSocket.acsrv_ai.constants.bitmask.valuationValue)
		{
			if (!pSocket.acsrv_playerkills)
				pSocket.acsrv_post('AntiCrux(C)('+pSocket.acsrv_ai.options.ai.elo+')['+pSocket.acsrv_session+'] kibitzes: I am feeling bad...', false);
			pSocket.acsrv_playerkills = true;
		}
		else
			pSocket.acsrv_playerkills = false;
	}
	return true;
};

server.acsrv_board = function(pSocket) {
	var	node, rotated, buffer, hist,
		move, move_fromY, move_fromX, move_toY, move_toX,
		x, y, i;

	//-- Board
	node = pSocket.acsrv_ai.getMainNode();
	hist = pSocket.acsrv_ai.getHistory();
	move = (hist.length === 0 ? pSocket.acsrv_ai.constants.noMove : hist[hist.length-1]);
	rotated = pSocket.acsrv_ai.options.board.rotated;		//Shortened syntax
	buffer = '';

	//-- Header
	if (hist.length === 0)
	{
		if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
			pSocket.acsrv_post("Game "+pSocket.acsrv_session+" (AntiCrux vs. "+pSocket.acsrv_login+")\r\n", false);
		else
			pSocket.acsrv_post("Game "+pSocket.acsrv_session+" ("+pSocket.acsrv_login+" vs. AntiCrux)\r\n", false);
	}

	//-- Style 12 (http://www.freechess.org/Help/HelpFiles/style12.html)
	if (pSocket.acsrv_options.style == 12)
	{
		//- Style
		buffer += '<12> ';

		//- Position
		for (y=0 ; y<8 ; y++)
		{
			for (x=0 ; x<8 ; x++)
			{
				i = 8*y+x;
				switch (node.board[i] & pSocket.acsrv_ai.constants.bitmask.player)
				{
					case pSocket.acsrv_ai.constants.player.black:
						buffer += pSocket.acsrv_ai.constants.piece.mapping_rev[node.board[i] & pSocket.acsrv_ai.constants.bitmask.piece].toLowerCase();
						break;
					case pSocket.acsrv_ai.constants.player.white:
						buffer += pSocket.acsrv_ai.constants.piece.mapping_rev[node.board[i] & pSocket.acsrv_ai.constants.bitmask.piece].toUpperCase();
						break;
					default:
						buffer += '-';
						break;
				}
			}
			buffer += ' ';
		}

		//- Player
		if (pSocket.acsrv_ai.getPlayer() == pSocket.acsrv_ai.constants.player.white)
			buffer += 'W';
		else
			buffer += 'B';

		//- En passant
		if (typeof node.enpassant === 'undefined')
			buffer += ' -1';
		else
			buffer += ' ' + (node.enpassant%10);

		//- Castling (never)
		buffer += ' 0 0 0 0';

		//- History moves
		buffer += ' ' + Math.ceil(hist.length/2);

		//- Game number
		buffer += ' ' + pSocket.acsrv_session;

		//- Players
		if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white)
			buffer += ' AntiCrux ' + pSocket.acsrv_login;
		else
			buffer += ' ' + pSocket.acsrv_login + ' AntiCrux';

		//- Relation
		if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.getPlayer())
			buffer += ' -1';
		else
			buffer += ' 1';

		//- Initial time and increment
		buffer += ' 180 180';

		//- Strength
		buffer +=	' ' +
					pSocket.acsrv_ai._ai_countPiece(pSocket.acsrv_ai.constants.player.white, node) +
					' ' +
					pSocket.acsrv_ai._ai_countPiece(pSocket.acsrv_ai.constants.player.black, node);

		//- Remaining time
		buffer += ' 180 180';

		//- Number of the move about to be made
		if (hist.length === 0)
			buffer += ' 0';
		else
			buffer += ' ' + Math.floor((hist.length+1)/2);

		//- Last move
		if (move == pSocket.acsrv_ai.constants.noMove)
			buffer += ' none';
		else {
			move_fromY = Math.floor(move/1000) % 10;
			move_fromX = Math.floor(move/100 ) % 10;
			move_toY   = Math.floor(move/10  ) % 10;
			move_toX   =            move       % 10;
			buffer +=	' ' +
						pSocket.acsrv_ai.constants.piece.mapping_rev[node.board[8*move_toY+move_toX] & pSocket.acsrv_ai.constants.bitmask.piece] +
						'/' +
						'abcdefgh'[move_fromX] +
						(8-move_fromY) +
						'-' +
						'abcdefgh'[move_toX] +
						(8-move_toY)
					;
		}

		//- Time taken (unsupported)
		buffer += ' (0:00)';

		//- Pretty notation of the last move
		if (pSocket.acsrv_lastMove.length === 0)
			buffer += ' none';
		else
			buffer += ' ' + pSocket.acsrv_lastMove;

		//- Rotation
		if (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.black)
			buffer += ' 0';
		else
			buffer += ' 1';

		//- BEL + EOL
		buffer = String.fromCharCode(7) + "\r\n" + buffer + "\r\n";
	}
	else
	//-- Classic style
	if (pSocket.acsrv_options.style == 1)
	{
		for (y=(rotated?7:0) ; (!rotated&&(y<8)) || (rotated&&(y>=0)) ; (rotated?y--:y++))
		{
			for (x=(rotated?7:0) ; (!rotated&&(x<8)) || (rotated&&(x>=0)) ; (rotated?x--:x++))
			{
				i = 8*y+x;

				//- Left margin
				if (x === (rotated?7:0))
					buffer += '    ' + ('12345678'[7-y]) + '  |';

				//- Nature of the position
				switch (node.board[i] & pSocket.acsrv_ai.constants.bitmask.player)
				{
					case pSocket.acsrv_ai.constants.player.white:
						buffer += ' ' + pSocket.acsrv_ai.constants.piece.mapping_rev[node.board[i] & pSocket.acsrv_ai.constants.bitmask.piece].toUpperCase() + ' |';
						break;
					case pSocket.acsrv_ai.constants.player.black:
						buffer += ' *' + pSocket.acsrv_ai.constants.piece.mapping_rev[node.board[i] & pSocket.acsrv_ai.constants.bitmask.piece].toUpperCase() + '|';
						break;
					case pSocket.acsrv_ai.constants.player.none:
						buffer += '   |';
						break;
				}

			}

			//- Additional information
			if (y == (rotated?7:0))
				buffer +=	'     Move # : ' + Math.ceil((hist.length+1)/2).toString() +
							' (' + (pSocket.acsrv_ai.getPlayer() == pSocket.acsrv_ai.constants.player.white ? 'White' : 'Black') + ')';
			if ((y == (rotated?6:1)) && (pSocket.acsrv_lastMove.length > 0))
			{
				if (pSocket.acsrv_ai.getPlayer() == pSocket.acsrv_ai.constants.player.white)
					buffer += "     Black Moves : '"+server.acsrv_fixedString(pSocket.acsrv_lastMove, 8)+"(0:00)'";
				else
					buffer += "     White Moves : '"+server.acsrv_fixedString(pSocket.acsrv_lastMove, 8)+"(0:00)'";
			}
			if (y == (rotated?4:3))
				buffer += '     Black Clock : 3:00:00';
			if (y == (rotated?3:4))
				buffer += '     White Clock : 3:00:00';
			if (y == (rotated?2:5))
				buffer += '     Black Strength : ' + pSocket.acsrv_ai._ai_countPiece(pSocket.acsrv_ai.constants.player.black, node);
			if (y == (rotated?1:6))
				buffer += '     White Strength : ' + pSocket.acsrv_ai._ai_countPiece(pSocket.acsrv_ai.constants.player.white, node);

			//- Right border
			buffer += "\r\n";
			if (y != (rotated?0:7))
				buffer += "       |---+---+---+---+---+---+---+---|\r\n";
		}

		//- Top/Bottom border
		buffer =	"\r\n" +
					"       ---------------------------------\r\n" +
					buffer +
					"       ---------------------------------\r\n";
		if (rotated)
			buffer += "         h   g   f   e   d   c   b   a\r\n\r\n";
		else
			buffer += "         a   b   c   d   e   f   g   h\r\n\r\n";
	}
	else
	//-- Another output type
		buffer = 'Unsupported style for the output.';		//Read http://www.freechess.org/Help/HelpFiles/style.html

	//-- Result
	pSocket.acsrv_post(buffer, true);
};

server.acsrv_end_game = function(pSocket) {
	var winner, white, black, stalemate;

	//-- Prepares the output
	white = (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.white ? 'AntiCrux' : pSocket.acsrv_login);
	black = (pSocket.acsrv_aicolor == pSocket.acsrv_ai.constants.player.black ? 'AntiCrux' : pSocket.acsrv_login);

	//-- Checks for a draw
	if (pSocket.acsrv_ai.isDraw())		//The possible draws are processed through an explicit request from the human player
	{
		server.acsrv_stats.draw++;
		pSocket.acsrv_post("\r\n{Game "+pSocket.acsrv_session+" ("+white+" vs. "+black+") is a draw} 1/2-1/2\r\nNo ratings adjustment done.", true);
		pSocket.acsrv_set_state('home');
		pSocket.acsrv_send_seeks();
		return true;	
	}

	//-- Verifies the position
	else
		if (pSocket.acsrv_ai.isEndGame(false))
		{
			//- Elements of the situation
			winner = pSocket.acsrv_ai.getWinner();
			if (winner == pSocket.acsrv_aicolor)
				server.acsrv_stats.win++;
			else
				server.acsrv_stats.loss++;
			stalemate =	(pSocket.acsrv_ai._ai_inventory(pSocket.acsrv_ai.constants.player.white, null, null) !== 0) &&
						(pSocket.acsrv_ai._ai_inventory(pSocket.acsrv_ai.constants.player.black, null, null) !== 0);

			//- Output
			pSocket.acsrv_post(
					"\r\n{Game "+pSocket.acsrv_session+" ("+white+" vs. "+black+") "+(winner == pSocket.acsrv_aicolor ? 'AntiCrux' : pSocket.acsrv_login)+" wins by " +
					(stalemate ? "having less material (stalemate)" : "losing all material") +
					"} " +
					(winner == pSocket.acsrv_ai.constants.player.white ? "1-0" : "0-1") +
					"\r\nNo ratings adjustment done.",
					true
				);

			//- Status
			pSocket.acsrv_set_state('home');
			pSocket.acsrv_send_seeks();
			return true;
		}

		//-- No end of game
		else
			return false;
};

server.acsrv_shout = function(pSocket, pMessage) {
	var session, socket;

	//-- Checks
	if (pMessage.length === 0)
	{
		pSocket.acsrv_post('', true);
		return;
	}

	//-- Identifies the valid connections
	for (session in server.acsrv_sockets)
	{
		socket = server.acsrv_sockets[session];
		if (socket.destroyed)
		{
			delete server.acsrv_sockets[session];
			continue;
		}

		//- Shouts to anyone without restriction
		socket.acsrv_post(pSocket.acsrv_login+' shouts: '+pMessage, true);
	}
	server.acsrv_console(pSocket, "Shout: "+pMessage);
};

server.acsrv_console = function(pSocket, pMessage) {
	console.log(
		server.acsrv_fixedString((pSocket.hasOwnProperty('acsrv_session')?pSocket.acsrv_session:'*').toString(), 3) +
		' ' +
		server.acsrv_fixedString((pSocket.hasOwnProperty('acsrv_login')?pSocket.acsrv_login:'*'), 12) +
		' | ' +
		pMessage
	);
};

server.acsrv_quit = function(pSocket, pMessage) {
	pSocket.acsrv_post_raw(pMessage);
	pSocket.destroy();
	if (pSocket.hasOwnProperty('acsrv_login'))
		console.log('Disconnected player: ' + pSocket.acsrv_login);
};

server.acsrv_shutdown = function() {
	var session, socket;

	//-- Closes all the connections
	for (session in server.acsrv_sockets)
	{
		socket = server.acsrv_sockets[session];
		if (socket.destroyed)
			continue;
		socket.acsrv_post_raw(
			"Connection closed by the system administrator without any effect on the current ratings.\r\n" +
			"Sorry for the inconvenience. Back to the game will be possible very shortly. Thank you.");
		socket.destroy();
	}

	//-- Destroys the server
	this.close();
};


//======== Entry-point

server.listen(5000, 'localhost');		//Syntax for Linux
