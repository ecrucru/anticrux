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


/*======== Library of positions
// Interesting positions for playing with AntiCrux :
//		r1bqk1nr/p2npp1p/1p4p1/8/4P3/6P1/P4b1P/5BR1 w - -			Uncertain game
//		3q1b2/4p1pr/4P3/8/6b1/8/5P2/8 w - -							Quick win or deep loss
//		8/6k1/3p3p/1p5P/1P6/5p2/1p3P2/8 b - -						Pawn game
//		1r6/4npb1/n4k2/7P/P6R/P4K2/2P2P2/2R5 w - -					Mate in 6 to be found (Rb1)
//		8/5pb1/n5k1/8/P6R/PP6/4KP2/8 w - -							Variant of the previous mate (Rd4)
//		1nb1k3/4Q3/6pn/8/8/8/2PqPP2/4K1N1 b - -						Mate in 7 to be found (Rxe7)
//		r7/p7/n4B2/8/8/4PN2/P7/RN2K3 w - -							Mate in 8 to be found with several possibilities (Bd8 or Bh8)
//		2r1k1nr/p1pp1ppp/8/8/P7/1R3P2/2PP2PP/1NB1K1NR b - -			Mate in 9 to be found (Rb8)
//		1n1qk1n1/r1pp1p1r/1p6/8/8/1P4P1/2PK1P1P/1N3BNR w - -		Mate in 10 to be found (Na3)
//		rnb4r/p1pk3p/5P2/8/1p6/1P3P2/P1PNP1P1/R3KBN1 b - -			Mate in 10 to be found (Ke7)
//		rn2k2r/ppp2p1p/5p2/8/8/N6P/PPPKPP1P/R1B2BNR b - -			Mate in 11 to be found (b5)
//		6n1/p7/2B2p2/8/8/4K3/P1P2PPR/RN6 w - -						Mate in 12 to be found (Rh6)
//		rnb4K/pppp1k1p/5p2/2b5/4n3/8/8/8 b - -						Mate in 13 to be found
//		1brqkn2/p1pppBp1/8/1p6/8/2P5/PP1PPP1r/B1RQKNNb w - -		Mate in 13 to be found in AntiChess 689 (Nh2)
//		1nbqkbnr/r1pp1ppp/4p3/1p6/1P6/2P5/P2PPPPP/RNB1KBNR b - b3	Mate in 15 to be found (Bxb4, Rxa2)
//		rnb1kb1r/p1pp1ppp/7n/4P3/1p5R/1P6/P1P1PPP1/RNBQKBN1 w - -	Mate in 15 to be found (Bh6)
//		4k2r/pppn2pp/4p3/8/8/N3PN2/PPP1K1P1/R1B5 w - -				Mate to find g4 and Nb5 (Ne5-g4)

// Interesting positions which illustrate the implemented features :
//		8/7p/8/8/8/b7/1P6/1N6 w - -									Originating piece in movePiece() : xa3, bxa3, b2a3, b2xa3, b1a3, b1xa3, Na3, Nxa3 are OK
//		8/3P4/8/2P5/4P3/8/8/6r1 w - -								Average valuation for weak levels : ignoring the infinite values makes a blunder if promoted to bishop
//		7K/p1p1p3/7b/7p/8/2k1p3/8/8 b - -							Average valuation for weak levels : ignoring the infinite values makes a blunder when not playing Bg7
//		2Rn1b1r/1ppppppq/1k3n1p/8/1P6/6P1/2PPPPNP/1KBN1BQR w - -	Minimization of the liberty (Rxd8=minimization, Rxc7=no minimization)
//		4k1nr/7Q/8/8/8/3P4/6PP/6rR b - -							Minimization of the liberty and its negative effect (Rxg7=minimization but loses)
//		1nbqkr2/r1pppp1p/1p6/8/3P4/1P2P3/2P4P/5BN1 w - -			Minimization of the liberty (Ba6=minimization but it is not the best move)
//		8/8/4kn2/8/1K6/8/2P5/8 w - -								Levels of game (hard to find Kc4 ?)
//		8/5k2/8/3P4/8/8/8/8 b - -									Accelerated end of game
//		8/P7/1p6/8/8/8/8/8 w - -									Accelerated end of game
//		k7/1p6/1P6/8/8/8/8/8 b - -									Accelerated end of game
//		5R2/8/2k5/8/8/8/8/8 w - -									Accelerated end of game : Rc8 and Rf6 are forbidden
//		8/8/8/8/2r5/8/K7/8 w - -									Accelerated end of game : only Ka1 should matter to delay the loss
//		8/1k6/8/8/5R2/8/8/8 w - -									Opportunism removes some moves
//		r2qk1nr/p2npp1p/b5p1/p3b1P1/8/8/8/8 b - -					Best static move (Nh6 and Bg7 are the right moves)
//		8/5P2/8/8/4k1p1/8/8/8 w - -									Promotion
//		8/2p5/8/3P4/8/8/8/8 b - -									En passant is a forced move
//		7r/7p/8/8/8/5R2/8/8 b - -									En passant if no impact on the other pieces
//		rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - -			En passant with no failed undo after "e3 c5 b4"
//		1rbqk2r/Rppppp2/8/5n2/4P3/2P5/2P2PPP/1N2K1NR w - -			Highlight the evaluated moves only (see highlightMoves)
//		3R4/8/8/8/8/8/2p5/8 w - -									Option "No statistic on forced moves" : immediate classical result
//		rnb5/pppp1k2/5p1K/8/4n3/8/8/8 b - -							Option "No statistic on forced moves" : in the previous version, Ng5 was a blunder
//		6R1/8/8/8/8/2k5/8/8 w - -									Hard to finish (maximal number of nodes, no game strategy)
//		8/6p1/4K3/8/7r/8/8/8 b - -									Hard to finish (maximal number of nodes)
//		8/4P3/6P1/7P/8/8/8/1k6 b - -								Deep promotions push the score to ±100% but it is not a mate
//		k7/8/8/2R5/8/8/8/8 w - -									Exploration level by level
//		1n1k4/8/5n2/5p2/3P1P2/1P6/8/8 b - -							Nfd7 is the move of 1 knight only
//		8/8/8/8/5B2/8/1p6/8 b - -									Draw by position : choose a bishop for the black pawn
*/



/**
 * This module is the main library.
 *
 * @module AntiCrux
 * @submodule main
 */


//======== Main class
/**
 * This class handles the data model to play antichess.
 *
 * @class AntiCrux
 * @constructor
 */
var AntiCrux = function() {
	this._init();
	this._root_node = {};
	this.clearBoard();
};


//---- Public members

/**
 * The method opens the web UI through the call to the file "index.html".
 * It is restricted to Node.js.
 *
 * @method startUI
 */
AntiCrux.prototype.startUI = function() {
	if ((typeof module !== 'undefined') && module.exports)
	{
		var opn = require('opn');
 		opn('./node_modules/anticrux/index.html');
	}
	else
		throw 'Error - AntiCrux.prototype.startUI() is restricted to Node.js';
};

/**
 * The method copies the options from another instance of AntiCrux.
 *
 * @method copyOptions
 * @param {AntiCrux} pObject Instance of AntiCrux.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.copyOptions = function(pObject) {
	//-- Checks
	if (!pObject.hasOwnProperty('options'))
		return false;

	//-- Proceeds with the copy
	this.options = JSON.parse(JSON.stringify(pObject.options));
	return true;
};

/**
 * The method returns the primary node which contains the information about the board.
 * This is typically the node claimed by any argument of the other methods named *pNode*,
 * even if *pNode* is generally optional.
 *
 * @method getMainNode
 * @return {Object} The node is an object.
 */
AntiCrux.prototype.getMainNode = function() {
	return this._root_node;
};

/**
 * The method completely resets all the data related to the current game.
 *
 * @method clearBoard
 */
AntiCrux.prototype.clearBoard = function() {
	var i;

	//-- Clears the board
	this.freeMemory();
	this._buffer = '';
	this._highlight = [];
	this._history = [];
	this._history_fen0 = '';
	this._lastDrawReason = '';
	this._halfmoveclock = 0;
	this._halfmoveclock_status = -1;		//-1=undef, 0=reset, 1=increment
	this._root_node = {
		board : [],
		magic : this.constants.bitmask.none | this.constants.player.white,
		score : this.constants.bitmask.none
	};
	for (i=0 ; i<64 ; i++)
		this._root_node.board[i] = this.constants.player.none | this.constants.piece.none;
	this.fischer = null;
};

/**
 * The method returns a random number to be used for a new game AntiChess960.
 * The number 519 corresponds to the classical start position.
 *
 * @method getNewFischerId
 * @return {Integer} A number between 1 and 960.
 */
AntiCrux.prototype.getNewFischerId = function() {
	return Math.floor(Math.random()*960)+1;
};

/**
 * The method sets the initial position of the pieces on the board.
 * If you want to play from a random start position, you have to specify the argument,
 * eventually with the help of the method *getNewFischerId()*.
 *
 * @method defaultBoard
 * @param {Integer} pFischer (Optional) Identifier of the start position.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.defaultBoard = function(pFischer) {
	var i, z, p, krn, pieces;

	//-- Self
	if (pFischer === undefined)
		pFischer = this.constants.classicalFischer;

	//-- Clears the board
	if ((pFischer < 1) || (pFischer > 960))
		return false;
	this.clearBoard();
	this.fischer = pFischer;

	//-- Defines the main line of pieces with the help of Chess960
	// https://en.wikipedia.org/wiki/Chess960
	pieces = [	this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none,
				this.constants.piece.none
			];
	//Bishop on a white cell
	pieces[Math.floor(0.08*(Math.floor(25*(pFischer-1)) % 100)+1.5)] = this.constants.piece.bishop;
	//Bishop on a black cell
	pieces[Math.floor(0.08*(Math.floor(25*Math.floor((pFischer-1)/4)) % 100) + 0.5)] = this.constants.piece.bishop;
	//Queen
	z = Math.floor(Math.floor((pFischer-1)/4)/4)/6;
	p = Math.floor(6*(z-Math.floor(z)) + 0.5);
	for (i=0 ; i<8 ; i++)
	{
		if (pieces[i] != this.constants.piece.none)
			continue;
		if (p === 0)
		{
			pieces[i] = this.constants.piece.queen;
			break;
		}
		p--;
	}
	//KRN
	krn = ['NNRKR', 'NRNKR', 'NRKNR', 'NRKRN', 'RNNKR', 'RNKNR', 'RNKRN', 'RKNNR', 'RKNRN', 'RKRNN'][Math.floor(z)];
	for (i=0 ; i<8 ; i++)
	{
		if (pieces[i] != this.constants.piece.none)
			continue;

		pieces[i] = this.constants.piece.mapping[krn.charAt(0)];
		krn = krn.substring(1);
	}

	//-- Sets the pieces
	for (i=0 ; i<8 ; i++)
	{
		this._root_node.board[8*0+i] = this.constants.player.black | pieces[i];
		this._root_node.board[8*1+i] = this.constants.player.black | this.constants.piece.pawn;
		this._root_node.board[8*6+i] = this.constants.player.white | this.constants.piece.pawn;
		this._root_node.board[8*7+i] = this.constants.player.white | pieces[i];
	}
	this._history_fen0 = this.toFen();
	return true;
};

/**
 * The method loads the game from the provided position.
 * Read more about the Forsyth–Edwards notation (FEN) <a href="https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation">at Wikipedia</a>.
 *
 * For example, the default start position is represented by the following string :
 *
 *	rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 0
 *
 * @method loadFen
 * @param {String} pFen Position encoded according to the Forsyth–Edwards notation (FEN).
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.loadFen = function(pFen) {
	var	that, list, board,
		x, y, i, car;

	//-- Checks
	if (pFen.length === 0)
		return false;

	//-- Splits the input parameter
	list = pFen.trim().split(' ');
	if (list[0].split('/').length != 8)
		return false;

	//-- Loads the main position
	x = 0;
	y = 0;
	board = [];
	for (i=0 ; i<list[0].length ; i++)
	{
		car = list[0].charAt(i);
		if ('12345678'.indexOf(car) != -1)
			x += parseInt(car);
		else if (car == '/')
		{
			x = 0;
			y++;
		}
		else if ('prnbqk'.indexOf(car.toLowerCase()) != -1)
		{
			if (x > 7)
				return false;
			else
			{
				board[8*y+x] = (car == car.toLowerCase() ? this.constants.player.black : this.constants.player.white) | this.constants.piece.mapping[car];
				x++;
			}
		}
		else
			return false;
	}
	this.clearBoard();
	that = this;
	board.forEach(function(element, index, array) {
						that._root_node.board[index] = element;
					});

	//-- Current player
	this._root_node.magic = (this._root_node.magic & ~this.constants.bitmask.player) |
								(list[1] === undefined ?
									this.constants.player.white :
									(list[1] == 'b' ? this.constants.player.black : this.constants.player.white)
								);

	//-- En passant
	if (this.options.variant.enPassant && (list[3] !== undefined) && (list[3] !== '-'))
	{
		i = list[3].substring(1, 2);
		if ((list[3].length === 1) ||
			((i == '3') && ((this._root_node.magic & this.constants.bitmask.player) == this.constants.player.black)) ||
			((i == '6') && ((this._root_node.magic & this.constants.bitmask.player) == this.constants.player.white))
		) {
			i = 'abcdefgh'.indexOf(list[3].substring(0, 1));
			if (i !== -1)
				this._root_node.enpassant = 8*((this._root_node.magic & this.constants.bitmask.player) == this.constants.player.white ? 2 : 5) + i;
		}
	}

	//-- Halfmove clock
	this._halfmoveclock = (list[4] !== undefined ? parseInt(list[4]) : 0);
	this._halfmoveclock_status = -1;

	//-- Final
	this._root_node.score = this._ai_nodeValuate().score;
	this._history_fen0 = this.toFen();
	if (list[0].indexOf('8/8/8/8') == -1)
		this.fischer = null;
	else
	{
		this._initFischer();
		this.fischer = this._buffer_fischer.indexOf(list[0]);
		this.fischer = (this.fischer !== -1 ? this.fischer+1 : null);
	}
	return true;
};

/**
 * The method loads asynchronously a game from lichess.org.
 *
 * @method loadLichess
 * @param {String} pKey Identifier of the game on 8 or 12 characters.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.loadLichess = function(pKey) {
	var that;

	//References :
	//	https://github.com/ornicar/lila#http-api
	//	https://lichess.org/api/game/oPUvsggeDeTg?with_fens=1&with_moves=1

	//-- Checks
	if (!pKey.match(/^[a-zA-Z0-9]{8}$/) && !pKey.match(/^[a-zA-Z0-9]{12}$/))
		return false;

	//-- Gets the JSON
	that = this;
	$.ajaxSetup({ cache: false });
	$.get(	'https://lichess.org/api/game/'+pKey+'?with_fens=1&with_moves=1',
			function(data) {
			})
		.fail(function(data) {
			})
		.done(function(data) {
			var moves, move, playerIndication, i;

			//-- Checks the variant
			if (!that._has(data, 'variant', 'antichess'))
				return false;

			//-- Sets the initial position of the board
			if (that._has(data, 'initialFen', true))
			{
				if (!that.loadFen(data.initialFen))
					return false;
			}
			else
				that.defaultBoard(that.constants.classicalFischer);

			//-- Determines the current player
			if (that._has(data, 'color', 'black'))
				playerIndication = that.constants.player.black;
			else
				playerIndication = that.constants.player.white;

			//-- Determines the first player of the game
			moves = data.moves.split(' ');
			if ((playerIndication == that.constants.player.white) && (moves.length % 2 == 1))
				playerIndication = that.constants.player.black;
			else
				playerIndication = that.constants.player.white;

			//-- Processes the moves
			that._history = [];
			for (i=0 ; i<moves.length ; i++)
			{
				move = that.movePiece(moves[i], true, playerIndication);
				if (move == that.constants.noMove)
					return false;
				else
				{
					that.updateHalfMoveClock();
					that.logMove(move);
					that.highlightMove(move);
					playerIndication = (playerIndication == that.constants.player.white ? that.constants.player.black : that.constants.player.white);
				}
			}

			//-- Result
			that._root_node.magic = (that._root_node.magic & ~that.constants.bitmask.player) | playerIndication;
			return true;
		});
	return true;
};

/**
 * The method indicates if the game doesn't start with the classical position.
 *
 * @method hasSetUp
 * @return {Boolean} *true* if there is a special start position, else *false*.
 */
