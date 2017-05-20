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


//======== Libraries

var fs        = require('fs'),							// https://nodejs.org/api/fs.html
	STOCKFISH = require('./anticrux-sfmv.js'),			// Stockfish multi-variant
	AntiCrux  = require('anticrux');					// AntiCrux Engine


//======== Definitions

var enginePool = [
		{ ai:null, type:'AC', selfDuel:false, enPassant:true, level:0, levelMin:1, levelMax:15, owner:null, name:'' },	//Up to 20
		{ ai:null, type:'SF', selfDuel:true,  enPassant:true, level:0, levelMin:1, levelMax:8,  owner:null, name:'' },	//Up to 8
		{ ai:null, type:'SF', selfDuel:true,  enPassant:true, level:0, levelMin:1, levelMax:8,  owner:null, name:'' }	//Up to 8
	],

	sfmv_levels = [
		/* Source: https://lichess.org/blog/U4mtoEQAAEEAgZRL/strongest-chess-player-ever
		{ skill: 3, depth: 1, time: 50, elo:1350 },
		{ skill: 6, depth: 2, time:100, elo:1420 },
		{ skill: 9, depth: 3, time:150, elo:1500 },
		{ skill:11, depth: 4, time:200, elo:1600 },
		{ skill:14, depth: 6, time:250, elo:1700 },
		{ skill:17, depth: 8, time:300, elo:1900 },
		{ skill:20, depth:10, time:350, elo:2200 },
		{ skill:20, depth:12, time:400, elo:2500 } //*/

		//* Source: @veloce/lichobile/src/js/ui/ai/engine.ts
		{ skill: 1, depth: 1, time:1000, elo:1350 },
		{ skill: 3, depth: 1, time:2000, elo:1420 },
		{ skill: 6, depth: 2, time:3000, elo:1500 },
		{ skill: 9, depth: 3, time:4000, elo:1600 },
		{ skill:11, depth: 5, time:5000, elo:1700 },
		{ skill:14, depth: 8, time:6000, elo:1900 },
		{ skill:17, depth:13, time:7000, elo:2200 },
		{ skill:20, depth:21, time:8000, elo:2500 } //*/
	],

	job = {
		//- Internal
		handle			: null,
		referee			: null,
		engineOne		: null,
		engineTwo		: null,
		disqualified	: null,
		running			: false,
		//- Options
		debugLevel		: 1,							//0=none, 1=activity, 2=trace, 3=detailed trace
		file			: 'anticrux-elo.pgn',
		genGames    	: true,
		numGames		: 225,							//For 4 CPU
		genStats    	: true
	};


//======== Library

function acelo_welcome() {
	//-- Trace
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_welcome()');

	//-- Header
	console.log('');
	console.log('AntiCrux hELO world');
	console.log('http://github.com/ecrucru/anticrux/');
	console.log('License: GNU Affero General Public License version 3');
	console.log('');
	console.log('Press Ctrl+C to kill the execution.');
	console.log('Run the script again to use your other CPU (beware of the required memory).');
	console.log('');
	console.log('Running... It may take several hours, so take a drink...');
	console.log('');
}

