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
	readline = require('readline'),			// https://nodejs.org/api/readline.html
	fs = require('fs'),						// https://nodejs.org/api/fs.html
	pipe,
	aceng_state,
	aceng_engine,
	aceng_options;


//======== Events
process.on('SIGINT', function() {
	process.exit(0);
});

var aceng_output = function(pText) {
	pipe.write(pText + "\r\n");
	if (aceng_options.debug)
		fs.appendFile(aceng_options.logFile, '> ' + pText + "\r\n", function(err){});
};


//======== Entry point

//-- General settings
process.title = 'AntiCrux Engine UCI';
aceng_state = 'wait_gui';
aceng_options = {
	debug : false,
	defaultLevel : 5,
	logFile : 'anticrux-engine.log'
};

//-- Main engine
aceng_engine = new AntiCrux();
if (aceng_engine.setLevel(aceng_options.defaultLevel))
{
	aceng_engine.options.board.noStatOnForcedMove = true;	//Faster
	aceng_engine.options.board.assistance = true;			//Ponder
}
aceng_engine.callbackExploration = function(pMaxDepth, pDepth, pNodes) {
		aceng_output('info depth '+pMaxDepth+' seldepth '+pDepth+' nodes '+pNodes+' pv 0000');
	};

//-- Main loop
pipe = readline.createInterface({
		input : process.stdin,
		output : process.stdout,
		terminal : true
	})
.on('line', function(pLine) {
	var i, j, b, tab, obj, move, fen, movePonder;

	//-- Simplifies the input string
	i = pLine.length;
	while (true)
	{
		pLine = pLine.split("\r").join('');
		pLine = pLine.split("\t").join(' ');
		pLine = pLine.split('  ').join(' ');
		if (pLine.length != i)
			i = pLine.length;
		else
			break;
	}
	if (pLine.length === 0)
		return;

	//-- Splits the command
	tab = pLine.split(' ');
	for (j=0 ; (j<10) || (j<tab.length) ; j++)
		if (tab[j] === undefined)
			tab[j] = '';

	//-- Filters the inbound commands
	if (['uci', 'setoption', 'isready', 'ucinewgame', 'position', 'go', 'debug', 'quit'].indexOf(tab[0]) === -1)
		return;

	//-- Debug
	if (aceng_options.debug)
		fs.appendFile(aceng_options.logFile, '< ' + pLine + "\r\n", function(err){});

	//-- Quits
	if (tab[0] == 'quit')
		process.exit(0);

	//-- Debugger
	if (tab[0] == 'debug')
	{
		aceng_options.debug = (tab[1].toLowerCase() == 'on');		//No use of "info string"
		return;
	}

	//-- Other commands
	switch (aceng_state)
	{
		//- The engine is waiting for the instructions of the GUI
		case 'wait_gui':
			if (tab[0] == 'uci')
			{
				aceng_output('id name AntiCrux '+aceng_engine.options.ai.version);
				aceng_output('id author https://github.com/ecrucru/anticrux/');
				aceng_output('option name UCI_Chess960 type check default false');
				aceng_output('option name UCI_Variant type combo default suicide var suicide');
				aceng_output('option name level type spin default '+aceng_options.defaultLevel+' min 1 max 20');
				aceng_output('option name debug type check default false');
				aceng_output('uciok');
				aceng_output('copyprotection ok');
				aceng_state = 'options';
			}
			break;

		//- The transmission of the options is pending
		case 'options':
			if (tab[0] == 'setoption')
			{
				// Parses the command
				obj = { name:'', value:null };
				for (j=0 ; j<Math.floor((tab.length-1)/2) ; j++)
				{
					if (tab[1+2*j] == 'name')
						obj.name = tab[2*(j+1)];
					if (tab[1+2*j] == 'value')
						obj.value = tab[2*(j+1)];
				}
				obj.value = (obj.value === null ? '' : obj.value);

				// Applies the option
				if (obj.name == 'level')
					aceng_engine.setLevel(parseInt(obj.value));
				if (obj.name == 'debug')
					aceng_options.debug = (obj.value.toLowerCase() == 'true');
			}

			if (tab[0] == 'isready')
			{
				aceng_state = 'playing';
				aceng_output('readyok');
			}
			break;

		//- The game has started
		case 'playing':
			if (tab[0] == 'ucinewgame')
				aceng_engine.defaultBoard();

			else if (tab[0] == 'position')
			{
				if (tab[1] == 'fen')
				{
					fen = '';
					for (j=2 ; j<tab.length ; j++)
					{
						if (tab[j] == 'moves')
							break;
						fen += (fen.length > 0 ? ' ' : '') + tab[j];
					}
					if (!aceng_engine.loadFen(fen))
						if (aceng_options.debug)
							aceng_output('info string Invalid FEN ' + fen);
				}
				else if (tab[1] == 'startpos')
					aceng_engine.defaultBoard();
				else
					return;

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
						if (aceng_engine.movePiece(tab[j]) == aceng_engine.constants.noMove)
							throw 'Internal error - Rejected move history';
						else
						{
							aceng_engine.updateHalfMoveClock();
							aceng_engine.switchPlayer();
						}
					}
				}
			}

			else if (tab[0] == 'go')
			{
				// Mapping of the level
				if (tab[1] == 'depth')
					if (aceng_engine.setLevel(parseInt(tab[2])))
						aceng_output("info string 'go depth N' defines the level N but it doesn\'t restrict the explored depth");

				// Gets the right move to play and extra information
				move = aceng_engine.getMoveAI();
				movePonder = aceng_engine.getAssistance(false, true);

				// Transmits the score
				aceng_output('info score cp '+aceng_engine.getScore().value+' depth '+aceng_engine._reachedDepth+' nodes '+aceng_engine._numNodes+' pv '+aceng_engine.moveToUCI(move));

				// Transmits the moves
				if (movePonder.length === 0)
					aceng_output('bestmove '+aceng_engine.moveToUCI(move));
				else
					aceng_output('bestmove '+aceng_engine.moveToUCI(move)+' ponder '+movePonder);

				// Releases the memory
				aceng_engine.freeMemory();
			}
			break;
	}
});
