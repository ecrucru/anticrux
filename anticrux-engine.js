/*
	AntiCrux - Suicide chess engine acting as desktop engine, web page, mobile application, Internet chess server and library
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


//======== Documentation
// http://www.shredderchess.com/download.html


//======== Initialization
var acengine = {
		//=== Private members
		connected  : false,
		positionOK : false,
		instance   : null,
		mode       : null,
		trace      : {										//Only for NodeJS
			hasWritten	: false,
			debug		: false,							//Editable option
			logFile		: 'anticrux-engine.log'				//Editable option
		},

		//=== Methods
		detectMode : function() {
			//-- jsUCI
			if ((typeof importScripts !== 'undefined') && (typeof postMessage !== 'undefined'))
				return 'jsUCI';

			//-- Web-browser
			if (typeof document !== 'undefined')
				return 'browser';

			//-- NodeJS
			if (typeof module !== 'undefined' && module.exports)
				return 'node';

			//-- Other unsupported environments
			return null;
		},

		process : function(pInput) {
			var	i, j, b, s,
				input, line, tab, obj, objKey,
				move, fen, refvaltable, score, stats, movePonder;

			//-- Simplifies the input
			input = pInput.split("\r").join('');
			input = input.split("\t").join(' ');
			i = input.length;
			while (true)
			{
				input = input.split('  ').join(' ');
				if (input.length != i)
					i = input.length;
				else
					break;
			}

			//-- Splits the input line by line
			input = input.split("\n");
			for (i=0 ; i<input.length ; i++)
			{
				line = input[i];
				if (line.length === 0)
					continue;

				//- Splits the command
				tab = line.split(' ');
				for (j=0 ; (j<10) || (j<tab.length) ; j++)
					if (tab[j] === undefined)
						tab[j] = '';

				//- Debug
				acengine.writeLog("\r\n< " + line + "\r\n");

				//- Quits
				if (tab[0] == 'quit')
					process.exit(0);

				//- Debugger
				if (tab[0] == 'debug')
				{
					acengine.trace.debug = (tab[1].toLowerCase() == 'on');		//No use of "info string"
					continue;
				}

				//- Main commands
				if (!acengine.connected)
				{
					if (tab[0] == 'uci')
					{
						acengine.send('id name AntiCrux '+acengine.instance.options.ai.version);
						acengine.send('id author https://github.com/ecrucru/anticrux/');
						acengine.send('option name Debug type check default '+(acengine.trace.debug?'true':'false'));
						acengine.send('option name Precise Score type check default '+(acengine.instance.options.board.noStatOnForcedMove?'false':'true'));
						acengine.send('option name Same Value type check default '+(acengine.instance.options.variant.sameValue?'true':'false'));
						acengine.send('option name Skill Level type spin default '+acengine.instance.getLevel()+' min 1 max 20');
						obj = acengine.instance.getVariants();
						s = obj[0];
						obj.forEach(function(pElement, pIndex, pArray) { pArray[pIndex] = 'var '+pElement; });
						acengine.send('option name UCI_Variant type combo default '+s+' '+obj.join(' '));
						acengine.send('uciok');
						acengine.send('copyprotection ok');
						acengine.connected = true;
						acengine.positionOK = false;
					}
				}
				else
				{
					if (tab[0] == 'setoption')
					{
						// Parses the command
						obj = { name:'', value:'' };	//At least these fields
						objKey = '';
						for (j=0 ; j<tab.length ; j++)
						{
							// Key
							if (['name', 'value', 'type', 'default', 'min', 'max', 'var'].indexOf(tab[j].toLowerCase()) !== -1)
							{
								objKey = tab[j].toLowerCase();
								obj[objKey] = '';
								continue;
							}
							if (objKey.length === 0)
								continue;

							// Value
							if (tab[j].length > 0)
								obj[objKey] += (obj[objKey].length > 0 ? ' ' : '') + tab[j];
						}

						// Applies the option
						if (obj.name == 'UCI_Variant')
						{
							if (!acengine.instance.setVariant(obj.value))
								acengine.send('info string Unsupported variant name "'+obj.value+'"');
						}
						else if (obj.name == 'Skill Level')
							acengine.instance.setLevel(parseInt(obj.value));
						else if (obj.name == 'Debug')
						{
							acengine.trace.debug = (obj.value.toLowerCase() == 'true');
							acengine.instance.options.board.debug = acengine.trace.debug;
						}
						else if (obj.name == 'Precise Score')
							acengine.instance.options.board.noStatOnForcedMove = (obj.value.toLowerCase() != 'true');
						else if (obj.name == 'Same Value')
							acengine.instance.options.variant.sameValue = (obj.value.toLowerCase() == 'true');
					}

					else if (tab[0] == 'ucinewgame')
					{
						acengine.instance.defaultBoard();
						acengine.positionOK = true;
					}

					else if (tab[0] == 'isready')
					{
						if (!acengine.positionOK)
							acengine.send('info string AntiCrux is waiting for a position to analyze');
						acengine.send('readyok');
					}

					else if (tab[0] == 'position')
					{
						// Loads the initial position
						if (tab[1] == 'fen')
						{
							acengine.positionOK = true;
							fen = '';
							for (j=2 ; j<tab.length ; j++)
							{
								if (tab[j] == 'moves')
									break;
								fen += (fen.length > 0 ? ' ' : '') + tab[j];
							}
							if (!acengine.instance.loadFen(fen))
							{
								acengine.positionOK = false;
								acengine.send('info string Invalid FEN ' + fen);
								continue;
							}
						}
						else if (tab[1] == 'startpos')
						{
							acengine.instance.defaultBoard();
							acengine.positionOK = true;
						}
						else
							continue;

						// Proceeds with the additional moves
						b = false;
						for (j=2 ; j<tab.length ; j++)
						{
							if (tab[j].length === 0)
								continue;
							if (tab[j] == 'moves')
							{
								b = true;
								continue;
							}
							if (b)
							{
								move = acengine.instance.movePiece(tab[j], true);
								if (move == acengine.instance.constants.noMove)
								{
									acengine.send('info string Invalid move history');
									acengine.positionOK = false;
									break;
								}
								else
								{
									acengine.instance.updateHalfMoveClock();
									acengine.instance.logMove(move, null);
									acengine.instance.switchPlayer();
								}
							}
						}
					}

					else if (tab[0] == 'go')
					{
						// Verifies the loaded position
						if (!acengine.positionOK)
						{
							acengine.send('info string No position to analyze');
							acengine.send('bestmove 0000');
							continue;
						}

						// Mapping of the level
						if (tab[1] == 'depth')
							acengine.send("info string 'go depth N' is ignored");

						// Gets the right move to play and extra information
						move = acengine.instance.getMoveAI();
						movePonder = acengine.instance.getAssistance(false, true);

						// Transmits the score
						refvaltable = acengine.instance.getValuationTable();
						score = acengine.instance.getScore();
						if (score.mate)
							score = 'mate ' + score.mateMoves;
						else
							score = 'cp ' + Math.round(100 * score.value / refvaltable[acengine.instance.constants.piece.pawn]);
						stats = acengine.instance.getStatsAI();
						acengine.send('info depth '+stats.depth+' score '+score+' time '+stats.time+' nodes '+stats.nodes+' nps '+stats.nps+' pv '+acengine.instance.moveToUCI(move));

						// Transmits the moves
						if (movePonder.length === 0)
							acengine.send('bestmove '+acengine.instance.moveToUCI(move));
						else
							acengine.send('bestmove '+acengine.instance.moveToUCI(move)+' ponder '+movePonder);

						// Releases the memory
						acengine.instance.freeMemory();
					}
				}
			}
		},

		send : function(pText) {
			acengine.writeLog('> ' + pText + "\r\n");
			switch (acengine.mode)
			{
				case 'jsUCI':
					postMessage(pText);
					break;
				case 'node':
					fs.writeSync(1, pText + "\r\n");
					break;
				case 'browser':
					document.write(pText + '<br/>');
					break;
			}
		},

		writeLog : function(pLog) {
			var d;

			//-- Checks
			if (!acengine.trace.debug || (acengine.mode != 'node'))
				return;

			//-- Header
			if (!acengine.trace.hasWritten)
			{
				acengine.trace.hasWritten = true;
				d = acengine.instance.getDateElements();
				acengine.writeLog("\r\n" + '=== AntiCrux Engine UCI - Log started at '+d.year+'-'+d.month+'-'+d.day+' '+d.hours+':'+d.minutes+':'+d.seconds+'' + "\r\n");
			}

			//-- Output
			fs.appendFileSync(acengine.trace.logFile, pLog);
		}
	};


//======== Entry point

//-- Loader
acengine.mode = acengine.detectMode();
switch (acengine.mode)
{
	case 'jsUCI':
		importScripts('anticrux.js');
		break;

	case 'node':
		var AntiCrux = require('anticrux');
		var fs = require('fs');								// https://nodejs.org/api/fs.html
		break;

	case null:
		acengine = null;
		throw 'AntiCrux Engine cannot be loaded';
}

//-- Settings for the engine
acengine.instance = new AntiCrux();
acengine.instance.options.board.noStatOnForcedMove = true;	// Faster
acengine.instance.options.board.assistance = true;			// Ponder
acengine.instance.callbackExploration = function(pStats) {
		acengine.send('info depth '+pStats.depth+' score cp 0 time '+pStats.time+' nodes '+pStats.nodes+' nps '+pStats.nps+' pv 0000');
	};

//-- Main loop
switch (acengine.mode)
{
	case 'jsUCI':
		var onmessage = function(pObject) {
			acengine.process(pObject.data);
		};
		break;

	case 'node':
		process.title = 'AntiCrux Engine UCI';
		process.on('SIGINT', function() {
			process.exit(0);
		});
		process.stdin.on('readable', function() {
			// https://nodejs.org/api/process.html#process_process_stdin
			var obj = process.stdin.read();
			if (obj === null)
				return;
			acengine.process(obj.toString());
		});
		break;
}