function acelo_newjob() {
	var	n1, n2,
		lf_random = function(pMin, pMax) {
						return (Math.floor(32768*Math.random()) % (pMax - pMin + 1)) + pMin;
					};

	//-- Trace
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_newjob()');

	//-- Next match
	job.numGames--;
	job.running = true;
	job.disqualified = null;

	//-- Picks the engines
	while (true)
	{
		n1 = lf_random(0, enginePool.length-1);
		n2 = lf_random(0, enginePool.length-1);
		if (n1 == n2)
			continue;
		job.engineOne = enginePool[n1];
		job.engineTwo = enginePool[n2];
		if ((!job.engineOne.selfDuel || !job.engineTwo.selfDuel) && (job.engineOne.type == job.engineTwo.type))
			continue;
		else
			break;
	}

	//-- Sets the color of each player
	job.engineOne.owner = job.referee.constants.owner.white;
	job.engineTwo.owner = job.referee.constants.owner.black;

	//-- Sets the level of each player
	while (true)
	{
		job.engineOne.level = lf_random(job.engineOne.levelMin, job.engineOne.levelMax);
		if (job.engineOne.type == 'AC')
		{
			job.engineOne.ai.setLevel(job.engineOne.level);
			job.engineOne.ai.options.ai.noStatOnForcedMove = true;
		}
		job.engineTwo.level = lf_random(job.engineTwo.levelMin, job.engineTwo.levelMax);
		if (job.engineTwo.type == 'AC')
		{
			job.engineTwo.ai.setLevel(job.engineTwo.level);
			job.engineTwo.ai.options.ai.noStatOnForcedMove = true;
		}

		//- Avoids an auto-match
		if ((job.engineOne.type == job.engineTwo.type) && (job.engineOne.level == job.engineTwo.level))
			continue;
		else
			break;
	}

	//-- Sets the names of each player
	job.engineOne.name = (job.engineOne.type=='AC'?'AntiCrux':'Stockfish') + ' Level ' + job.engineOne.level;
	job.engineTwo.name = (job.engineTwo.type=='AC'?'AntiCrux':'Stockfish') + ' Level ' + job.engineTwo.level;

	//-- Initialization of AntiCrux
	job.referee.defaultBoard();
	job.referee.options.board.rotated = (job.referee.owner == job.referee.constants.owner.white);	//To set the right names during the export to PGN
	job.referee.options.variant.enPassant = (job.engineOne.enPassant && job.engineTwo.enPassant);	//Else it may infringe the rules

	//-- Initialization of Stockfish Multi-Variant
	if (job.debugLevel >= 1)
		console.log('** New game : '+job.engineOne.name+' vs. '+job.engineTwo.name);
	if (job.engineOne.type == 'SF')
	{
		job.engineOne.ai.postMessage('uci');
		job.engineOne.ai.postMessage('setoption name UCI_Variant value suicide');
		job.engineOne.ai.postMessage('setoption name Skill Level value '+job.engineOne.level);
		job.engineOne.ai.postMessage('isready');
		job.engineOne.ai.postMessage('ucinewgame');
	}
	if (job.engineTwo.type == 'SF')
	{
		job.engineTwo.ai.postMessage('uci');
		job.engineTwo.ai.postMessage('setoption name UCI_Variant value suicide');
		job.engineTwo.ai.postMessage('setoption name Skill Level value '+job.engineTwo.level);
		job.engineTwo.ai.postMessage('isready');
		job.engineTwo.ai.postMessage('ucinewgame');
	}

	//-- Match
	acelo_play();
}

function acelo_play() {
	var player, move, moveStr;

	//-- Trace
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_play()');

	//-- Finds the player
	player = (job.referee.getPlayer() == job.referee.constants.owner.white ? job.engineOne : job.engineTwo);

	//-- Plays a move
	if (player.type == 'AC')
	{
		player.ai.loadFen(job.referee.toFen());
		move = player.ai.getMoveAI();
		if (job.debugLevel >= 1)
			moveStr = player.ai.moveToString(move);
		if (job.referee.movePiece(move, true) == job.referee.constants.move.none)
		{
			console.log('Internal error : Invalid move by "'+player.name+'", disqualified');
			console.log('   - FEN : ' + job.referee.toFen());
			console.log('   - Move : ' + move);
			if (player.type == 'AC')
				console.log('   - Please report the issue on GitHub');
			job.disqualified = player;
		}
		else
		{
			job.referee.updateHalfMoveClock();
			job.referee.logMove(move);
			if (job.debugLevel >= 1)
				console.log('- '+player.name+' : ' + moveStr);
			player.ai.freeMemory();
			acelo_nextTurn();
		}
	}
	else
	{
		player.ai.postMessage('position fen ' + job.referee.toFen());
		player.ai.postMessage('go depth '+sfmv_levels[player.level-1].depth+' movetime '+sfmv_levels[player.level-1].time);
	}
}

function acelo_parseSfmv(pText) {
	var player, node, move, list;

	//-- Trace
	if (pText.length === 0)
		return;
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_parseSfmv("'+pText+'")');

	//-- Finds the player
	player = (job.referee.getPlayer() == job.referee.constants.owner.white ? job.engineOne : job.engineTwo);

	//-- Splits the input
	list = pText.split(' ');
	list[0] = (list[0] !== undefined ? list[0] : '');
	list[1] = (list[1] !== undefined ? list[1] : '');

	//-- Gets the best move
	if (list[0] == 'bestmove')
	{
		if (job.debugLevel >= 1)
			node = job.referee._ai_nodeCopy(job.referee.getMainNode(), false);
		move = job.referee.movePiece(list[1], true);
		if (move == job.referee.constants.move.none)
		{
			console.log('External error : Invalid move by "'+player.name+'", disqualified');
			console.log('   - FEN : ' + job.referee.toFen());
			console.log('   - Move : ' + list[1]);
			job.disqualified = player;
		}
		else
		{
			job.referee.updateHalfMoveClock();
			job.referee.logMove(move);
			if (job.debugLevel >= 1)
				console.log('- '+player.name+' : ' + (job.debugLevel >= 1 ? job.referee.moveToString(move, node) : move));
		}
		acelo_nextTurn();
	}
}