AntiCrux.prototype.hasSetUp = function() {
	//-- Position
	if (!this._has(this, '_history_fen0', true))
		return false;

	//-- Result
	return (this._history_fen0.substring(0,43) != 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
};

/**
 * The method returns the start position.
 *
 * @method getInitialPosition
 * @return {String} *true* The start position in FEN format.
 */
AntiCrux.prototype.getInitialPosition = function() {
	return (!this._has(this, '_history_fen0', true) ? '' : this._history_fen0);
};

/**
 * The method returns the current player.
 *
 * @method getPlayer
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} A value from AntiCrux.constants.player.
 */
AntiCrux.prototype.getPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Finds the player
	return (pNode.magic & this.constants.bitmask.player);
};

/**
 * The method returns the player who is not playing.
 *
 * @method getOppositePlayer
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} A value from AntiCrux.constants.player, or *null* if incorrect.
 */
AntiCrux.prototype.getOppositePlayer = function(pNode) {
	switch (this.getPlayer(pNode))
	{
		case this.constants.player.none:
			return this.constants.player.none;
		case this.constants.player.white:
			return this.constants.player.black;
		case this.constants.player.black:
			return this.constants.player.white;
		default:
			return null;
	}
};

/**
 * The method sets the level of difficulty. The level activates various techniques but
 * it doesn't ensure that the greater the level, the stronger the artificial intelligence.
 *
 * @method setLevel
 * @param {Integer} pLevel A value from 1 to 20.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.setLevel = function(pLevel) {
	//-- Checks
	if ((pLevel < 1) || (pLevel > 20))
		return false;

	//-- Applies the new settings
	this.options.ai.elo					= (pLevel == 1 ? 300 : Math.round(294.8 * Math.log(pLevel) + 855.5));
	this.options.ai.maxDepth			= [3, 4, 6, 8, 3, 5, 6, 7, 8, 9, 10, 15, 20, 30, 30, 30, 40, 40, 45, 50][pLevel-1];
	this.options.ai.maxNodes			= [100, 50000, 40000, 30000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 200000, 300000, 400000, 500000, 600000, 750000, 1000000, 1500000][pLevel-1];
	this.options.ai.minimizeLiberty		= (pLevel >= 8);
	this.options.ai.maxReply			= [1, 99, 3, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1][pLevel-1];
	this.options.ai.randomizedSearch	= (pLevel <= 14);
	this.options.ai.pessimisticScenario	= (pLevel >= 10);
	this.options.ai.opportunistic		= ((pLevel >= 6) && (pLevel <= 12));
	this.options.ai.handicap			= [0, 80, 60, 40, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][pLevel-1];
	this.options.ai.acceleratedEndGame	= (pLevel >= 6);
	this.options.ai.oyster				= (pLevel == 1);
	this._lastLevel = pLevel;
	return true;
};

/**
 * The method returns the last level of the AI set with the method *setLevel()*.
 *
 * @method getLevel
 * @return {Integer} Last set level, equal to null if never changed.
 */
AntiCrux.prototype.getLevel = function() {
	return this._lastLevel;
};

/**
 * The method sets the current player about to play.
 *
 * @method setPlayer
 * @param {AntiCrux.constants.player} pPlayer The player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.setPlayer = function(pPlayer, pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Sets the player
	if ([this.constants.player.black, this.constants.player.none, this.constants.player.white].indexOf(pPlayer) !== -1)
	{
		pNode.magic = (pNode.magic & ~this.constants.bitmask.player) | pPlayer;
		return true;
	}
	else
		return false;
};

/**
 * The method returns the piece located at the given coordinate.
 *
 * @method getPieceByCoordinate
 * @param {String} pCoordinate A coordinate written with a letter then a figure (ex.: a8, f4...).
 * @param {Object} pNode (Optional) Reference node.
 * @return {Object} An object composed of the fields *player* and *piece*.
 */
AntiCrux.prototype.getPieceByCoordinate = function(pCoordinate, pNode) {
	var index;

	//-- Checks
	if (!pCoordinate.match(/^[a-h][1-8]$/i))
		return { player	: this.constants.player.none,
				 piece	: this.constants.piece.none
			};

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Information
	index = (8-parseInt(pCoordinate.charAt(1)))*8 + 'abcdefgh'.indexOf(pCoordinate.toLowerCase().charAt(0));
	return { player	: (pNode.board[index] & this.constants.bitmask.player),
			 piece	: (pNode.board[index] & this.constants.bitmask.piece)
		};
};

/**
 * The method indicates if the provided argument describes a move.
 * The check complies with different formats : Bxc3, g4g5, f8=K, c1-c7, Rae6...
 *
 * @method isMove
 * @param {String} pMove The move to verify.
 * @return {Boolean} *true* if valid, else *false*.
 */
