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

	@license
*/

"use strict";


//======== Libraries

var fs        = require('fs'),							// https://nodejs.org/api/fs.html
	STOCKFISH = require('./anticrux-sfmv.js'),			// Stockfish multi-variant
	AntiCrux  = require('anticrux');					// AntiCrux Engine


//======== Definitions

var enginePool = [
		{	ai			: null,
			type		: 'AC',
			selfDuel	: true,
			enPassant	: true,
			level		: 0,
			levelOff	: [	false, false, false, false, false,
							false, false, false, false, false,
							false, false, false, false, false,
							false, false, false, true, true],		//The levels 19 and 20 are disabled because of the memory footprint
			player		: null,
			name		: ''
		},
		/* Uncomment to use with BayesElo :
		{	ai			: null,
			type		: 'AC',
			selfDuel	: true,
			enPassant	: true,
			level		: 0,
			levelOff	: [	false, false, false, false, false,
							false, false, false, false, false,
							false, false, false, false, true,
							true, true, true, true, true],
			player		: null,
			name		: ''
		},
		//*/
		{	ai			: null,
			type		: 'SF',
			selfDuel	: true,
			enPassant	: true,
			level		: 0,
			levelOff	: [false, false, false, false, false, false, false, false],
			player		: null,
			name		: ''
		},
		{	ai			: null,
			type		: 'SF',
			selfDuel	: true,
			enPassant	: true,
			level		: 0,
			levelOff	: [false, false, false, false, false, false, false, false],
			player		: null,
			name		: ''
		}
	],

	engineOptions = {
		'AC' : {
			name : 'AntiCrux',
			xp   : false
		},
		'SF' : {
			name  : 'Stockfish',
			//Source: @veloce/lichobile/src/js/ui/ai/engine.ts
			skill : [   1,    3,    6,    9,   11,   14,   17,   20],
			depth : [   1,    1,    2,    3,    5,    8,   13,   21],
			time  : [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000],
			elo   : [ 670,  750, 1350, 1500, 1850, 2150, 2500, 2800],	//Formerly [1350, 1420, 1500, 1600, 1700, 1900, 2200, 2500]
			xp    : true
		}
	},

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
		file			: 'anticrux-elo.pgn',			//Output file to store the games
		fileElo			: 'anticrux-elo.csv',			//Output file to store the evolution of the ELO rating (blank name = no generation)
		genGames    	: true,							//Will the job generate new games in PGN format ?
		numGames		: 225,							//Number of games to generate per job
		genStats    	: true,							//Will the job generate the final statistics ?
		fixedInitialElo	: false							//Will the initial ELO 1500 be used to determine the target ELO ?
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
						return (Math.round(Math.random() * 32767) % (pMax - pMin + 1)) + pMin;
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
	job.engineOne.player = job.referee.constants.player.white;
	job.engineTwo.player = job.referee.constants.player.black;

	//-- Sets the level of each player
	while (true)
	{
		job.engineOne.level = lf_random(1, job.engineOne.levelOff.length);
		if (job.engineOne.type == 'AC')
			job.engineOne.ai.setLevel(job.engineOne.level);
		job.engineTwo.level = lf_random(1, job.engineTwo.levelOff.length);
		if (job.engineTwo.type == 'AC')
			job.engineTwo.ai.setLevel(job.engineTwo.level);

		//- Avoids an auto-match
		if (job.engineOne.levelOff[job.engineOne.level-1] || job.engineTwo.levelOff[job.engineTwo.level-1])
			continue;
		else
			if ((job.engineOne.type == job.engineTwo.type) && (job.engineOne.level == job.engineTwo.level))
				continue;
			else
				break;
	}

	//-- Sets the names of each player
	job.engineOne.name = engineOptions[job.engineOne.type].name + ' Level ' + job.engineOne.level;
	job.engineTwo.name = engineOptions[job.engineTwo.type].name + ' Level ' + job.engineTwo.level;

	//-- Initialization of AntiCrux
	job.referee.defaultBoard();
	job.referee.options.board.rotated = (job.referee.player == job.referee.constants.player.white);	//To set the right names during the export to PGN
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
	player = (job.referee.getPlayer() == job.referee.constants.player.white ? job.engineOne : job.engineTwo);

	//-- Plays a move
	if (player.type == 'AC')
	{
		player.ai.loadFen(job.referee.toFen());
		move = player.ai.getMoveAI();
		if (job.debugLevel >= 1)
			moveStr = player.ai.moveToString(move);
		if (job.referee.movePiece(move, true) == job.referee.constants.noMove)
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
		player.ai.postMessage('go depth '+engineOptions[player.type].depth[player.level-1]+' movetime '+engineOptions[player.type].time[player.level-1]);
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
	player = (job.referee.getPlayer() == job.referee.constants.player.white ? job.engineOne : job.engineTwo);

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
		if (move == job.referee.constants.noMove)
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
		result = (job.disqualified.player == job.referee.constants.player.black ? '1-0' : '0-1');
	}
	else
		if (job.referee.isEndGame(false))
		{
			if (job.debugLevel >= 3)
				console.log('> Trace : end of game, winner=' + (job.referee.getWinner() == job.referee.constants.player.white ? job.engineOne.name : job.engineTwo.name));
			result = (job.referee.getWinner() == job.referee.constants.player.white ? '1-0' : '0-1');
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
				{
					console.log('> Trace : current position "'+job.referee.toFen()+'"');
					console.log(job.referee.toConsole(true));
				}
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
	if (engineOptions[job.engineOne.type].hasOwnProperty('elo'))
		pgnHeader.WhiteElo = engineOptions[job.engineOne.type].elo[job.engineOne.level-1];
	if (engineOptions[job.engineTwo.type].hasOwnProperty('elo'))
		pgnHeader.BlackElo = engineOptions[job.engineTwo.type].elo[job.engineTwo.level-1];
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

	var	pgn, regex, games, game,
		t, p, dp, rc, ra, d, pd,
		eloData, csv,
		level, elopponent, levelStat,
		i, j, k, e, s, tab;

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
	games = [];
	game = null;
	for (i=0 ; i<pgn.length ; i++)
	{
		if (game === null)
			game = {
				white		: '',
				whiteLevel	: 0,
				whiteElo	: 0,
				black		: '',
				blackLevel	: 0,
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
			game.whiteLevel = parseInt(regex[1]);
			continue;
		}
		regex = pgn[i].match(/^\[white\s.*stockfish.*level\s([0-9]+)/);
		if (regex !== null)
		{
			game.white = 'SF';
			game.whiteLevel = parseInt(regex[1]);
			continue;
		}

		//- Black player
		regex = pgn[i].match(/^\[black\s.*anticrux.*level\s([0-9]+)/);
		if (regex !== null)
		{
			game.black = 'AC';
			game.blackLevel = parseInt(regex[1]);
			continue;
		}
		regex = pgn[i].match(/^\[black\s.*stockfish.*level\s([0-9]+)/);
		if (regex !== null)
		{
			game.black = 'SF';
			game.blackLevel = parseInt(regex[1]);
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

		//- Stores the game
		if (pgn[i].length === 0)
		{
			if ( game.variant &&
				(game.white.length  > 0) &&
				(game.whiteLevel    > 0) &&
				(game.black.length  > 0) &&
				(game.blackLevel    > 0) &&
				(game.result.length > 0) &&
				!(	(game.white      == game.black) &&
					(game.whiteLevel == game.blackLevel)
				)
			)
				games.push(JSON.parse(JSON.stringify(game)));
			game = null;
		}
	}
	if (job.debugLevel >= 2)
		console.log('> Trace : '+games.length+' games loaded');

	//-- Determines the initial ratings Rn
	eloData = {};
	for (i=0 ; i<enginePool.length ; i++)
		if (!eloData.hasOwnProperty(enginePool[i].type))
			eloData[enginePool[i].type] = {
				rating  : [],
				played  : [],
				win     : [],
				loss    : [],
				draw    : []
			};
	//... for Stockfish
	for (i=0 ; i<engineOptions.SF.elo.length ; i++)
		eloData.SF.rating[i] = [job.fixedInitialElo ? 1500 : engineOptions.SF.elo[i]];
	//... for AntiCrux
	levelStat = [];
	for (i=0 ; i<games.length ; i++)
	{
		game = games[i];
		if (((game.white == 'AC') || (game.black == 'AC')) && (game.white != game.black))
		{
			level = (game.white == 'AC' ? game.whiteLevel : game.blackLevel) - 1;
			elopponent = (game.white == 'AC' ? game.blackElo : game.whiteElo);
			if (elopponent <= 0)
				continue;

			//- Initializes the statistics
			if (levelStat[level] === undefined)
				levelStat[level] = {
					win			: 0,
					draw		: 0,
					loss		: 0,
					opponents	: {}
				};

			//- Updates the statistics
			levelStat[level].opponents[elopponent] = (levelStat[level].opponents[elopponent] === undefined ? 1 : levelStat[level].opponents[elopponent]+1);
			if (game.result == '1/2-1/2')
				levelStat[level].draw++;
			else
				if (((game.white == 'AC') && (game.result == '1-0')) ||
					((game.black == 'AC') && (game.result == '0-1'))
				)
					levelStat[level].win++;
				else
					levelStat[level].loss++;
		}
	}
	for (level in levelStat)
	{
		//- Checks
		levelStat[level].games = levelStat[level].win + levelStat[level].draw + levelStat[level].loss;
		if ((levelStat[level].opponents.length < 3) || (levelStat[level].games < 9))
			continue;
		levelStat[level].points = levelStat[level].win + levelStat[level].draw/2;

		//- Calculates the rating
		if ((levelStat[level].points === 0) || job.fixedInitialElo)
			ra = 1500;
		else
		{
			p = Math.round(100 * levelStat[level].points / levelStat[level].games);
			dp = [	-800, -677, -589, -538, -501, -470, -444, -422, -401, -383,
					-366, -351, -336, -322, -309, -296, -284, -273, -262, -251,
					-240, -230, -220, -211, -202, -193, -184, -175, -166, -158,
					-149, -141, -133, -125, -117, -110, -102,  -95,  -87,  -80,
					 -72,  -65,  -57,  -50,  -43,  -36,  -29,  -21,  -14,   -7,
					   0,    7,   14,   21,   29,   36,   43,   50,   57,   65,
					  72,   80,   87,   95,  102,  110,  117,  125,  133,  141,
					 149,  158,  166,  175,  184,  193,  202,  211,  220,  230,
					 240,  251,  262,  273,  284,  296,  309,  322,  336,  351,
					 366,  383,  401,  422,  444,  470,  501,  538,  589,  677,
					 800][p];
			rc = 0;
			t = Object.keys(levelStat[level].opponents).length;
			for (e in levelStat[level].opponents)
				rc += e * levelStat[level].opponents[e];
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
		eloData.AC.rating[level] = [ra];
	}

	//-- Initializes some additional data
	for (e in eloData)
		for (i=0 ; i<eloData[e].rating.length ; i++)
		{
			eloData[e].played[i] = 0;
			eloData[e].win[i]    = 0;
			eloData[e].loss[i]   = 0;
			eloData[e].draw[i]   = 0;
		}

	//-- Calculates the projected rating
	for (i=0 ; i<games.length ; i++)
	{
		game = games[i];

		//- Considers the current game
		if ((eloData[game.white].rating[game.whiteLevel-1] === undefined) ||
		    (eloData[game.black].rating[game.blackLevel-1] === undefined)
		)
			continue;
		game.whiteElo = eloData[game.white].rating[game.whiteLevel-1][eloData[game.white].rating[game.whiteLevel-1].length-1];	//Override
		game.blackElo = eloData[game.black].rating[game.blackLevel-1][eloData[game.black].rating[game.blackLevel-1].length-1];	//Override
		eloData[game.white].played[game.whiteLevel-1]++;
		eloData[game.black].played[game.blackLevel-1]++;
		game.whitePlayed = eloData[game.white].played[game.whiteLevel-1];
		game.blackPlayed = eloData[game.black].played[game.blackLevel-1];

		//- ELO difference
		d = Math.abs(game.whiteElo - game.blackElo);
		if (d > 400)
			d = 400;

		//- Player's score probability [0..400]
		pd = [	50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 52, 53, 53,
				53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55,
				56, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57, 57, 57, 58, 58, 58, 58, 58, 58,
				58, 58, 59, 59, 59, 59, 59, 59, 59, 60, 60, 60, 60, 60, 60, 60, 60, 61, 61, 61,
				61, 61, 61, 61, 62, 62, 62, 62, 62, 62, 62, 62, 63, 63, 63, 63, 63, 63, 63, 64,
				64, 64, 64, 64, 64, 64, 64, 65, 65, 65, 65, 65, 65, 65, 66, 66, 66, 66, 66, 66,
				66, 66, 67, 67, 67, 67, 67, 67, 67, 67, 68, 68, 68, 68, 68, 68, 68, 68, 69, 69,
				69, 69, 69, 69, 69, 69, 70, 70, 70, 70, 70, 70, 70, 70, 71, 71, 71, 71, 71, 71,
				71, 71, 71, 72, 72, 72, 72, 72, 72, 72, 72, 73, 73, 73, 73, 73, 73, 73, 73, 73,
				74, 74, 74, 74, 74, 74, 74, 74, 74, 75, 75, 75, 75, 75, 75, 75, 75, 75, 76, 76,
				76, 76, 76, 76, 76, 76, 76, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 78, 78, 78,
				78, 78, 78, 78, 78, 78, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 80, 80, 80, 80,
				80, 80, 80, 80, 80, 80, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 82, 82, 82,
				82, 82, 82, 82, 82, 82, 82, 82, 83, 83, 83, 83, 83, 83, 83, 83, 83, 83, 83, 84,
				84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 85, 85, 85, 85, 85, 85, 85, 85, 85,
				85, 85, 85, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 86, 87, 87, 87, 87,
				87, 87, 87, 87, 87, 87, 87, 87, 87, 88, 88, 88, 88, 88, 88, 88, 88, 88, 88, 88,
				88, 88, 88, 88, 88, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 89, 90, 90,
				90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 91, 91, 91, 91, 91,
				91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 92, 92, 92, 92, 92, 92, 92, 92,
				92][d] / 100.0; //Approximately equal to 1/(1+10^(-D/400))
		if (game.whiteElo == game.blackElo)
		{
			game.whitePD = pd;	//0.5
			game.blackPD = pd;	//0.5
		}
		else if (game.whiteElo > game.blackElo)
		{
			game.whitePD = pd;
			game.blackPD = 1.0 - pd;
		}
		else
		{
			game.whitePD = 1.0 - pd;
			game.blackPD = pd;
		}

		//- Score of the game
		if (game.result == '1-0')
		{
			game.whiteScore = 1;
			eloData[game.white].win[game.whiteLevel-1]++;
			game.blackScore = 0;
			eloData[game.black].loss[game.blackLevel-1]++;
		}
		else if (game.result == '0-1')
		{
			game.whiteScore = 0;
			eloData[game.white].loss[game.whiteLevel-1]++;
			game.blackScore = 1;
			eloData[game.black].win[game.blackLevel-1]++;
		}
		else
		{
			game.whiteScore = 0.5;
			eloData[game.white].draw[game.whiteLevel-1]++;
			game.blackScore = 0.5;
			eloData[game.black].draw[game.blackLevel-1]++;
		}

		//- Development coefficient K
		game.whiteK = ((game.whitePlayed < 30) && !engineOptions[game.white].xp ? 40 : (game.whiteElo >= 2400 ? 10 : 20));
		game.blackK = ((game.blackPlayed < 30) && !engineOptions[game.black].xp ? 40 : (game.blackElo >= 2400 ? 10 : 20));
 	
		//- New ELO
		eloData[game.white].rating[game.whiteLevel-1].push(eloData[game.white].rating[game.whiteLevel-1][eloData[game.white].rating[game.whiteLevel-1].length-1] + Math.round(game.whiteK * (game.whiteScore - game.whitePD)));
		eloData[game.black].rating[game.blackLevel-1].push(eloData[game.black].rating[game.blackLevel-1][eloData[game.black].rating[game.blackLevel-1].length-1] + Math.round(game.blackK * (game.blackScore - game.blackPD)));
	}

	//-- Final display of the statistics
	for (e in eloData)
	{
		console.log('');
		console.log('The ratings for the engine "'+e+'" are :');
		for (i=0 ; i<eloData[e].rating.length ; i++)
			if (eloData[e].rating[i] !== undefined)
				console.log('   - '+e+' Level '+(i+1)+' is rated '+(eloData[e].rating[i][eloData[e].rating[i].length-1])+' (initially '+eloData[e].rating[i][0]+') after '+(eloData[e].win[i]+eloData[e].draw[i]+eloData[e].loss[i])+' games (+'+eloData[e].win[i]+'/='+eloData[e].draw[i]+'/-'+eloData[e].loss[i]+').');
	}

	//-- Saves the CSV file
	if (job.fileElo.length > 0)
	{
		//- Builds the file
		csv = [''];
		s = 0;
		for (e in eloData)
		{
			for (i=0 ; i<eloData[e].rating.length ; i++)
			{
				tab = eloData[e].rating[i];
				if (tab === undefined)
					continue;

				//- Header
				csv[0] += (csv[0].length>0 ? ';' : '') + e + (i+1);

				//- Items
				for (j=0 ; j<Math.max(tab.length, csv.length-1) ; j++)
				{
					if (csv[j+1] === undefined)
					{
						csv[j+1] = '';
						for (k=0 ; k<s ; k++)
							csv[j+1] += ';';
					}
					else
						if (csv[j+1].length > 0)
							csv[j+1] += ';';
					if (tab[j] !== undefined)
						csv[j+1] += tab[j];
				}
				s++;
			}
		}

		//- Saves the data
		fs.writeFile(job.fileElo, csv.join("\r\n")+"\r\n", function(pError) {
			if (pError !== null)
				console.log('Error : ' + pError);
		});
		if (job.debugLevel >= 1)
		{
			console.log('');
			console.log('CSV file saved under "'+job.fileElo+'".');
		}
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