function acelo_nextTurn() {
	var pgn, pgnHeader, result='';

	//-- Trace
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_nextTurn()');

	//-- Prepares the next turn
	job.referee.switchPlayer();

	//-- Updates the statistics
	if (job.disqualified !== null)
	{
		if (job.debugLevel >= 3)
			console.log('> Trace : end of game, '+job.disqualified.name+' is disqualified');
		result = (job.disqualified.owner==job.referee.constants.owner.black ? '1-0' : '0-1');
	}
	else
		if (job.referee.isEndGame(false))
		{
			if (job.debugLevel >= 3)
				console.log('> Trace : end of game, winner=' + (job.referee.getWinner() == job.referee.constants.owner.white ? job.engineOne.name : job.engineTwo.name));
			result = (job.referee.getWinner() == job.referee.constants.owner.white ? '1-0' : '0-1');
		}
		else
			if (job.referee.isDraw() || (job.referee.getHistory().length >= 150))
			{
				if (job.debugLevel >= 3)
					console.log('> Trace : end of game, draw');
				result = '1/2-1/2';
			}
			else
			{
				if (job.debugLevel >= 3)
					console.log('> Trace : current position "'+job.referee.toFen()+'"');
				acelo_play();
				return;
			}
	console.log(job.engineOne.name+' vs. '+job.engineTwo.name+' ('+result+')');

	//-- Builds the PGN
	if (job.debugLevel >= 3)
		console.log('> Trace : saving the PGN file');
	pgnHeader = {
		White		: job.engineOne.name,
		Black		: job.engineTwo.name,
		Result		: result,
		Termination	: 'normal'
	};
	if (job.engineOne.type == 'SF')
		pgnHeader.WhiteElo = sfmv_levels[job.engineOne.level-1].elo;
	if (job.engineTwo.type == 'SF')
		pgnHeader.BlackElo = sfmv_levels[job.engineTwo.level-1].elo;
	if (job.disqualified !== null)
		pgnHeader.Termination = 'rules infraction';
	pgn = job.referee.toPgn(pgnHeader);

	//-- Saves the PGN file
	fs.appendFile(job.file, pgn+"\n\n", function(pError) {
		if (pError !== null)
			console.log('Error : ' + pError);
	});

	//-- Job ended
	if (job.debugLevel >= 3)
		console.log('> Trace : ended job');
	job.running = false;
} 