AntiCrux.prototype.isMove = function(pMove) {
	return	pMove.match(/^[RNBQK]?([a-h]([0-9])?)?x?[a-h][0-9]=?[RrNnBbQqKk]?\s?[\!|\+|\#|\-|\/|\=|\?]*$/) ||
			pMove.match(/^[0-6]?[0-7]{4}$/);
};

/**
 * The method executes one move.
 *
 * @method movePiece
 * @param {String, Integer} pMove Move.
 * @param {Boolean} pCheckLegit Verify the validity of the move.
 * @param {AntiCrux.constants.player} pPlayerIndication (Optional) The current player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} The internal representation of the move (to be used for the log for example),
 *                   else *AntiCrux.constants.noMove* if the move is incorrect.
 */
AntiCrux.prototype.movePiece = function(pMove, pCheckLegit, pPlayerIndication, pNode) {
	var	regex, player, node, moves, i, x, y, tX, tY, valid,
		move_promotion, move_fromY, move_fromX, move_toY, move_toX;

	//-- Self
	if ((pMove === undefined) || (pMove == this.constants.noMove))
		return this.constants.noMove;
	if (pNode === undefined)
		pNode = this._root_node;
	if (this.hasPendingPromotion(pNode))
		return this.constants.noMove;
	if (pPlayerIndication === undefined)
		pPlayerIndication = this.constants.player.none;
	if (pNode === null)
		return this.constants.noMove;

	//-- Converts from the external notation
	if (typeof pMove == 'string')
	{
		//- Decode the input string
		regex = pMove.match(/^([RNBQK])?([a-h]([0-9])?)?(x)?([a-h][0-9])=?([RrNnBbQqKk])?\s?[\!|\+|\#|\-|\/|\=|\?]*$/); //case-sensitive, no castling
		if (regex === null)
			return this.constants.noMove;

		//- Fixes the missing values
		for (i=0 ; i<regex.length ; i++)
			if (regex[i] === undefined)
				regex[i] = '';

		//- Promotion
		if (regex[6].length > 0)
			move_promotion = this.constants.piece.mapping[regex[6]];
		else
			move_promotion = this.constants.piece.none;

		//- Move to
		move_toX = 'abcdefgh'.indexOf(regex[5].charAt(0));
		move_toY = 8 - parseInt(regex[5].charAt(1));

		//- Move from : establishes the possible moves
		node = this._ai_nodeCopy(pNode, false);
		moves = [];
		if (pPlayerIndication == this.constants.player.none)
		{
			node.magic = (node.magic & ~this.constants.bitmask.player) | this.constants.player.black;
			this._ai_nodeMoves(node);
			moves = moves.concat(node.moves);
			node.magic = (node.magic & ~this.constants.bitmask.player) | this.constants.player.white;
			this._ai_nodeMoves(node);
			node.moves = moves.concat(node.moves);
		}
		else
		{
			node.magic = (node.magic & ~this.constants.bitmask.player) | pPlayerIndication;
			this._ai_nodeMoves(node);
		}
		moves.splice(0, moves.length);

		//- Move from : validates the originating positions
		for (i=0 ; i<node.moves.length ; i++)
		{
			if (node.moves[i] % 100 == move_toY*10 + move_toX)
			{
				x = Math.floor(node.moves[i]/100 ) % 10;
				y = Math.floor(node.moves[i]/1000) % 10;
				// Checks the promotion
				if ((move_promotion != this.constants.piece.none) && (Math.floor(node.moves[i]/10000)%10 != move_promotion))
					continue;
				// Checks the originating player
				if ((pPlayerIndication != this.constants.player.none) && ((node.board[8*y+x] & this.constants.bitmask.player) != pPlayerIndication))
					continue;
				// Checks the originating partial coordinate
				if ((regex[2].length == 1) && (regex[2] != 'abcdefgh'.charAt(x)))
					continue;
				// Checks the originating full coordinate
				if (	(regex[2].length == 2) &&
						(	(regex[2][0] != 'abcdefgh'.charAt(x)) ||
							(8-parseInt(regex[2][1]) != y)
						)
				)
					continue;
				// Checks the originating piece
				if ((regex[1].length == 1) && (this.constants.piece.mapping[regex[1]] != (node.board[8*y+x] & this.constants.bitmask.piece))) //Is it the described piece ?
					continue;
				if ((regex[1].length === 0) && (regex[2].length != 2) && ((node.board[8*y+x] & this.constants.bitmask.piece) != this.constants.piece.pawn)) //Is it a partially identified pawn ?
					continue;
				// Validates the move
				if (moves.indexOf(node.moves[i]%10000) == -1)
					moves.push(node.moves[i]%10000);
			}
		}

		//- Move from : chooses the final move
		if (moves.length != 1)
			return this.constants.noMove;
		move_fromY = Math.floor(moves[0]/1000) % 10;
		move_fromX = Math.floor(moves[0]/100 ) % 10;
	}
	else
	{
		pMove = parseInt(pMove);
		if (pMove === 0)
			return this.constants.noMove;
		move_promotion = Math.floor(pMove/10000) % 10;
		move_fromY     = Math.floor(pMove/1000 ) % 10;
		move_fromX     = Math.floor(pMove/100  ) % 10;
		move_toY       = Math.floor(pMove/10   ) % 10;
		move_toX       =            pMove        % 10;
	}

	//-- Validation of the format
	if (	(move_fromX < 0) || (move_fromX > 7) ||
			(move_fromY < 0) || (move_fromY > 7) ||
			(move_toX   < 0) || (move_toX   > 7) ||
			(move_toY   < 0) || (move_toY   > 7) ||
			(move_promotion > this.constants.piece.king)
	)
		return this.constants.noMove;
	pMove = move_promotion*10000 + move_fromY*1000 + move_fromX*100 + move_toY*10 + move_toX;

	//-- Finds the player
	player = (pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player);
	if (player == this.constants.player.none)
		return this.constants.noMove;
	pNode.magic = (pNode.magic & ~this.constants.bitmask.player) | player;

	//-- Verifies if the move is legit
	if (pCheckLegit)
	{
		node = this._ai_nodeCopy(pNode, false);
		node.magic = (node.magic & ~this.constants.bitmask.player) | player;
		this._ai_nodeMoves(node);
		valid = false;
		for (i=0 ; i<node.moves.length ; i++)
		{
			if ((pMove == node.moves[i]) ||
			    (pMove == node.moves[i] % 10000))		//The promotion may be unknown at this moment
			{
				valid = true;
				break;
			}
		}
		if (!valid)
		{
			this._highlight.splice(0, this._highlight.length);
			return this.constants.noMove;
		}
	}

	//-- En passant...
	//- Executes the move
	if (	this.options.variant.enPassant &&
			pNode.hasOwnProperty('enpassant') &&
			(8*move_toY+move_toX == pNode.enpassant) &&																	//Target cell is identified as "en passant"
			((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn) &&		//Source piece is a pawn
			((pNode.board[8*move_toY+move_toX] & this.constants.bitmask.piece) == this.constants.piece.none)			//Target piece is blank
		)
	{
		// Locates the target pawn
		tX = move_toX;
		tY = move_toY + this.constants.player.mapping_rev[pNode.magic & this.constants.bitmask.player];
		// Removes the target pawn
		if ((tX>=0) && (tX<=7) && (tY>=0) && (tY<=7) &&																							//Assumed to be always true
			((pNode.board[8*tY+tX] & this.constants.bitmask.piece) == this.constants.piece.pawn) &&												//Kill an en passant pawn
			((pNode.board[8*tY+tX] & this.constants.bitmask.player) != (pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player))	//Black vs. White
		) {
			pNode.board[8*tY+tX] = this.constants.player.none | this.constants.piece.none;
			delete pNode.enpassant;
		}
	}
	//- Marks the cell
	else if (	((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn) &&
				(Math.abs(move_toY-move_fromY) == 2)
	)
		pNode.enpassant = 4*(move_toY+move_fromY) + move_toX;
	//- Removes the cell
	else
		delete pNode.enpassant;

	//-- Updates the status to change the halfmove clock later
	this._halfmoveclock_status = 1;
	if (((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn) ||		//Pawn advance
		((pNode.board[8*move_toY+move_toX] & this.constants.bitmask.piece) != this.constants.piece.none)			//Capturing move
	)
		this._halfmoveclock_status = 0;

	//-- Performs the move
	pNode.board[8*move_toY+move_toX] = (pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player) | (pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece);
	pNode.board[8*move_fromY+move_fromX] = this.constants.player.none | this.constants.piece.none;

	//-- Promotes the pawn immediately or not
	if ((move_toY === 0) || (move_toY === 7))
	{
		if ((pNode.board[8*move_toY+move_toX] & this.constants.bitmask.piece) == this.constants.piece.pawn)
		{
			//- Forced promotion
			if (this.options.variant.promoteQueen)
				move_promotion = this.constants.piece.queen;

			//- Effective promotion
			if (move_promotion != this.constants.piece.none)
				pNode.board[8*move_toY+move_toX] = (pNode.board[8*move_toY+move_toX] & ~this.constants.bitmask.piece) | move_promotion;
			else
				pNode._pendingPromotion = 8*move_toY+move_toX;
		}
	}

	//-- Result
	this._highlight.splice(0, this._highlight.length);
	return pMove;
};

/**
 * The method finds the best move.
 *
 * @method getMoveAI
 * @param {AntiCrux.constants.player} pPlayer (Optional) Player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} The internal representation of the move (to be used for the log for example), else *AntiCrux.constants.noMove* in case of error.
 */
AntiCrux.prototype.getMoveAI = function(pPlayer, pNode) {
	var	maxDepth, curDepth, limitDepth, bMove;

	//-- Checks
	if (pNode === undefined)
		pNode = this._root_node;
	if (pPlayer === undefined)
		pPlayer = this.getPlayer(pNode);
	if ((pPlayer != this.constants.player.black) && (pPlayer != this.constants.player.white))
		return this.constants.noMove;
	this._buffer = '';

	//-- Pre-conditions
	if (this.hasPendingPromotion(pNode))
		return this.constants.noMove;
	if (this.options.ai.maxReply < 1)
		this.options.ai.maxReply = 1;
	this._ai_nodeFreeMemory(pNode);				//Should be done by the calling program in any case
	this._ai_nodeShrink(pNode);
	pNode.magic = (pNode.magic & ~this.constants.bitmask.player) | pPlayer;
	maxDepth = this.options.ai.maxDepth;

	//-- End of game ?
	this._ai_nodeMoves(pNode);
	if (pNode.moves.length === 0)
		return this.constants.noMove;
	limitDepth = (this.options.board.noStatOnForcedMove && (pNode.moves.length === 1));

	//-- Oyster : you can't lose against this level
	if (this.options.ai.oyster)
	{
		this.resetStats();
		return pNode.moves[Math.round(Math.random() * (pNode.moves.length-1))];
	}

	//-- Builds the decision tree level by level
	for (curDepth=1 ; curDepth<=maxDepth ; curDepth++)
	{
		//- Explores to the temporary lowest level
		this._numNodes = 0;
		this.options.ai.maxDepth = curDepth;
		this._ai_nodeRecurseTree(pPlayer, 0, pNode);
		this._reachedDepth = curDepth;
		if (this._numNodes === 0)
			throw 'Internal error - Report any error (#001)';

		//- Callback
		if (this.callbackExploration !== null)
			this.callbackExploration(maxDepth, this._reachedDepth, this._numNodes);

		//- Reaches the next level if allowed
		if (	(curDepth >= (limitDepth ? 1 : maxDepth)) ||			//Max depth reached
				(	(this.options.ai.maxNodes !== 0) &&					//Max nodes reached
					(this._numNodes >= this.options.ai.maxNodes)
				)
		)
			break;
	}
	this.options.ai.maxDepth = maxDepth;								//Restores the initial setting

	//-- Valuates the decision tree entirely
	this._ai_gc();
	this._ai_nodeSolve(pPlayer, 0, pNode);
	bMove = this._ai_nodePick(pPlayer, pNode);
	pNode.magic = (pNode.magic & ~this.constants.bitmask.bestMove) | (bMove << this.constants.bitmask.bestMoveShift);
	return bMove;
};

/**
 * The method predicts the next few moves for the provided node.
 * It is assumed that the node has not been evaluated yet.
 *
 * @method predictMoves
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} String containing the next moves.
 */
AntiCrux.prototype.predictMoves = function(pNode) {
	var move, i, buffer;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (this.hasPendingPromotion(pNode))
		return 'Error : the position is waiting for a promotion.';

	//-- Duplicates the game
	this._ai_nodeFreeMemory(pNode);
	this._initHelper();
	this._helper.setLevel(20);
	this._helper.options.ai.maxDepth = 3;
	this._helper.options.ai.maxNodes = 0;
	if (!this._helper.loadFen(this.toFen(pNode)))
		return 'Error : the position cannot be loaded.';

	//-- End of game ?
	this._helper._ai_nodeMoves(this._helper._root_node);
	if (this._helper._root_node.moves.length === 0)
		return 'The game is over.';

	//-- Builds N levels of data
	buffer = '';
	for (i=0 ; i<5 ; i++)
	{
		//- Gets the move
		move = this._helper.getMoveAI();
		if (move === this._helper.constants.noMove)
		{
			this._helper.freeMemory();
			break;
		}
		if (buffer.length > 0)
			buffer += ' ';
		buffer += this._helper.moveToString(move);

		//- Next position
		this._helper.freeMemory();
		if (this._helper.movePiece(move, true) == this._helper.constants.noMove)
			throw 'Internal error - Report any error (#012)';
		else
			this._helper.switchPlayer();
	}

	//-- Result
	return 'The predicted moves are :' + "\n" + buffer + "\n" + "\n" + 'Score = ' + this._helper.getScore().valuePercent + '%';
};

/**
 * The method returns the expected deep sequence of moves.
 *
 * @method getAssistance
 * @param {Boolean} pSymbols Use Unicode symbols. The option is ignored if pUCI is equal to *true*.
 * @param {Boolean} pUCI UCI notation.
 * @return {String} String of the moves.
 */
AntiCrux.prototype.getAssistance = function(pSymbols, pUCI) {
	var pNode;

	//-- Checks the options
	if (!this.options.board.assistance)
		return '';

	//-- Self
	pNode = this._root_node;
	if ((pNode.magic & this.constants.bitmask.bestMove) == this.constants.bitmask.none)
		return '';

	//-- Initializes the basic position
	this._buffer = '';
	this._initHelper();
	this.options.board.symbols = pSymbols;
	if (!this._helper.loadFen(this.toFen()))
		return '';

	//-- Gets the calculated sequence of moves
	this._ai_nodeAssistance(pNode, pUCI, 1);
	return this._buffer;
};

/**
 * The method logs a move to the history log.
 *
 * @method logMove
 * @param {Integer} pMove A valid move fetched from *getMoveAI()* or *movePiece()*.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.logMove = function(pMove) {
	//-- Checks
	if ((pMove === undefined) || (pMove === 0))
		return false;

	//-- Logs the move
	if (typeof pMove !== 'number')
		return false;
	else
	{
		this._history.push(pMove);
		return true;
	}
};

/**
 * The method returns the current value of the halfmove clock.
 *
 * @method getHalfMoveClock
 * @return {Integer} The current value of the halfmove clock.
 */
AntiCrux.prototype.getHalfMoveClock = function() {
	return this._halfmoveclock;
};

/**
 * The method increments the halfmove clock which is not automated.
 * It often has to be called after *movePiece()*.
 *
 * @method updateHalfMoveClock
 */
AntiCrux.prototype.updateHalfMoveClock = function() {
	if (this._halfmoveclock_status == 1)
		this._halfmoveclock++;
	else
		if (this._halfmoveclock_status === 0)
			this._halfmoveclock = 0;
	this._halfmoveclock_status = -1;
};

/**
 * The method resets the internal statistics of the last exploration of the nodes.
 *
 * @method resetStats
 */
AntiCrux.prototype.resetStats = function() {
	this._numNodes = 0;
	this._reachedDepth = 0;
};

/**
 * The method reverts the last move and does the necessary internal updates (history, halfmove clock...).
 *
 * @method undoMove
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.undoMove = function() {
	var i, hist;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return false;

	//-- Prepares the board
	hist = this._history.slice(0);
	hist.pop();
	this.loadFen(this._history_fen0);

	//-- Builds the new board
	for (i=0 ; i<hist.length ; i++)
	{
		if (this.movePiece(hist[i], true, this.constants.player.none) == this.constants.noMove)
			throw 'Internal error - Report any error (#004)';
		else
		{
			this.updateHalfMoveClock();
			this.switchPlayer();
		}
	}
	this._history = hist;
	return true;
};

/**
 * The method returns the number of explored nodes.
 *
 * @method getNumNodes
 * @return {Integer} Number of explored nodes.
 */
AntiCrux.prototype.getNumNodes = function() {
	return (this.hasOwnProperty('_numNodes') ? this._numNodes : 0);
};

/**
 * The method returns the reached depth after the exploration of the nodes.
 *
 * @method getReachedDepth
 * @return {Integer} Reached depth.
 */
AntiCrux.prototype.getReachedDepth = function() {
	return (this.hasOwnProperty('_reachedDepth') ? this._reachedDepth : 0);
};

/**
 * The method returns the existence of a pending promotion.
 * While the promotion is not done, the game cannot continue.
 * Call the method *promote()* to correct this situation.
 *
 * @method hasPendingPromotion
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if a promotion is pending, else *false*.
 */
AntiCrux.prototype.hasPendingPromotion = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Result
	return pNode.hasOwnProperty('_pendingPromotion');
};

/**
 * The method promotes the last pawn with the provided piece.
 * The promotion is not needed if you provided the promotion in the last move (see *movePiece()*).
 *
 * @method promote
 * @param {String, AntiCrux.constants.piece} pPiece Identifier of the piece (letter or internal code).
 * @param {Object} pNode (Optional) Reference node.
 * @return {AntiCrux.constants.piece} Internal identifier of the promoted piece, else *AntiCrux.constants.piece.none* in case of error.
 */
AntiCrux.prototype.promote = function(pPiece, pNode) {
	var piece;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this.hasPendingPromotion(pNode))
		return this.constants.piece.none;

	//-- Transcodes
	if (typeof pPiece == 'string')
	{
		if (this.constants.piece.mapping.hasOwnProperty(pPiece))
			piece = this.constants.piece.mapping[pPiece];
		else
			return this.constants.piece.none;
	}

	//-- Promotes the piece
	if (this.options.variant.promoteQueen)
		piece = this.options.piece.queen;
	pNode.board[pNode._pendingPromotion] = (pNode.board[pNode._pendingPromotion] & ~this.constants.bitmask.piece) | piece;
	delete pNode._pendingPromotion;
	return piece;
};

/**
 * The method converts the provided piece into a human-readable output.
 *
 * @method getPieceSymbol
 * @param {AntiCrux.constants.piece} pPiece The piece.
 * @param {AntiCrux.constants.player} pPlayer The player.
 * @param {Boolean} pSymbols Use Unicode symbols.
 * @return {String} Symbol as a string.
 */
AntiCrux.prototype.getPieceSymbol = function(pPiece, pPlayer, pSymbols) {
	var output;
	if (!pSymbols)
		return (pPiece == this.constants.piece.pawn ? '' : this.constants.piece.mapping_rev[pPiece].toUpperCase());
	else
	{
		if (((pPlayer == this.constants.player.white) && !this.options.board.darkTheme) ||
			((pPlayer == this.constants.player.black) &&  this.options.board.darkTheme))
		{
			switch (pPiece)
			{
				case this.constants.piece.pawn   : output = '&#9817;'; break;
				case this.constants.piece.rook   : output = '&#9814;'; break;
				case this.constants.piece.knight : output = '&#9816;'; break;
				case this.constants.piece.bishop : output = '&#9815;'; break;
				case this.constants.piece.queen  : output = '&#9813;'; break;
				case this.constants.piece.king   : output = '&#9812;'; break;
				default                          : output = '';        break;
			}
		}
		else
		{
			switch (pPiece)
			{
				case this.constants.piece.pawn   : output = '&#9823;'; break;
				case this.constants.piece.rook   : output = '&#9820;'; break;
				case this.constants.piece.knight : output = '&#9822;'; break;
				case this.constants.piece.bishop : output = '&#9821;'; break;
				case this.constants.piece.queen  : output = '&#9819;'; break;
				case this.constants.piece.king   : output = '&#9818;'; break;
				default                          : output = '';        break;
			}
		}
		return (output.length===0 ? '' : '<span class="AntiCrux-big">'+output+'</span>');
	}
};

/**
 * The method formats the move with a modern syntax.
 * You call this function only before the move is done with *movePiece()*.
 *
 * @method moveToString
 * @param {Integer} pMove The move with an internal representation.
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} Move as a string.
 */
AntiCrux.prototype.moveToString = function(pMove, pNode) {
	var move, move_promo, move_fromY, move_fromX, move_toY, move_toX,
		buffer, taken, output;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if ((pMove === null) || (pMove == this.constants.noMove))
		return '';

	//-- Elements
	move = parseInt(pMove);
	move_promo = Math.floor(move/10000) % 10;
	move_fromY = Math.floor(move/1000 ) % 10;
	move_fromX = Math.floor(move/100  ) % 10;
	move_toY   = Math.floor(move/10   ) % 10;
	move_toX   =            move        % 10;

	//-- Piece
	output = this.getPieceSymbol(	(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece),
									(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player),
									this.options.board.symbols
								);

	//-- Taken piece
	taken = ((pNode.board[8*move_toY+move_toX] & this.constants.bitmask.player) != (pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player)) &&
			((pNode.board[8*move_toY+move_toX] & this.constants.bitmask.player) != this.constants.player.none);
	if (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant)
		taken = taken || (	((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn) &&
							(8*move_toY+move_toX == pNode.enpassant)
						);

	//-- Initial position
	if ((this._ai_nodeInventory(	(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player),
									(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece),
									undefined,
									pNode
								) > 1) ||
		(taken && ((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn))
	) {
		buffer = 'abcdefgh'.charAt(move_fromX);
		if (this._ai_nodeInventory(	(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player),
									(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece),
									move_fromX,
									pNode
								) > 1)
			buffer += 8-move_fromY;
	}
	else
		buffer = '';

	//-- Simplified notation
	if (!taken && ((pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece) == this.constants.piece.pawn) && (move_fromX == move_toX))
		buffer = '';
	if (!taken && (this._ai_nodeInventory(	(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player),
											(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.piece),
											undefined,
											pNode
										) == 1))
		buffer = '';
	if (taken)
	   buffer += 'x';
	output += buffer;

	//-- Final position
	output += 'abcdefgh'.charAt(move_toX);
	output += 8-move_toY;

	//-- Promotion
	if (move_promo != this.constants.piece.none)
		output += '=' + this.getPieceSymbol(	move_promo,
												(pNode.board[8*move_fromY+move_fromX] & this.constants.bitmask.player),
												this.options.board.symbols
											);

	//-- Result
	return output;
};

/**
 * The method formats the move according to the requirements of the UCI protocol.
 *
 * @method moveToUCI
 * @param {Integer} pMove The move in the internal representation.
 * @return {String} Move as a string.
 */
AntiCrux.prototype.moveToUCI = function(pMove) {
	if ((pMove === null) || (typeof pMove !== 'number') || (pMove == this.constants.noMove))
		return '0000';
	else
		return ( 'abcdefgh'[Math.floor(pMove/100) % 10] +
				 (8-Math.floor(pMove/1000) % 10) +
				 'abcdefgh'[pMove % 10] +
				 (8-Math.floor(pMove/10) % 10) +
				 '  rnbqk'[Math.floor(pMove/10000) % 10]
				).trim();
};

/**
 * The method returns the static and deep (when available) score of the current position.
 *
 * @method getScore
 * @param {Object} pNode (Optional) Reference node.
 * @return {Object} Object with multiple fields, or *null*.
 */
AntiCrux.prototype.getScore = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Determines the score
	return this._ai_nodeValuate(pNode);
};

/**
 * The method switches the current player.
 *
 * @method switchPlayer
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.switchPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Switches the players
	switch (pNode.magic & this.constants.bitmask.player)
	{
		case this.constants.player.none:
			return false;
		case this.constants.player.white:
			pNode.magic = (pNode.magic & ~this.constants.bitmask.player) | this.constants.player.black;
			break;
		case this.constants.player.black:
			pNode.magic = (pNode.magic & ~this.constants.bitmask.player) | this.constants.player.white;
			break;
	}
	return true;
};

/**
 * The method determines the winner.
 *
 * @method getWinner
 * @param {Object} pNode (Optional) Reference node.
 * @return {AntiCrux.constants.player} Internal identifier of the winner.
 */
AntiCrux.prototype.getWinner = function(pNode) {
	var node = this._ai_nodeCopy((pNode === undefined ? this._root_node : pNode), true);

	//-- Tests for White
	node.magic = (node.magic & ~this.constants.bitmask.player) | this.constants.player.white;
	this._ai_nodeMoves(node);
	if (!this._has(node, 'moves', true))
		return this.constants.player.white;

	//-- Tests for Black
	node.magic = (node.magic & ~this.constants.bitmask.player) | this.constants.player.black;
	this._ai_nodeMoves(node);
	if (!this._has(node, 'moves', true))
		return this.constants.player.black;

	//-- No winner
	return this.constants.player.none;
};

/**
 * The method determines if the game is a draw. The check is strict based on
 * the threefold repetition, the halfmove-clock and some known positions.
 *
 * @method isDraw
 * @param {Object} pCriteria If you don't specify it, the check is complete, else you provide an object with boolean values for the fields *halfmoveClock*, *threefoldRepetition* and *position* (a partial list is accepted).
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if the game ended in a tie, else *false*.
 */
AntiCrux.prototype.isDraw = function(pCriteria, pNode) {
	var	positions, pivot, fen, white, black,
		i, e;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Defines the parameters to check
	if (typeof pCriteria !== 'object')
		pCriteria = {
			halfmoveClock		: true,
			threefoldRepetition	: true,
			position			: true
		};
	if (!pCriteria.hasOwnProperty('halfmoveClock'))
		pCriteria.halfmoveClock = false;
	if (!pCriteria.hasOwnProperty('threefoldRepetition'))
		pCriteria.threefoldRepetition = false;
	if (!pCriteria.hasOwnProperty('position'))
		pCriteria.position = false;

	//-- Halfmove clock
	// https://en.wikipedia.org/wiki/Fifty-move_rule
	if (pCriteria.halfmoveClock && (this._halfmoveclock >= 50))
	{
		this._lastDrawReason = 'Halfmove clock';
		return true;
	}

	//-- Threefold repetition
	// https://en.wikipedia.org/wiki/Threefold_repetition
	if (pCriteria.threefoldRepetition)
	{
		this._initHelper();
		if (this._helper.loadFen(this._history_fen0))
		{
			//- Builds all the positions
			positions = [this._history_fen0.substring(0, this._history_fen0.indexOf(' '))];
			for (i=0 ; i<this._history.length ; i++)
			{
				if (this._helper.movePiece(this._history[i], true, this._helper.getPlayer()) == this._helper.constants.noMove)
					throw 'Internal error - Report any error (#017)';
				else
				{
					fen = this._helper.toFen();
					positions.push(fen.substring(0, fen.indexOf(' ')));
					this._helper.switchPlayer();
				}
			}

			//- Counts the positions
			pivot = {};
			positions.forEach(function(pElement) {
				pivot[pElement] = (pivot[pElement] || 0) + 1;
			});

			//- Finds a position which occurred 3 times
			for (e in pivot)
				if (pivot[e] >= 3)
				{
					this._lastDrawReason = 'Threefold repetition';
					return true;
				}
		}
	}

	//-- Draw by position
	if (pCriteria.position)
	{
		//- Bishop vs. Bishop on different colors
		if (	(this._ai_nodeCountPiece(this.constants.player.white) == 1) &&
				(this._ai_nodeCountPiece(this.constants.player.black) == 1)
		) {
			white = this._ai_nodeLocatePiece(this.constants.player.white, this.constants.piece.bishop);
			black = this._ai_nodeLocatePiece(this.constants.player.black, this.constants.piece.bishop);
			if ((white !== null) && (black !== null))
				if ((white.x+white.y)%2 !== (black.x+black.y)%2)
				{
					this._lastDrawReason = 'Position';
					return true;
				}
		}
	}

	//-- Default result
	this._lastDrawReason = '';
	return false;
};

/**
 * The method determines if the game is potentially a draw.
 * The check is based on the deep evaluation if it is relevant.
 *
 * @method isPossibleDraw
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if the game potentially ended in a tie, else *false*.
 */
AntiCrux.prototype.isPossibleDraw = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Too long history
	if (this._history.length >= 150)
		return true;

	//-- Possible draw based on the deep evaluation
	if (	!this.hasOwnProperty('_reachedDepth') ||
			((pNode.score & this.constants.bitmask.valuationType) == this.constants.bitmask.none)
	)
		return false;
	else
		return (	(this._reachedDepth >= 5) &&															//Sufficient depth for the valuation
					((pNode.score & this.constants.bitmask.valuationValue) === 0) &&						//Equal game on both side or no deep opportunity
					(this._ai_nodeInventory(this.constants.player.black, null, undefined, pNode) <= 5) &&	//Few remaining pieces
					(this._ai_nodeInventory(this.constants.player.white, null, undefined, pNode) <= 5)		//Few remaining pieces
				);
};

/**
 * When the draw is strict, you can get the reason with this method.
 *
 * @method getDrawReason
 * @return {String} Reason raised by the last call to *isDraw()*.
 */
AntiCrux.prototype.getDrawReason = function() {
	return this._lastDrawReason;
};

/**
 * The method indicates if the game is over. The check is done according to the number of available moves.
 *
 * @method isEndGame
 * @param {Boolean} pSwitchPlayer Will switch the player for the check.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Boolean} *true* if the game has ended, else *false*.
 */
AntiCrux.prototype.isEndGame = function(pSwitchPlayer, pNode) {
	var node = this._ai_nodeCopy((pNode===undefined ? this._root_node : pNode), false);
	if (pSwitchPlayer)
		this.switchPlayer(node);
	this._ai_nodeMoves(node);
	return !this._has(node, 'moves', true);
};

/**
 * The method highlights a cell on the board.
 *
 * @method highlight
 * @param {Boolean} pReset Reset the existing highlighted cells of the board.
 * @param {Array, String, Integer} pPosition The position is an array of internal positions, a coordinate or an internal identifier
 * @return {Boolean} *true* if successful, else *false*.
 */
AntiCrux.prototype.highlight = function(pReset, pPosition) {
	//-- Clears the highlighted cells
	if (pPosition === undefined)
		pPosition = null;
	if (pReset || (pPosition === null))
		this._highlight = [];

	//-- Applies the highlighted cells (no check of unicity)
	if (pPosition === null)
		; //Nothing
	else
		if (Array.isArray(pPosition))
			this._highlight = this._highlight.concat(pPosition);
		else
			if (typeof pPosition != 'string')
				this._highlight.push(parseInt(pPosition));
			else
				if (pPosition.length === 0)
					; //Nothing
				else
					if (pPosition.match(/^[a-h][1-8]$/))
						this._highlight.push((8-parseInt(pPosition.charAt(1)))*8 + 'abcdefgh'.indexOf(pPosition.charAt(0)));
					else
						if (pPosition.match(/^[0-7]{2}$/))
							this._highlight.push(parseInt(pPosition));
						else
							return false;
	return true;
};

/**
 * The method highlights a move corresponding to two cells.
 * The existing highlighted cells are reset.
 *
 * @method highlightMove
 * @param {Integer} pMove The move with an internal representation.
 */
AntiCrux.prototype.highlightMove = function(pMove) {
	var move_fromY, move_fromX, move_toY, move_toX;

	//-- No move resets the highlight
	if (pMove == this.constants.noMove)
		this._highlight = [];
	else
	{
		//-- Decodes the move
		move_fromY = Math.floor(pMove/1000) % 10;
		move_fromX = Math.floor(pMove/100 ) % 10;
		move_toY   = Math.floor(pMove/10  ) % 10;
		move_toX   =            pMove       % 10;

		//-- Highlight the move
		this._highlight = [8*move_fromY + move_fromX, 8*move_toY + move_toX];
	}
};

/**
 * The method highlights the reachable target cells of the board for the current player.
 *
 * @method highlightMoves
 * @param {Boolean} pRefresh Recalculate the moves (*true*) or use the existing ones of the main node (*false*).
 */
AntiCrux.prototype.highlightMoves = function(pRefresh) {
	var node, i, position;

	//-- Resets the current board
	this._highlight = [];

	//-- Gets the possible moves
	if (pRefresh)
	{
		node = this._ai_nodeCopy(this._root_node, false);
		this._ai_nodeMoves(node);
	}
	else
		node = this._root_node;

	//-- Shows the moves
	if (node.moves.length == 1)
		this.highlightMove(node.moves[0]);
	else
		for (i=0 ; i<node.moves.length ; i++)
		{
			position = node.moves[i] % 100;
			this._highlight.push(8*Math.floor(position/10) + (position%10));
		}
};

/**
 * The method returns the history of the moves in an array containing the moves in their internal representation.
 *
 * @method getHistory
 * @return {Array} All the past moves.
 */
AntiCrux.prototype.getHistory = function() {
	return (this.hasOwnProperty('_history') ? this._history : []);
};

/**
 * The method returns the history of the moves in HTML format.
 *
 * @method getHistoryHtml
 * @return {String} HTML content.
 */
AntiCrux.prototype.getHistoryHtml = function() {
	var i, output;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return '';

	//-- Initial position
	this._initHelper();
	if (!this._helper.loadFen(this._history_fen0))
		return '';

	//-- Builds the moves
	output = '<table class="ui-table AntiCrux-table" data-role="table">';
	for (i=0 ; i<this._history.length ; i++)
	{
		if (i % 2 === 0)
			output += '<tr><th>' + Math.floor((i+2)/2) + '</th>';
		output += '<td class="AntiCrux-history-item" data-index="'+i+'" title="Click to review this past move">' + this._helper.moveToString(this._history[i]) + '</td>';
		if (this._helper.movePiece(this._history[i], true, this._helper.constants.player.none) == this._helper.constants.noMove)
			throw 'Internal error - Report any error (#010)';
		if (i % 2 == 1)
			output += '</tr>';
	}
	if (i % 2 == 1)
		output += '</tr>';
	return output + '</table>';
};

/**
 * The method returns the possible moves and their valuation in HTML format.
 *
 * @method getMovesHtml
 * @param {AntiCrux.constants.player} pPlayer The player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} HTML content.
 */
AntiCrux.prototype.getMovesHtml = function(pPlayer, pNode) {
	var i, output, score;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, 'nodes', true) || !this._has(pNode, 'moves', true))
		return '';

	//-- Output
	output = '';
	for (i=0 ; i<pNode.moves.length ; i++)
	{
		output += '<tr><td>' + this.moveToString(pNode.moves[i], pNode) + '</td>';
		score = this._ai_nodeValuate(pNode.nodes[i]);
		if (score === null)
			throw 'Internal error - Report any error (#019)';

		//- Score
		output += '<td>';
		if (score.value == -this.constants.bitmask.valuationValue)
			output += '<img src="images/mate_'+this.constants.player.white+'.png" title="White wins" alt="-&#8734;" />';
		else if (score.value == this.constants.bitmask.valuationValue)
			output += '<img src="images/mate_'+this.constants.player.black+'.png" title="Black wins" alt="+&#8734;" />';
		else
			output += '<span title="'+(score.type==this.constants.bitmask.valuationStatic?'Static':'Deep')+'">' + score.valuePercent + '%</span>';
		output += '</td>';

		//- Opportunity
		output += '<td>';
		if (	((pNode.nodes[i].magic & this.constants.bitmask.opportunity) != this.constants.bitmask.none) &&
				(score.type == this.constants.bitmask.valuationDeep) &&
				(Math.abs(score.value) != this.constants.bitmask.valuationValue)
		) {
			switch (pNode.nodes[i].magic & this.constants.bitmask.opportunity)
			{
				case this.constants.bitmask.opportunityMinus:
					output += '<img src="images/opportunity_0.png" title="Risk of defeat" />';
					break;
				case (this.constants.bitmask.opportunityMinus | this.constants.bitmask.opportunityPlus):
					output += '<img src="images/opportunity_1.png" title="Uncertain end of game" />';
					break;
				case this.constants.bitmask.opportunityPlus:
					output += '<img src="images/opportunity_2.png" title="Opportunity of victory" />';
					break;
				default:
					throw 'Internal error - Report any error (#016)';
			}
		}
		else
			output += '&nbsp;';
		output += '</td></tr>';
	}

	//-- Final text
	return (output.length === 0 ? '' :
				'<table class="ui-table" data-role="table" data-mode="table">' +
				'<thead><tr><th data-priority="1">Move</th><th data-priority="2">Score</th><th data-priority="3">&nbsp;</th></tr></thead>' +
				'<tbody>' +
				output +
				'</tbody></table>');
};

/**
 * The method renders the board in HTML format.
 *
 * @method toHtml
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} HTML content.
 */
AntiCrux.prototype.toHtml = function(pNode) {
	var x, y, rotated, color, abc, player, output;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Builds the output
	rotated = this.options.board.rotated;		//Shortened syntax
	output = '';
	color = 1;
	abc = 'abcdefgh';
	for (y=(rotated?7:0) ; (!rotated&&(y<8)) || (rotated&&(y>=0)) ; (rotated?y--:y++))
	{
		color = 1 - color;
		output += '<div class="AntiCrux-board-line">';
		if (this.options.board.coordinates)
			output += '<div class="AntiCrux-board-coordinates-vertical">' + (8-y) + '</div>';
		for (x=(rotated?7:0) ; (!rotated&&(x<8)) || (rotated&&(x>=0)) ; (rotated?x--:x++))
		{
			color = 1 - color;
			switch (this.options.variant.pieces)
			{
				case 1:
					player = ((pNode.board[8*y+x] & this.constants.bitmask.player) != this.constants.player.none ? this.constants.player.white : (pNode.board[8*y+x] & this.constants.bitmask.player));
					break;
				case 2:
					player = ((pNode.board[8*y+x] & this.constants.bitmask.player) != this.constants.player.none ? this.constants.player.black : (pNode.board[8*y+x] & this.constants.bitmask.player));
					break;
				case 3:
					player = this.constants.player.none;
					break;
				case 4:
					if ((pNode.board[8*y+x] & this.constants.bitmask.player) == this.constants.player.none)
						player = this.constants.player.none;
					else
					{
						if (Math.floor(100*Math.random()) % 2 === 0)
							player = this.constants.player.black;
						else
							player = this.constants.player.white;
					}
					break;
				default:
					player = (pNode.board[8*y+x] & this.constants.bitmask.player);
					break;
			}
			output += '<div class="AntiCrux-board-cell-' + (this._highlight.indexOf(8*y+x) != -1 ? 'hl' : color) + ' AntiCrux-board-piece-' + player + (pNode.board[8*y+x] & this.constants.bitmask.piece) + '" data-xy="' + abc[x] + (8-y) + '">';
			if (this.options.board.debugCellId)
				output += y + '/' + x + '<br/>' + (8*y+x);
			output += '</div>';
		}
		output += '</div>';
	}

	//-- Coordinates
	if (this.options.board.coordinates)
	{
		abc = abc.toUpperCase();
		output += '<div class="AntiCrux-board-line">';
		output += '<div class="AntiCrux-board-coordinates-corner"></div>';
		for (x=0 ; x<abc.length ; x++)
			output += '<div class="AntiCrux-board-coordinates-horizontal">' + abc[rotated?7-x:x] + '</div>';
		output += '</div>';
	}

	//-- Result
	return '<div class="AntiCrux-board">' + output + '</div>';
};

/**
 * The method renders the board in FEN format.
 *
 * @method toFen
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} FEN string.
 */
AntiCrux.prototype.toFen = function(pNode) {
	// https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
	// https://www.chessclub.com/user/help/PGN-spec

	var i, output, empty, piece;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (!this._has(pNode, 'board', true))
		return '';

	//-- Builds the FEN code for the main board
	output = '';
	empty = 0;
	for (i=0 ; i<64 ; i++)
	{
		//Piece
		if ((pNode.board[i] & this.constants.bitmask.player) == this.constants.player.none)
			empty++;
		else
		{
			if (empty > 0)
			{
				output += empty;
				empty = 0;
			}

			//Identifies a piece
			piece = this.constants.piece.mapping_rev[pNode.board[i] & this.constants.bitmask.piece];
			if ((pNode.board[i] & this.constants.bitmask.player) == this.constants.player.black)
				piece = piece.toLowerCase();
			output += piece;
		}

		//Separator
		if ((i+1) % 8 === 0)
		{
			if (empty > 0)
			{
				output += empty;
				empty = 0;
			}
			if (i < 63)
				output += '/';
		}
	}

	//-- Player
	if ((pNode.magic & this.constants.bitmask.player) == this.constants.player.black)
		output += ' b';
	else
		output += ' w';

	//-- Castling doesn't exist for AntiChess
	output += ' -';

	//-- En passant
	if (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant)
		output += ' ' + ('abcdefgh'[pNode.enpassant%8]) + ((pNode.magic & this.constants.bitmask.player) == this.constants.player.black ? '3' : '6');
	else
		output += ' -';

	//-- Halfmove clock: count of ply since the last pawn advance or capturing move
	output += ' ' + this._halfmoveclock;

	//-- Fullmove number
	if (!this._has(this, '_history', true))
		output += ' 0';
	else
		output += ' ' + Math.ceil(this._history.length/2);

	//-- Result
	return output;
};

/**
 * The method renders the board in plain text. You need a chess font to see the result
 * and some of them may be <a href="http://www.enpassant.dk/chess/fonteng.htm">found here</a>.
 *
 * @method toText
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} FEN string.
 */
AntiCrux.prototype.toText = function(pNode) {
	var x, y, rotated, i, b, car, buffer, player;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Builds the board
	rotated = this.options.board.rotated;		//Shortened syntax
	buffer = '';
	for (y=(rotated?7:0) ; (!rotated&&(y<8)) || (rotated&&(y>=0)) ; (rotated?y--:y++))
		for (x=(rotated?7:0) ; (!rotated&&(x<8)) || (rotated&&(x>=0)) ; (rotated?x--:x++))
		{
			i = 8*y+x;
			b = ((x+y)%2 == 1);

			//- Left margin
			if (x === (rotated?7:0))
			{
				if (this.options.board.coordinates)
					buffer += 'àáâãäåæç'[7-y];
				else
					buffer += '$';
			}

			//- Player
			switch (this.options.variant.pieces)
			{
				case 1:
					player = ((pNode.board[i] & this.constants.bitmask.player) != this.constants.player.none ? this.constants.player.white : (pNode.board[i] & this.constants.bitmask.player));
					break;
				case 2:
					player = ((pNode.board[i] & this.constants.bitmask.player) != this.constants.player.none ? this.constants.player.black : (pNode.board[i] & this.constants.bitmask.player));
					break;
				case 3:
					player = this.constants.player.none;
					break;
				case 4:
					if ((pNode.board[i] & this.constants.bitmask.player) == this.constants.player.none)
						player = this.constants.player.none;
					else
					{
						if (Math.floor(100*Math.random()) % 2 === 0)
							player = this.constants.player.black;
						else
							player = this.constants.player.white;
					}
					break;
				default:
					player = (pNode.board[i] & this.constants.bitmask.player);
					break;
			}

			//- Nature of the position
			switch (player)
			{
				case this.constants.player.none:
					car = (b ? '+' : '*');
					break;
				case this.constants.player.white:
					car = ' prnbqk'[pNode.board[i] & this.constants.bitmask.piece];
					break;
				case this.constants.player.black:
					car = ' otmvwl'[pNode.board[i] & this.constants.bitmask.piece];
					break;
				default:
					throw 'Internal error - Report any error (#009)';
			}
			if (b)
				car = car.toUpperCase();
			buffer += car;

			//- Right margin
			if (x === (rotated?0:7))
				buffer += '%' + "\n";
		}

	//-- Result
	return	'A""""""""S' + "\n" +
			buffer +
			(this.options.board.coordinates ? (rotated?'DïîíìëêéèF':'DèéêëìíîïF') : 'D((((((((F');
};

/**
 * The method exports the game to PGN.
 * The specification is <a href="https://www.chessclub.com/user/help/PGN-spec">available online</a>.
 *
 * @method toPgn
 * @param {Object} pHeader (Optional) The object is composed of keys and values related to the PGN specification.
 * @return {String} PGN content.
 */
AntiCrux.prototype.toPgn = function(pHeader) {
	var	lf_setheader, pgnHead, pgnItem,
		i, e, turn, moveStr, symbols;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return '';

	//-- Prepares the header with the ordered seven tag roster (STR)
	if (typeof pHeader !== 'object')
		pHeader = {};
	lf_setheader = function (pKey, pValue) {
		if (!pHeader.hasOwnProperty(pKey) || (pHeader[pKey] === ''))
			pHeader[pKey] = pValue;
	};
	lf_setheader('Event',  'Game');
	lf_setheader('Site',   'https://github.com/ecrucru/anticrux/');
	lf_setheader('Date',   (new Date().toISOString().slice(0, 10)));
	lf_setheader('Round',  '?');
	lf_setheader('White',  '');
	lf_setheader('Black',  '');
	lf_setheader('Result', '*');

	//-- Fills the fields
	if (this.options.board.rotated)
	{
		lf_setheader('White', 'AntiCrux ' + this.options.ai.version + (this._lastLevel===null?'':' - Level '+this._lastLevel));
		if (this.options.ai.elo > 0)
			lf_setheader('WhiteElo', this.options.ai.elo);
		lf_setheader('Black', 'You');
		lf_setheader('BlackElo', '-');
	}
	else
	{
		lf_setheader('White', 'You');
		lf_setheader('WhiteElo', '-');
		lf_setheader('Black', 'AntiCrux ' + this.options.ai.version + (this._lastLevel===null?'':' - Level '+this._lastLevel));
		if (this.options.ai.elo > 0)
			lf_setheader('BlackElo', this.options.ai.elo);
	}
	if (this.hasSetUp())
	{
		lf_setheader('SetUp', '1');
		lf_setheader('FEN', this._history_fen0);
	}
	lf_setheader('PlyCount', this._history.length);
	lf_setheader('Variant', 'suicide');
	lf_setheader('TimeControl', '-');

	//-- Deactivates the symbols
	symbols = this.options.board.symbols;
	this.options.board.symbols = false;

	//-- Loads the initial position
	this._initHelper();
	if (!this._helper.loadFen(this._history_fen0))
		return '';

	//-- Moves the pieces
	pgnItem = '';
	turn = 0;
	for (i=0 ; i<this._history.length ; i++)
	{
		//- Next turn
		if (i % 2 === 0)
			pgnItem += (turn>0 ? ' ' : '') + (++turn) + '.';

		//- Move
		moveStr = this._helper.moveToString(this._history[i]);
		if (this._helper.movePiece(this._history[i], true, this._helper.getPlayer()) == this._helper.constants.noMove)
			throw 'Internal error - Report any error (#011)';
		else
		{
			pgnItem += ' ' + moveStr;
			this._helper.updateHalfMoveClock();
			this._helper.logMove(this._history[i]);
			this._helper.switchPlayer();
		}
	}

	//-- Restores the symbols
	this.options.board.symbols = symbols;

	//-- Marks the termination of the game
	if (pHeader.Result != '*')
		pgnItem += '# ' + pHeader.Result;
	else
		switch (this._helper.getWinner())
		{
			case this._helper.constants.player.white:
				pgnItem += '# 1-0';
				pHeader.Result = '1-0';
				break;
			case this._helper.constants.player.black:
				pgnItem += '# 0-1';
				pHeader.Result = '0-1';
				break;
			case this._helper.constants.player.none:
				if (this._helper.isDraw())
				{
					pgnItem += '# 1/2-1/2';
					pHeader.Result = '1/2-1/2';
				}
				break;
		}
	lf_setheader('Termination', (pHeader.Result != '*' ? 'normal' : 'unterminated'));

	//-- Builds the header
	pgnHead = '';
	for (e in pHeader)
	{
		if (typeof pHeader[e] === 'string')
			pgnHead += '['+e+' "'+pHeader[e].split('\\').join("\\\\").split('"').join('\\"')+'"]' + "\n";
		else
			pgnHead += '['+e+' "'+pHeader[e]+'"]' + "\n";
	}
	pgnHead += "\n";

	//-- Result
	return pgnHead + pgnItem;
};

/**
 * The method renders the board in plain text for the console.
 *
 * @method toConsole
 * @param {Boolean} pBorder Include the border.
 * @param {Object} pNode (Optional) Reference node.
 * @return {String} Readable text.
 */
AntiCrux.prototype.toConsole = function(pBorder, pNode) {
	var x, y, rotated, i, car, buffer;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Builds the board
	rotated = this.options.board.rotated;		//Shortened syntax
	buffer = '';
	for (y=(rotated?7:0) ; (!rotated&&(y<8)) || (rotated&&(y>=0)) ; (rotated?y--:y++))
	{
		for (x=(rotated?7:0) ; (!rotated&&(x<8)) || (rotated&&(x>=0)) ; (rotated?x--:x++))
		{
			i = 8*y+x;

			//- Left margin
			if (pBorder && (x === (rotated?7:0)))
				buffer += (this.options.board.coordinates ? ' ' + '12345678'[7-y]+' |' : '|');

			//- Nature of the position
			car = this.constants.piece.mapping_rev[pNode.board[i] & this.constants.bitmask.piece];
			switch (pNode.board[i] & this.constants.bitmask.player)
			{
				case this.constants.player.white:
					car = car.toUpperCase();
					break;
				case this.constants.player.black:
					car = car.toLowerCase();
					break;
				case this.constants.player.none:
					if (!pBorder && ((pNode.board[i] & this.constants.bitmask.piece) == this.constants.player.none))
						car = '.';
					else
						car = ' ';	//To mark the black cells, replace by:		((x+y)%2 == 1 ? '.' : ' ');
					break;
			}
			buffer += ' ' + car + (pBorder ? ' |' : '');

			//- Right margin
			if (x === (rotated?0:7))
				buffer += "\n";
		}
		if (pBorder)
			buffer += (this.options.board.coordinates ? '   ' : '') + '+---+---+---+---+---+---+---+---+';
		if (y!=(rotated?0:7))
			buffer += "\n";
	}

	//-- Top border
	if (pBorder)
		buffer =	(this.options.board.coordinates ? '   ' : '') +
					'+---+---+---+---+---+---+---+---+' + "\n" +
					buffer;

	//-- Bottom border
	if (pBorder)
	{
		buffer += "\n";
		if (this.options.board.coordinates)
			buffer +=	(this.options.board.coordinates ? '    ' : '') +
						(rotated ?	' H   G   F   E   D   C   B   A  ' :
									' A   B   C   D   E   F   G   H  ' ) + "\n";
	}

	//-- Result
	return buffer;
};

/**
 * The method removes all the known links between the objects to "help" the clearing
 * of the memory by the garbage collector when it can be called directly.
 *
 * @method freeMemory
 * @return {Integer} Number of processed nodes.
 */
AntiCrux.prototype.freeMemory = function() {
	var count;
	this._buffer = '';
	count = this._ai_nodeFreeMemory(this._root_node);
	this._ai_gc();
	return count;
};


//---- Events

/**
 * The callback is invoked during the exploration of the nodes.
 *
 * @method callbackExploration
 * @param {Integer} pMaxDepth Maximal reachable depth.
 * @param {Integer} pDepth Current depth.
 * @param {Integer} pNodes Count of processed nodes.
 */
AntiCrux.prototype.callbackExploration = null;


//---- Private members

/**
 * The method, implicitly called by the constructor, initializes the internal data.
 *
 * @private
 * @method _init
 */
AntiCrux.prototype._init = function() {
	//-- Constants
	this.constants = {
		//- Simple constants
		classicalFischer		: 519,
		noMove					: 0,
		infinite				: 4294967295,		//11111111111111111111111111111111b
		piece : {
			none				: 0,				//Must be zero
			pawn				: 1,
			rook				: 2,
			knight				: 3,
			bishop				: 4,
			queen				: 5,
			king				: 6					//Must be the highest ID
		},
		//- Complex constants
		player : {
			none				: 8,				//                           01000b
			black				: 16,				//                           10000b
			white				: 24				//                           11000b
		},
		//- Masks
		bitmask : {
			none				: 0,				//00000000000000000000000000000000b
			//magic
			bestMove			: 1073733632,		//  111111111111111110000000000000b
			bestMoveShift		: 13,				//                   <<<<<<<<<<<<<
			forced				: 4096,				//                   1000000000000b
			opportunity			: 3072,				//                    110000000000b
			opportunityPlus		: 2048,				//                    100000000000b
			opportunityMinus	: 1024,				//                    010000000000b
			sequence			: 992,				//                      1111100000b
			sequenceShift		: 5,				//                           <<<<<
			//board
			player				: 24,				//                           11000b
			piece				: 7,				//                             111b
			//score
			valuationValue		: 131071,			//               11111111111111111b
			valuationSign		: 131072,			//              100000000000000000b
			valuationType		: 786432,			//            11000000000000000000b
			valuationStatic		: 262144,			//            01000000000000000000b
			valuationDeep		: 786432			//            11000000000000000000b
		}
	};
	this.constants.piece.mapping = {
		''  : this.constants.piece.none,
		'p' : this.constants.piece.pawn,
		'P' : this.constants.piece.pawn,
		'r' : this.constants.piece.rook,
		'R' : this.constants.piece.rook,
		'n' : this.constants.piece.knight,
		'N' : this.constants.piece.knight,
		'b' : this.constants.piece.bishop,
		'B' : this.constants.piece.bishop,
		'q' : this.constants.piece.queen,
		'Q' : this.constants.piece.queen,
		'k' : this.constants.piece.king,
		'K' : this.constants.piece.king
	};
	this.constants.piece.mapping_rev = [];
	this.constants.piece.mapping_rev[this.constants.piece.none]		= '';
	this.constants.piece.mapping_rev[this.constants.piece.pawn]		= 'P';
	this.constants.piece.mapping_rev[this.constants.piece.rook]		= 'R';
	this.constants.piece.mapping_rev[this.constants.piece.knight]	= 'N';
	this.constants.piece.mapping_rev[this.constants.piece.bishop]	= 'B';
	this.constants.piece.mapping_rev[this.constants.piece.queen]	= 'Q';
	this.constants.piece.mapping_rev[this.constants.piece.king]		= 'K';
	this.constants.player.mapping_rev = [];
	this.constants.player.mapping_rev[this.constants.player.black]	= -1;
	this.constants.player.mapping_rev[this.constants.player.none]	= 0;
	this.constants.player.mapping_rev[this.constants.player.white]	= 1;
	this.constants.bitmask.opportunityPriority = [];
	this.constants.bitmask.opportunityPriority[this.constants.bitmask.opportunityMinus] = 0;
	this.constants.bitmask.opportunityPriority[this.constants.bitmask.none] = 1;
	this.constants.bitmask.opportunityPriority[this.constants.bitmask.opportunityPlus|this.constants.bitmask.opportunityMinus] = 2;
	this.constants.bitmask.opportunityPriority[this.constants.bitmask.opportunityPlus] = 3;

	//-- Options
	this.options = {
		ai : {
			version : '0.3.0',							//Version of AntiCrux
			elo : 0,									//Approximative strength of the algorithm
			valuation : [],								//Valuation of each piece
			maxDepth : 0,								//Maximal depth for the search dependant on the simplification of the tree
			maxNodes : 0,								//Maximal number of nodes before the game exhausts your memory (0=Dangerously infinite)
			minimizeLiberty : false,					//TRUE allows a deeper inspection by forcing the moves, FALSE does a complete evaluation
			maxReply : 0,								//Number >=1 corresponding to the maximal number of moves that a player is allowed in return when minimizeLiberty is enabled
			randomizedSearch : false,					//TRUE helps the game to not played the same pieces
			pessimisticScenario : false,				//TRUE makes the algorithm stronger, FALSE is more random
			opportunistic : false,						//TRUE helps to find a winning position
			handicap : 0,								//To weaken the algorithm, remove between 0% and 100% of the moves above a fixed number of moves
			acceleratedEndGame : false,					//TRUE makes more direct kills but doesn't change the output
			oyster : false								//TRUE is a full random play
		},
		variant : {
			enPassant : true,							//TRUE activates the move "en passant" (some AI doesn't manage IT)
			promoteQueen : false,						//TRUE only promotes pawns as queen
			pieces : 0									//Variant for the pieces: 0=normal, 1=white pieces, 2=black pieces, 3=blind, 4=random
		},
		board : {
			fischer : this.getNewFischerId(),			//Default layout (519=classical)
			assistance : false,							//TRUE suggests the upcoming moves based on a unique analysis from the root node. The deeper, the less accurate
			assistanceDepth : 5,						//Depth for the analysis of the possible moves by the assistant
			darkTheme : false,							//A dark theme may be rendered in reverse video, so it impacts the real colors of the displayed pieces in Unicode
			rotated : false,							//TRUE rotates the board at 180°
			symbols : false,							//Symbols in Unicode for the display
			coordinates : true,							//TRUE displays the coordinates around the board
			noStatOnForcedMove : true,					//TRUE plays faster but the player won't be able to check the situation
			noStatOnOwnMove : true,						//TRUE plays faster but the player won't be able to know if he played the right wove
			debugCellId : false							//TRUE display the internal identifier of every cell of the board when there is no piece on it
		}
	};
	this.setLevel(9);									//Default level to initialize "this.options.ai"

	//-- Valuations (maximal value = 2047)
	//Documentation : http://www.ke.tu-darmstadt.de/publications/papers/ICGA-ChessVariants.pdf
	this.options.ai.valuation[this.constants.piece.none  ] =   0;
	this.options.ai.valuation[this.constants.piece.pawn  ] = 240;
	this.options.ai.valuation[this.constants.piece.rook  ] = 500;
	this.options.ai.valuation[this.constants.piece.knight] = 320;
	this.options.ai.valuation[this.constants.piece.bishop] = 440;
	this.options.ai.valuation[this.constants.piece.queen ] = 480;
	this.options.ai.valuation[this.constants.piece.king  ] = 300;

	//-- General variables
	this._helper = null;								//You can't refer to that variable without calling first _initHelper()
	this._buffer_fischer = [];							//You can't refer to that variable without calling first _initFischer()
};

/**
 * The method does a detailed check of the attribute of an object in terms of existence, type and content.
 *
 * @private
 * @method _has
 * @param {Object} pObject The object must be valid. An array is not an object.
 * @param {String} pField Name of the attribute. If object[attribute] is null, the method will return *false*.
 * @param {Undefined, String, Boolean} pLengthCheckOrString The type defines the check to be done :
 * - Undefined : it checks whether the attribute is equal to *true*.
 * - String : it checks whether the attribute is equal to the provided value.
 * - Boolean : if *true*, it checks if the attribute assumed to be an array has a content whatever its nature.
 * @return {Boolean} Result of the check.
 */
AntiCrux.prototype._has = function(pObject, pField, pLengthCheckOrString) {
	var b = ((pObject !== undefined) && (pObject !== null));
	if (b)
	{
		b = pObject.hasOwnProperty(pField);
		if (b && (pObject[pField] === null))
			return false;
		if (pLengthCheckOrString === undefined)
		{
			if (b)
				b = (pObject[pField] === true);
		}
		else if (typeof pLengthCheckOrString === 'string')
		{
			if (b)
				b = (pObject[pField] == pLengthCheckOrString);
		}
		else
			if (b && pLengthCheckOrString)
				b = (pObject[pField].length > 0);
	}
	return b;
};

/**
 * The method initializes on demand some internal objects.
 *
 * @private
 * @method _initHelper
 */
AntiCrux.prototype._initHelper = function() {
	if (this._helper === null)
		this._helper = new AntiCrux();
	this._helper.copyOptions(this);
	this._helper.options.board.darkTheme = this.options.board.darkTheme;
};

/**
 * The method initializes the 960 start positions of AntiChess960. This operation is
 * time consuming, that's why it is put apart and called internally on demand.
 *
 * @private
 * @method _initFischer
 */
AntiCrux.prototype._initFischer = function() {
	var id, fen;

	//-- Checks
	if (this._buffer_fischer.length > 0)
		return;

	//-- Fischer's positions
	this._initHelper();
	for (id=1 ; id<=960 ; id++)
	{
		this._helper.defaultBoard(id);
		fen = this._helper.toFen();
		this._buffer_fischer.push(fen.substring(0, fen.indexOf(' ')));
	}
};

/**
 * The method duplicates a node. Only the basic fields are copied.
 *
 * @private
 * @method _ai_nodeCopy
 * @param {Object} pNode Node to copy.
 * @param {Boolean} pFull Copy all the necessary nodes.
 * @return {Object} New copied node.
 */
AntiCrux.prototype._ai_nodeCopy = function(pNode, pFull) {
	//-- Clones the node
	var	newNode = {
		board : pNode.board.slice(0),
		magic : this.constants.bitmask.none | (pNode.magic & this.constants.bitmask.player)
	};
	if (pNode.hasOwnProperty('enpassant'))
		newNode.enpassant = pNode.enpassant;

	//-- Extends the copy
	if (pFull)
	{
		newNode.score = pNode.score;
		if (pNode.hasOwnProperty('moves'))
			newNode.moves = pNode.moves.slice(0);
		if (pNode.hasOwnProperty('_pendingPromotion'))
			newNode._pendingPromotion = pNode._pendingPromotion;
	}

	//-- Result
	return newNode;
};

/**
 * The method removes the unwanted fields within an existing node.
 *
 * @private
 * @method _ai_nodeShrink
 * @param {Object} pNode Node to shrink.
 */
AntiCrux.prototype._ai_nodeShrink = function(pNode) {
	var f;
	for (f in pNode)
		if (['board', 'magic', 'score', 'enpassant', '_pendingPromotion'].indexOf(f) === -1)
			delete pNode[f];
};

/**
 * The method counts the pieces corresponding to some criteria.
 *
 * @private
 * @method _ai_nodeInventory
 * @param {AntiCrux.constants.player} pPlayer Player or null if not relevant.
 * @param {AntiCrux.constants.piece} pPiece Piece or null if not relevant.
 * @param {Integer} pColumn (Optional) Column to check between 0 and 7.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} Number of pieces.
 */
AntiCrux.prototype._ai_nodeInventory = function(pPlayer, pPiece, pColumn, pNode) {
	var i, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Counts
	counter = 0;
	for (i=0 ; i<64 ; i++)
		if (	(((pNode.board[i] & this.constants.bitmask.player) == pPlayer) || (pPlayer === null)) &&
				(((pNode.board[i] & this.constants.bitmask.piece ) == pPiece ) || (pPiece  === null))
		) {
			if (pColumn !== undefined)
				if (i%8 != pColumn)
					continue;
			counter++;
		}
	return counter;
};

/**
 * The method counts the pieces of a player.
 *
 * @private
 * @method _ai_nodeCountPiece
 * @param {AntiCrux.constants.player} pPlayer Player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} Number of pieces.
 */
AntiCrux.prototype._ai_nodeCountPiece = function(pPlayer, pNode) {
	var i, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Counts
	counter = 0;
	for (i=0 ; i<64 ; i++)
		counter += ((pNode.board[i] & this.constants.bitmask.player) == pPlayer ? 1 : 0);
	return counter;
};

/**
 * The method finds the first occurrence of a piece given by its player and/or identifier.
 *
 * @private
 * @method _ai_nodeLocatePiece
 * @param {AntiCrux.constants.player} pPlayer Player or null if not relevant.
 * @param {AntiCrux.constants.piece} pPiece Piece or null if not relevant.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Object} Coordinates {x=0..7, y=0..7} of the located piece, or *null* if nothing has been found.
 */
AntiCrux.prototype._ai_nodeLocatePiece = function(pPlayer, pPiece, pNode) {
	var x, y;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Locates the piece
	for (y=0 ; y<8 ; y++)
		for (x=0 ; x<8 ; x++)
			if (	(((pNode.board[8*y+x] & this.constants.bitmask.player) == pPlayer) || (pPlayer === null)) &&
					(((pNode.board[8*y+x] & this.constants.bitmask.piece) == pPiece ) || (pPiece  === null))
			)
				return {x:x, y:y};
	return null;
};

/**
 * The method determines the possible moves and stores them in the provided node.
 *
 * @private
 * @method _ai_nodeMoves
 * @param {Object} pNode Reference node.
 */
AntiCrux.prototype._ai_nodeMoves = function(pNode) {
	var	that, save_move,
		board, moves, forced, move_base, move_promo,
		i, ip, x, xp, xpp, y, yp, ypp, o, d, t, ep, epv;

	//-- Checks
	if ((pNode === undefined) || (pNode === null))
		return;
	that = this;

	//-- Board of the opponents
	board = [	0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0
			];
	for (i=0 ; i<64 ; i++)
	{
		o = (pNode.board[i] & this.constants.bitmask.player);
		if (o == this.constants.player.none)
			board[i] = 1;
		else
			if (o == (pNode.magic & this.constants.bitmask.player))
				board[i] = 2;
			else
				if ((o != (pNode.magic & this.constants.bitmask.player)) && (o != this.constants.player.none))
					board[i] = 4;
	}
	ep = (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant);
	epv = (ep ? board[pNode.enpassant] : null);

	//-- Macro
	save_move = function(pX, pY, pI, pPawn) {
		var take = (board[pI] == 4);
		if (take && !forced)
		{
			moves.splice(0, moves.length);
			forced = true;
		}
		if (!forced || (/* (same effect) forced &&*/ take))
		{
			if (pPawn && ((pY===0) || (pY==7)))
			{
				move_promo = move_base + 10*pY + pX;
				moves.push(move_promo + 10000*that.constants.piece.queen);
				if (!that.options.variant.promoteQueen)
				{
					moves.push(move_promo + 10000*that.constants.piece.rook);
					moves.push(move_promo + 10000*that.constants.piece.knight);
					moves.push(move_promo + 10000*that.constants.piece.bishop);
					moves.push(move_promo + 10000*that.constants.piece.king);
				}
			}
			else
				moves.push(move_base + pY*10 + pX);
		}
		return take;
	};

	//-- Scans every position
	moves = [];
	forced = false;
	for (i=0 ; i<64 ; i++)
	{
		//- Checks if the cell is relevant
		if (board[i] != 2)
			continue;

		//- Conversion
		x = i % 8;
		y = Math.floor(i / 8);
		move_base = y*1000 + x*100;

		//- Processing of the piece
		switch (pNode.board[i] & this.constants.bitmask.piece)
		{
			case this.constants.piece.pawn:
			{
				if (ep)											//En passant is only relevant for the pawns
					board[pNode.enpassant] = 4;
				if ((pNode.magic & this.constants.bitmask.player) == this.constants.player.white)
				{
					// Move
					if ((y > 0) && (board[i-8] == 1))
					{
						save_move(x, y-1, i-8, true);
						if ((y == 6) && (board[i-16] == 1))
							save_move(x, y-2, i-16, true);
					}
					// Take the opponent
					if ((x > 0) && (board[i-9] == 4))
						save_move(x-1, y-1, i-9, true);
					if ((x < 7) && (board[i-7] == 4))
						save_move(x+1, y-1, i-7, true);
				}
				else
				{
					// Move
					if ((y < 7) && (board[i+8] == 1))
					{
						save_move(x, y+1, i+8, true);
						if ((y == 1) && (board[i+16] == 1))
							save_move(x, y+2, i+16, true);
					}
					// Take the opponent
					if ((x > 0) && (board[i+7] == 4))
						save_move(x-1, y+1, i+7, true);
					if ((x < 7) && (board[i+9] == 4))
						save_move(x+1, y+1, i+9, true);
				}
				if (ep)
					board[pNode.enpassant] = epv;
				break;
			}

			case this.constants.piece.queen:
			case this.constants.piece.rook:
			{
				if (x > 0) //West
				{
					ip = i;
					for (xp=x-1 ; xp>=0 ; xp--)
					{
						ip--;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, y, ip, false))
								break;
					}
				}
				if (x < 7) //East
				{
					ip = i;
					for (xp=x+1 ; xp<=7 ; xp++)
					{
						ip++;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, y, ip, false))
								break;
					}
				}
				if (y > 0) //North
				{
					ip = i;
					for (yp=y-1 ; yp>=0 ; yp--)
					{
						ip -= 8;
						if (board[ip] == 2)
							break;
						else
							if (save_move(x, yp, ip, false))
								break;
					}
				}
				if (y < 7) //South
				{
					ip = i;
					for (yp=y+1 ; yp<=7 ; yp++)
					{
						ip += 8;
						if (board[ip] == 2)
							break;
						else
							if (save_move(x, yp, ip, false))
								break;
					}
				}
				if ((pNode.board[i] & this.constants.bitmask.piece) == this.constants.piece.rook)		// Queen = Rook + Bishop
					break;
				//else no break, yes !
			}

			case this.constants.piece.bishop:
			{
				//North-West
				d = Math.min(x, y);
				if (d > 0)
				{
					ip = i;
					xp = x;
					yp = y;
					for ( ; d>0 ; d--)
					{
						ip -= 9;
						xp--;
						yp--;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, yp, ip, false))
								break;
					}
				}
				//North-East
				d = Math.min(7-x, y);
				if (d > 0)
				{
					ip = i;
					xp = x;
					yp = y;
					for ( ; d>0 ; d--)
					{
						ip -= 7;
						xp++;
						yp--;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, yp, ip, false))
								break;
					}
				}
				//South-West
				d = Math.min(x, 7-y);
				if (d > 0)
				{
					ip = i;
					xp = x;
					yp = y;
					for ( ; d>0 ; d--)
					{
						ip += 7;
						xp--;
						yp++;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, yp, ip, false))
								break;
					}
				}
				//South-East
				d = Math.min(7-x, 7-y);
				if (d > 0)
				{
					ip = i;
					xp = x;
					yp = y;
					for ( ; d>0 ; d--)
					{
						ip += 9;
						xp++;
						yp++;
						if (board[ip] == 2)
							break;
						else
							if (save_move(xp, yp, ip, false))
								break;
					}
				}
				break;
			}

			case this.constants.piece.knight:
			{
				if (y >= 2)
				{
					if ((x >= 1) && (board[i-17] != 2))
						save_move(x-1, y-2, i-17, false);
					if ((x <= 6) && (board[i-15] != 2))
						save_move(x+1, y-2, i-15, false);
				}
				if (y <= 5)
				{
					if ((x >= 1) && (board[i+15] != 2))
						save_move(x-1, y+2, i+15, false);
					if ((x <= 6) && (board[i+17] != 2))
						save_move(x+1, y+2, i+17, false);
				}
				if (y >= 1)
				{
					if ((x >= 2) && (board[i-10] != 2))
						save_move(x-2, y-1, i-10, false);
					if ((x <= 5) && (board[i-6] != 2))
						save_move(x+2, y-1, i-6, false);
				}
				if (y <= 6)
				{
					if ((x >= 2) && (board[i+6] != 2))
						save_move(x-2, y+1, i+6, false);
					if ((x <= 5) && (board[i+10] != 2))
						save_move(x+2, y+1, i+10, false);
				}
				break;
			}

			case this.constants.piece.king:
			{
				for (xp=-1 ; xp<=1 ; xp++)
				{
					xpp = x + xp;
					if ((xpp < 0) || (xpp > 7))
						continue;
					for (yp=-1 ; yp<=1 ; yp+=(xp===0?2:1))
					{
						ypp = y + yp;
						ip = 8 * ypp + xpp;
						if ((ypp < 0) || (ypp > 7) || (board[ip] == 2))
							continue;
						save_move(xpp, ypp, ip, false);
					}
				}
				break;
			}

			default:
				throw 'Internal error - Report any error (#003)';
		}
	}

	//-- Randomized search
	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	if (this.options.ai.randomizedSearch)
	{
		for (x=moves.length-1 ; x>=0 ; x--)
		{
			y = Math.round(Math.random() * x);
			t = moves[y];
			moves[y] = moves[x];
			moves[x] = t;
		}
	}

	//-- Results
	pNode.moves = moves;
};

