/*
	AntiCrux - Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile and Node.js
	Copyright (C) 2016-2017, ecrucru

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
*/

"use strict";


//======== Documentation
// http://www.shredderchess.com/download.html


//======== Initialization
var	AntiCrux = require('anticrux'),
	fs = require('fs'),								//https://nodejs.org/api/fs.html
	acengine = {
		state : 'wait_gui',
		positionOK : false,
		instance : null,
		trace : {
			hasWritten	: false,
			debug		: false,					//Editable option
			logFile		: 'anticrux-engine.log'		//Editable option
		},
		send : function(pText) {
			acengine.writeLog('> ' + pText + "\r\n");
			fs.writeSync(1, pText + "\r\n");
		},
		writeLog : function(pLog) {
			var d;
			if (acengine.trace.debug)
			{
				if (!acengine.trace.hasWritten)
				{
					acengine.trace.hasWritten = true;
					d = acengine.instance.getDateElements();
					acengine.writeLog("\r\n" + '=== AntiCrux Engine UCI - Log started at '+d.year+'-'+d.month+'-'+d.day+' '+d.hours+':'+d.minutes+':'+d.seconds+'' + "\r\n");
				}
				fs.appendFileSync(acengine.trace.logFile, pLog);
			}
		}
	};


//======== Entry point

//-- Settings for the process
process.title = 'AntiCrux Engine UCI';
process.on('SIGINT', function() {
	process.exit(0);
});

//-- Settings for the engine
acengine.instance = new AntiCrux();
acengine.instance.options.board.noStatOnForcedMove = true;	//Faster
acengine.instance.options.board.assistance = true;			//Ponder
acengine.instance.callbackExploration = function(pMaxDepth, pDepth, pNodes) {
		acengine.send('info depth '+pMaxDepth+' seldepth '+pDepth+' nodes '+pNodes+' pv 0000');
	};

//-- Main loop
process.stdin.on('readable', function() {
	var	i, j, b,
		input, line, tab, obj, objKey,
		move, fen, score, movePonder;

	//-- Reads the input
	// https://nodejs.org/api/process.html#process_process_stdin
	obj = process.stdin.read();
	if (obj === null)
		return;
	input = obj.toString();

	//-- Simplifies the input
	input = input.split("\r").join('');
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

		//- Other commands
		switch (acengine.state)
		{
			// The engine is waiting for the instructions of the GUI
			case 'wait_gui':
				if (tab[0] == 'uci')
				{
					acengine.send('id name AntiCrux '+acengine.instance.options.ai.version);
					acengine.send('id author https://github.com/ecrucru/anticrux/');
					acengine.send('option name UCI_Chess960 type check default false');
					acengine.send('option name UCI_Variant type combo default suicide var suicide');
					acengine.send('option name Skill Level type spin default '+acengine.instance.getLevel()+' min 1 max 20');
					acengine.send('option name Debug type check default false');
					acengine.send('uciok');
					acengine.send('copyprotection ok');
					acengine.state = 'options';
					acengine.positionOK = false;
				}
				break;

			// The transmission of the options is pending
			case 'options':
				if (tab[0] == 'setoption')
				{
					// Parses the command
					obj = { name:'', value:'' };			//At least these fields
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
						obj[objKey] += (obj[objKey].length > 0 ? ' ' : '') + tab[j];
					}

					// Applies the option
					if (obj.name == 'Skill Level')
						acengine.instance.setLevel(parseInt(obj.value));
					if (obj.name == 'Debug')
						acengine.trace.debug = (obj.value.toLowerCase() == 'true');
				}

				if (tab[0] == 'isready')
				{
					acengine.state = 'playing';
					acengine.send('readyok');
				}
				break;

			// The game has started
			case 'playing':
				if (tab[0] == 'ucinewgame')
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
							if (acengine.instance.movePiece(tab[j]) == acengine.instance.constants.noMove)
							{
								acengine.send('info string Invalid move history');
								acengine.positionOK = false;
								break;
							}
							else
							{
								acengine.instance.updateHalfMoveClock();
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
					score = acengine.instance.getShortestMate();
					if (score === 0)
						score = 'cp ' + acengine.instance.getScore().value;
					else
						score = 'mate ' + score;
					acengine.send('info depth '+acengine.instance._reachedDepth+' score '+score+' nodes '+acengine.instance._numNodes+' pv '+acengine.instance.moveToUCI(move));

					// Transmits the moves
					if (movePonder.length === 0)
						acengine.send('bestmove '+acengine.instance.moveToUCI(move));
					else
						acengine.send('bestmove '+acengine.instance.moveToUCI(move)+' ponder '+movePonder);

					// Releases the memory
					acengine.instance.freeMemory();
				}
				break;
		}
	}
});