function acelo_elo() {
	// http://www.fide.com/component/handbook/?id=172&view=article

	var	pgn, i, game, regex,
		level, levelStat, opponent,
		t, p, dp, rc, ra;

	//-- Trace
	if (job.debugLevel >= 2)
		console.log('> Trace : calling acelo_elo()');

	//-- Loads the PGN file
	if (!fs.existsSync(job.file))
	{
		console.log('Error : no PGN file to analyze');
		return false;
	}
	pgn = fs.readFileSync(job.file, 'utf8');
	pgn = pgn.split("\r").join('').split("\n");

	//-- Reads the games
	levelStat = [];
	game = null;
	for (i=0 ; i<pgn.length ; i++)
	{
		if (game === null)
			game = {
				level		: 0,
				white		: '',
				whiteElo	: 0,
				black		: '',
				blackElo	: 0,
				result		: '',
				variant		: false
			};
		pgn[i] = pgn[i].trim().toLowerCase();

		//- White player
		regex = pgn[i].match(/^\[white\s.*anticrux.*level\s([0-9]+)/);
		if (regex !== null)
		{
			game.white = 'AC';
			game.level = parseInt(regex[1]);
			continue;
		}
		if (pgn[i].match(/^\[white\s.*stockfish/))
		{
			game.white = 'SF';
			continue;
		}

		//- Black player
		regex = pgn[i].match(/^\[black\s.*anticrux.*level\s([0-9]+)/);
		if (regex !== null)
		{
			game.black = 'AC';
			game.level = parseInt(regex[1]);
			continue;
		}
		if (pgn[i].match(/^\[black\s.*stockfish/))
		{
			game.black = 'SF';
			continue;
		}

		//- White Elo
		regex = pgn[i].match(/^\[whiteelo "([0-9]+)"/);
		if (regex !== null)
		{
			game.whiteElo = parseInt(regex[1]);
			continue;
		}

		//- Black Elo
		regex = pgn[i].match(/^\[blackelo "([0-9]+)"/);
		if (regex !== null)
		{
			game.blackElo = parseInt(regex[1]);
			continue;
		}

		//- Result
		regex = pgn[i].match(/^\[result "(.*)"\]$/);
		if (regex !== null)
		{
			if (['1-0', '1/2-1/2', '0-1'].indexOf(regex[1]) !== -1)
				game.result = regex[1];
			continue;
		}

		//- Variant
		if ((pgn[i] == '[variant "antichess"]') || (pgn[i] == '[variant "suicide"]'))
		{
			game.variant = true;
			continue;
		}

		//- Proceeds with the reading of the games
		if (pgn[i].length === 0)
		{
			if (	game.variant &&
					((game.white == 'AC') || (game.black == 'AC')) &&
					(game.level > 0) &&
					!((game.white == 'AC') && (game.black == 'AC'))
			) {
				// Initializes the statistics
				if (levelStat[game.level] === undefined)
				{
					levelStat[game.level] = {
						win			: 0,
						draw		: 0,
						loss		: 0,
						opponents	: {}
					};
				}

				// Resets the unexpected values
				if (game.white == 'AC')
					game.whiteElo = 0;
				if (game.black == 'AC')
					game.blackElo = 0;

				// Updates the statistics
				if (((game.white != 'AC') && (game.whiteElo > 0)) ||
					((game.black != 'AC') && (game.blackElo > 0))
				) {
					if ((game.white != 'AC') && (game.whiteElo > 0))
						levelStat[game.level].opponents[game.whiteElo] = (levelStat[game.level].opponents[game.whiteElo] === undefined ? 1 : levelStat[game.level].opponents[game.whiteElo]+1);
					else
						levelStat[game.level].opponents[game.blackElo] = (levelStat[game.level].opponents[game.blackElo] === undefined ? 1 : levelStat[game.level].opponents[game.blackElo]+1);
					if (game.result == '1/2-1/2')
						levelStat[game.level].draw++;
					else
						if (((game.white == 'AC') && (game.result == '1-0')) ||
							((game.black == 'AC') && (game.result == '0-1'))
						)
							levelStat[game.level].win++;
						else
							levelStat[game.level].loss++;
				}
			}
			game = null;
		}
	}

	//-- Analyzes the ELO ranking for every level
	console.log('');
	console.log('>> Based on the declared rankings of Stockfish 8 with multi-variants support on lichess.org :');
	for (level in levelStat)
	{
		//- Checks
		levelStat[level].games = levelStat[level].win + levelStat[level].draw + levelStat[level].loss;
		if ((levelStat[level].opponents.length < 3) || (levelStat[level].games < 9))
			continue;
		levelStat[level].points = levelStat[level].win + levelStat[level].draw/2;

		//- Calculates the ranking
		if (levelStat[level].points === 0)
			ra = 'as indeterminate';
		else
		{
			p = Math.round(100 * levelStat[level].points / levelStat[level].games);
			dp = [	-800, -677, -589, -538, -501, -470, -444, -422, -401, -383,
					-366, -351, -336, -322, -309, -296, -284, -273, -262, -251,
					-240, -230, -220, -211, -202, -193, -184, -175, -166, -158,
					-149, -141, -133, -125, -117, -110, -102, -95, -87, -80,
					-72, -65, -57, -50, -43, -36, -29, -21, -14, -7, 0, 7, 14,
					21, 29, 36, 43, 50, 57, 65, 72, 80, 87, 95, 102, 110, 117,
					125, 133, 141, 149, 158, 166, 175, 184, 193, 202, 211, 220,
					230, 240, 251, 262, 273, 284, 296, 309, 322, 336, 351, 366,
					383, 401, 422, 444, 470, 501, 538, 589, 677, 800			][p];
			rc = 0;
			t = Object.keys(levelStat[level].opponents).length;
			for (opponent in levelStat[level].opponents)
				rc += opponent * levelStat[level].opponents[opponent];
			rc = Math.round(rc/levelStat[level].games);
			if (p == 50)
				ra = rc;
			else
				if (p < 50)
					ra = rc + dp * t / (t + 1);
				else
					ra = rc + 20 * (levelStat[level].points - levelStat[level].games/2)/0.5;
			ra = Math.round(ra);
		}

		//- Result
		console.log('   - AntiCrux Level '+level+' is ranked '+ra+' after '+levelStat[level].games+' games (+'+levelStat[level].win+'/='+levelStat[level].draw+'/-'+levelStat[level].loss+').');
	}
	return true;
}


//======== Entry-point

//-- Checks the configuration
acelo_welcome();
if (job.file.length === 0)
{
	console.log('Error : missing name for the PGN file');
	return;
}
job.running = false;

//-- Main loop
if (job.genGames)
{
	//- Instantiates the engines
	job.referee = new AntiCrux();
	for (var i=0 ; i<enginePool.length ; i++)
	{
		if (enginePool[i].type == 'AC')
			enginePool[i].ai = new AntiCrux();
		if (enginePool[i].type == 'SF')
		{
			enginePool[i].ai = new STOCKFISH();
			enginePool[i].ai.print = acelo_parseSfmv;
		}
	}

	//- Starts the massive job
	job.handle = setInterval(
		function() {
			if (!job.running)
			{
				if (job.numGames > 0)
					acelo_newjob();
				else
				{
					clearInterval(job.handle);
					if (job.genStats)
						acelo_elo();
				}
			}
		}, 1000
	);
}
else if (job.genStats)
	acelo_elo();