/**
 * The method creates the sub-nodes corresponding to the moves stored in the provided node.
 *
 * @private
 * @method _ai_nodeCreateNodes
 * @param {Object} pNode Reference node.
 */
AntiCrux.prototype._ai_nodeCreateNodes = function(pNode) {
	var i, node;

	//-- Checks
	if (!pNode.hasOwnProperty('moves') || ((pNode.magic & this.constants.bitmask.player) == this.constants.player.none))
		return;

	//-- Builds the new sub-nodes
	pNode.nodes = [];
	for (i=0 ; i<pNode.moves.length ; i++)
	{
		//- Moves the piece
		node = this._ai_nodeCopy(pNode, false);
		if (this.movePiece(pNode.moves[i], false, (pNode.magic & this.constants.bitmask.player), node) == this.constants.noMove)
			throw 'Internal error - Report any error (#013)';
		this.switchPlayer(node);
		pNode.nodes.push(node);
	}
};

/**
 * The method explores the tree.
 *
 * @private
 * @method _ai_nodeRecurseTree
 * @param {AntiCrux.constants.player} pPlayer Player.
 * @param {Integer} pDepth Depth of the browsed level.
 * @param {Object} pNode Reference node.
 */
AntiCrux.prototype._ai_nodeRecurseTree = function(pPlayer, pDepth, pNode) {
	var	i, p, min_moves;

	//-- Checks
	if ((pNode === undefined) || (pNode === null))
		return;

	//-- Builds the sub-nodes for the decision tree
	if ((this.options.ai.handicap > 0) && ((pNode.magic & this.constants.bitmask.player) == pPlayer))
	{
		//- Number of moves to remove (simulation of an handicap)
		if (pNode.moves.length > 4)
			min_moves = Math.floor((pNode.moves.length-4) * this.options.ai.handicap / 100);
		else
			min_moves = 0;
		//- Removes random valid moves
		for (i=min_moves ; i>0 ; i--)
		{
			p = Math.floor(Math.random() * pNode.moves.length);
			pNode.moves.splice(p, 1);
			if (pNode.hasOwnProperty('nodes'))
				pNode.nodes.splice(p, 1);
		}
	}
	if (!pNode.hasOwnProperty('nodes'))
		this._ai_nodeCreateNodes(pNode);

	//-- Kills the bad sub-levels to constraint the opponent
	min_moves = this.constants.infinite;
	for (i=0 ; i<pNode.nodes.length ; i++)					//For each situation to be played by the opponent...
	{
		if (!pNode.nodes[i].hasOwnProperty('moves'))
			this._ai_nodeMoves(pNode.nodes[i]);
		if (this.options.ai.minimizeLiberty && ((pNode.nodes[i].magic & this.constants.bitmask.player) != pPlayer))
			if ((pNode.nodes[i].moves.length >= this.options.ai.maxReply) && (pNode.nodes[i].moves.length < min_moves))
				min_moves = pNode.nodes[i].moves.length;
	}
	for (i=pNode.nodes.length-1 ; i>=0 ; i--)
	{
		if (((pNode.magic & this.constants.bitmask.player) == pPlayer) && (pNode.nodes[i].moves.length > min_moves))
		{
			pNode.moves.splice(i, 1);
			pNode.nodes.splice(i, 1);
		}
		else
		{
			this._numNodes++;
			if ((pDepth >= this.options.ai.maxDepth) ||
				((this.options.ai.maxNodes !== 0) && (this._numNodes >= this.options.ai.maxNodes))
			)
				;		//No recursive search
			else
				this._ai_nodeRecurseTree(pPlayer, pDepth+1, pNode.nodes[i]);
		}
	}
};

/**
 * The method determines the strength of the node by giving it a score.
 *
 * @private
 * @method _ai_nodeValuate
 * @param {Object} pNode (Optional) Reference node.
 * @return {Object} Result of the valuation.
 */
AntiCrux.prototype._ai_nodeValuate = function(pNode) {
	var i, values, valuation, scale, result;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- No board
	if (!this._has(pNode, 'board', true))
		return {
			type         : this.constants.bitmask.none,
			value        : 0,
			valuePercent : 0,
			score        : this.constants.bitmask.none
		};

	//-- Values per player
	values = [];
	values[this.constants.player.none ] = 0;
	values[this.constants.player.black] = 0;
	values[this.constants.player.white] = 0;
	for (i=0 ; i<64 ; i++)
		values[pNode.board[i] & this.constants.bitmask.player] += this.options.ai.valuation[pNode.board[i] & this.constants.bitmask.piece];

	//-- Valuates the position
	if (values[this.constants.player.black] === 0)
		valuation = this.constants.bitmask.valuationValue;											//No more piece for Black
	else if (values[this.constants.player.white] === 0)
		valuation = -this.constants.bitmask.valuationValue;											//No more piece for White
	else
		valuation = values[this.constants.player.white] - values[this.constants.player.black];		//Normal case

	//-- No possible move anymore
	if (pNode.hasOwnProperty('moves'))
		if (pNode.moves.length === 0)
			valuation = this.constants.player.mapping_rev[pNode.magic & this.constants.bitmask.player] * -this.constants.bitmask.valuationValue;

	//-- Scale
	scale = Math.max(values[this.constants.player.black], values[this.constants.player.white]);
	if (scale === 0)
	{
		valuation = 0;
		scale = 1;
	}

	//-- Static score
	result = {
		type         : this.constants.bitmask.valuationStatic,
		value        : Math.round(valuation),
		valuePercent : Math.round(100*valuation/scale)
	};

	//-- Deep score
	if ((pNode.score & this.constants.bitmask.valuationType) == this.constants.bitmask.valuationDeep)
	{
		result.type         = this.constants.bitmask.valuationDeep;
		result.value        = this._ai_nodeScoreDecodeValue(pNode.score);
		result.valuePercent = Math.round(2*(100*(result.value+scale)/(2*scale) - 50));
	}

	//-- Result
	result.score = this._ai_nodeScoreEncode(result.value, result.type);
	return result;
};

/**
 * The method decodes the provided score.
 *
 * @private
 * @method _ai_nodeScoreDecodeValue
 * @param {Integer} pScore Score.
 * @return {Integer} Signed valuation.
 */
AntiCrux.prototype._ai_nodeScoreDecodeValue = function(pScore) {
	if ((pScore & this.constants.bitmask.valuationSign) == this.constants.bitmask.valuationSign)
		return -(pScore & this.constants.bitmask.valuationValue);
	else
		return (pScore & this.constants.bitmask.valuationValue);
};

/**
 * The method encodes a valuation into a compact format.
 *
 * @private
 * @method _ai_nodeScoreEncode
 * @param {Integer} pValue Signed value.
 * @param {AntiCrux.constants.bitmask.valuationType} pType Type of score.
 * @return {Integer} Formatted score.
 */
AntiCrux.prototype._ai_nodeScoreEncode = function(pValue, pType) {
	if (pValue >= 0)
		return pType | (pValue & this.constants.bitmask.valuationValue);
	else
		return pType | this.constants.bitmask.valuationSign | ((-pValue) & this.constants.bitmask.valuationValue);
};

/**
 * The method determines the best moves by browsing the decision tree.
 *
 * @private
 * @method _ai_nodeSolve
 * @param {AntiCrux.constants.player} pPlayer Player.
 * @param {Integer} pDepth Depth of the browsed level.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Object} Result of the valuation.
 */
AntiCrux.prototype._ai_nodeSolve = function(pPlayer, pDepth, pNode) {
	var i, bit, hasNode, allForced, hasForced, condition, threshold, val, val2, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	hasNode = this._has(pNode, 'nodes', true);

	//-- Checks the maximal depth
	if (!hasNode)
	{
		//- Applies the valuation for the solver
		pNode.score = (this._ai_nodeValuate(pNode).score & ~this.constants.bitmask.valuationType) | this.constants.bitmask.valuationDeep;
		pNode.magic |= this.constants.bitmask.forced;	//All the deepest levels are defined as forced moves
		val = this._ai_nodeScoreDecodeValue(pNode.score);
		if (val == this.constants.player.mapping_rev[pPlayer] * -this.constants.bitmask.valuationValue)
		{
			//The sequence will help for quicker (or longer ;-) when losing) ends of game
			pNode.magic = (pNode.magic & ~this.constants.bitmask.sequence) | (1 << this.constants.bitmask.sequenceShift);
			pNode.magic = (pNode.magic & ~this.constants.bitmask.opportunity) | this.constants.bitmask.opportunityPlus;
		}
		else if (val == this.constants.player.mapping_rev[pPlayer] * this.constants.bitmask.valuationValue)
			pNode.magic = (pNode.magic & ~this.constants.bitmask.opportunity) | this.constants.bitmask.opportunityMinus;

		//- Memory
		if (pDepth > 1)									//This condition is needed to display the score in HTML format
			delete pNode.board;
		return;
	}

	//-- Sets the flag for the forced moves and opportunities + Updates the lowest valuations recursively
	allForced = true;
	hasForced = false;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		//- Valuation
		this._ai_nodeSolve(pPlayer, pDepth+1, pNode.nodes[i]);

		//- Forced moves
		if ((pNode.nodes[i].magic & this.constants.bitmask.forced) == this.constants.bitmask.forced)
			hasForced = true;
		else
			allForced = false;

		//- Opportunities
		if ((pNode.nodes[i].magic & this.constants.bitmask.opportunity) != this.constants.bitmask.none)
		{
			if ((pNode.magic & this.constants.bitmask.opportunity) == this.constants.bitmask.none)
				pNode.magic |= (pNode.nodes[i].magic & this.constants.bitmask.opportunity);
			if ((pNode.magic & this.constants.bitmask.opportunity) != (pNode.nodes[i].magic & this.constants.bitmask.opportunity))
				pNode.magic |= (this.constants.bitmask.opportunityPlus | this.constants.bitmask.opportunityMinus);
		}
	}
	if ((((pNode.magic & this.constants.bitmask.player) == pPlayer) && hasForced) ||
		(((pNode.magic & this.constants.bitmask.player) != pPlayer) && allForced)
	)
		pNode.magic |= this.constants.bitmask.forced;

	//-- Removes the wrong nodes to always play the forced moves with the highest damage
	if (((pNode.magic & this.constants.bitmask.player) == pPlayer) && hasForced)
	{
		threshold = this.constants.player.mapping_rev[pPlayer] * this.constants.infinite;

		//- Finds the valuation of the forced moves
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if ((pNode.nodes[i].magic & this.constants.bitmask.forced) != this.constants.bitmask.forced)
			{
				pNode.moves.splice(i, 1);
				pNode.nodes.splice(i, 1);
				continue;
			}

			// Determines the best threshold
			val = this._ai_nodeScoreDecodeValue(pNode.nodes[i].score);
			if (((pPlayer == this.constants.player.white) && (val < threshold)) ||
				((pPlayer == this.constants.player.black) && (val > threshold))
			)
				threshold = val;
		}

		//- Remove the weak moves
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (this._ai_nodeScoreDecodeValue(pNode.nodes[i].score) != threshold)
			{
				pNode.moves.splice(i, 1);
				pNode.nodes.splice(i, 1);
			}
		}
	}

	//-- Evaluates the current node by using an average (default calculation)
	// Remark: for the forced moves, it should keep the same value
	condition = (((pNode.magic & this.constants.bitmask.player) == pPlayer) || !this.options.ai.pessimisticScenario);
	if (condition)
	{
		val = 0;
		counter = 0;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			val2 = this._ai_nodeScoreDecodeValue(pNode.nodes[i].score);
			if (Math.abs(val2) == this.constants.bitmask.valuationValue)	//For the weakest levels...
			{
				if (val2 == this.constants.player.mapping_rev[pPlayer] * this.constants.bitmask.valuationValue)
				{
					counter = 0;		//...a loosing position is considered else the end of game is abnormally easy
					break;
				}
				else
					continue;			//...a winning position is voluntarily ignored. The combinations must be good in average which gives the human player the possibility to react
			}
			val += val2;
			counter++;
		}
		if (counter !== 0)
		{
			val = Math.round(val/counter);	//Always integer !
			if (pDepth > 1)
				delete pNode.board;
		}
		else
			condition = false;			//The valuation will follow the other rule
		pNode.score = this._ai_nodeScoreEncode(val, this.constants.bitmask.valuationDeep);
	}

	//-- Evaluates the current node by using the worst valuation
	if (!condition)
	{
		val = this.constants.player.mapping_rev[pPlayer] * -this.constants.bitmask.valuationValue;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			val2 = this._ai_nodeScoreDecodeValue(pNode.nodes[i].score);
			if ( ((pPlayer == this.constants.player.white) && (val2 > val)) ||
				 ((pPlayer == this.constants.player.black) && (val2 < val))
				)
				val = val2;
		}
		pNode.score = this._ai_nodeScoreEncode(val, this.constants.bitmask.valuationDeep);
		if (pDepth > 1)
			delete pNode.board;
	}

	//-- Calculates the sequence which leads to a faster end of game
	if (	this.options.ai.acceleratedEndGame &&
			((pNode.magic & this.constants.bitmask.forced) == this.constants.bitmask.forced) &&
			(this._ai_nodeScoreDecodeValue(pNode.score) == this.constants.player.mapping_rev[pPlayer]*-this.constants.bitmask.valuationValue)
		)
	{
		val = this.constants.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			bit = (pNode.nodes[i].magic & this.constants.bitmask.sequence);
			if ((bit > 0) && (bit < val))
				val = bit;
		}
		if (val != this.constants.infinite)
			if (val < this.constants.bitmask.sequence)		//Not above the ceiling
				pNode.magic += (1 << this.constants.bitmask.sequenceShift);
	}

	//-- Flag the best move
	if (hasNode && this.options.board.assistance && (pDepth <= this.options.board.assistanceDepth))
		pNode.magic = (pNode.magic & ~this.constants.bitmask.bestMove) | (this._ai_nodePick((pNode.magic & this.constants.bitmask.player), pNode) << this.constants.bitmask.bestMoveShift);
};

/**
 * The method selects the best move for the player.
 *
 * @private
 * @method _ai_nodePick
 * @param {AntiCrux.constants.player} pPlayer Player.
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} The internal representation of the move, or an exception if no move is found.
 */
AntiCrux.prototype._ai_nodePick = function(pPlayer, pNode) {
	var	i, threshold, status, val, bitSeq,
		better, same, moves;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Keeps the moves which lead to a fast end of game
	if (	this.options.ai.acceleratedEndGame &&
			((pNode.magic & this.constants.bitmask.forced) == this.constants.bitmask.forced) &&
			((pNode.score & this.constants.bitmask.valuationType) == this.constants.bitmask.valuationDeep) &&
			(this._ai_nodeScoreDecodeValue(pNode.score) == this.constants.player.mapping_rev[pNode.magic & this.constants.bitmask.player] * -this.constants.bitmask.valuationValue)
		)
	{
		threshold = this.constants.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			bitSeq = (pNode.nodes[i].magic & this.constants.bitmask.sequence);
			if (	((pNode.nodes[i].magic & this.constants.bitmask.forced) == this.constants.bitmask.forced) &&
					(bitSeq > 0) && (bitSeq < threshold)
			)
				threshold = bitSeq;
		}
		if (threshold != this.constants.infinite)
		{
			for (i=pNode.nodes.length-1 ; i>=0 ; i--)
			{
				if ((pNode.nodes[i].magic & this.constants.bitmask.sequence) != threshold)
				{
					pNode.moves.splice(i, 1);
					this._ai_nodeFreeMemory(pNode.nodes[i]);
					pNode.nodes.splice(i, 1);
				}
			}
		}
	}

	//-- When there are still plenty of equivalent moves, we keep the ones having the best opportunity
	if (this.options.ai.opportunistic && (pNode.nodes.length > 1))
	{
		//- Finds the best status
		status = null;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			val = this.constants.bitmask.opportunityPriority[pNode.nodes[i].magic & this.constants.bitmask.opportunity];
			if ((status === null) || (val > status))
				status = val;
		}
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (this.constants.bitmask.opportunityPriority[pNode.nodes[i].magic & this.constants.bitmask.opportunity] != status)
			{
				pNode.moves.splice(i, 1);
				this._ai_nodeFreeMemory(pNode.nodes[i]);
				pNode.nodes.splice(i, 1);
			}
		}
	}

	//-- Lists the eligible moves
	// White will minimize the valuation
	// Black will maximize the valuation
	moves = [];
	threshold = this.constants.player.mapping_rev[pPlayer] * this.constants.bitmask.valuationValue;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		//- Comparison
		val = this._ai_nodeScoreDecodeValue(pNode.nodes[i].score);
		better = ((pPlayer == this.constants.player.white) && (val < threshold)) ||
				 ((pPlayer == this.constants.player.black) && (val > threshold));
		same   = ((pPlayer == this.constants.player.white) && (val == threshold)) ||
				 ((pPlayer == this.constants.player.black) && (val == threshold));

		//- Selects the move
		if (better)
		{
			moves = [];
			threshold = val;
		}
		if (same || better)
			moves.push(pNode.moves[i]);
	}

	//-- Final move
	switch (moves.length)
	{
		case 0 : throw 'Internal error - Report any error (#002)';
		case 1 : return moves[0];
		default: return moves[Math.round(Math.random() * (moves.length-1))];
	}
};

/**
 * The method recurses the decision tree to build the expected sequence of moves.
 * The output is stored in a buffer.
 *
 * @private
 * @method _ai_nodeAssistance
 * @param {Object} pNode Reference node.
 * @param {Boolean} pUCI UCI notation.
 * @param {Integer}} pDepth Browsed depth (1=root).
 */
AntiCrux.prototype._ai_nodeAssistance = function(pNode, pUCI, pDepth) {
	var move;

	//-- Checks
	move = (pNode.magic & this.constants.bitmask.bestMove) >> this.constants.bitmask.bestMoveShift;
	if (move == this.constants.noMove)
		return;

	//-- Adds the move
	if (pDepth > 1)
	{
		if (this._buffer.length > 0)
			this._buffer += ' ';
		if (pUCI)
			this._buffer += this._helper.moveToUCI(move);
		else
			this._buffer += this._helper.moveToString(move);
	}

	//-- Moves the piece for the next level
	if (this._helper.movePiece(move, true) == this.constants.noMove)
		throw 'Internal error - Report any error (#018)';
	this._helper.switchPlayer();

	//-- Recursive search
	if (this._has(pNode, 'nodes', true) && this._has(pNode, 'moves', true))
		this._ai_nodeAssistance(pNode.nodes[pNode.moves.indexOf(move)], pUCI, pDepth+1);
};

/**
 * The method reduces the maximal number of nodes to destroy the links between them.
 *
 * @private
 * @method _ai_nodeFreeMemory
 * @param {Object} pNode (Optional) Reference node.
 * @return {Integer} Count of released nodes.
 */
AntiCrux.prototype._ai_nodeFreeMemory = function(pNode) {
	var i, count;

	//-- Self
	if (pNode === null)
		return 0;
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!pNode.hasOwnProperty('nodes'))
		return 1;

	//-- Atomization to remove the links between every object
	count = 0;
	for (i=0 ; i<pNode.nodes.length ; i++)
		count += this._ai_nodeFreeMemory(pNode.nodes[i]);
	delete pNode.nodes;
	delete pNode.moves;
	return count;
};

/**
 * The method calls the garbage collector (if available).
 *
 * @private
 * @method _ai_gc
 */
AntiCrux.prototype._ai_gc = function() {
	//-- Garbage collector for V8 if run with the right option
	if ((typeof global == 'object') && (typeof global.gc == 'function'))
		global.gc();
};


//---- Node.js

if ((typeof module !== 'undefined') && module.exports)
	module.exports = AntiCrux;
