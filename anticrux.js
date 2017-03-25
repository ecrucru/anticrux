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



//======== Main class
var AntiCrux = function() {
	this._init();
	this._root_node = {};
	this.clearBoard();
};


//---- Public members

AntiCrux.prototype.startUI = function() {
	if ((typeof module !== 'undefined') && module.exports)
	{
		var opn = require('opn');
 		opn('./node_modules/anticrux/index.html');
	}
	else
		throw 'Error - AntiCrux.prototype.startUI() is restricted to Node.js';
};

AntiCrux.prototype.copyOptions = function(pObject) {
	//-- Checks
	if (!pObject.hasOwnProperty('options'))
		return false;

	//-- Proceeds to the copy
	this.options = JSON.parse(JSON.stringify(pObject.options));
	return true;
};

AntiCrux.prototype.getMainNode = function() {
	return this._root_node;
};

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
		piece  : [],
		owner  : [],
		player : this.constants.owner.white
	};
	for (i=0 ; i<64 ; i++)
	{
		this._root_node.piece[i] = this.constants.piece.none;
		this._root_node.owner[i] = this.constants.owner.none;
	}
	this.fischer = null;
};

AntiCrux.prototype.getNewFischerId = function() {
	return Math.floor(Math.random()*960)+1;
};

AntiCrux.prototype.defaultBoard = function(pFischer) {
	var i, z, p, krn, pieces;

	//-- Self
	if (pFischer === undefined)
		pFischer = this.constants.board.classicalFischer;

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
		this._root_node.piece[8*0+i] = pieces[i];
		this._root_node.piece[8*1+i] = this.constants.piece.pawn;
		this._root_node.piece[8*6+i] = this.constants.piece.pawn;
		this._root_node.piece[8*7+i] = pieces[i];

		this._root_node.owner[8*0+i] = this.constants.owner.black;
		this._root_node.owner[8*1+i] = this.constants.owner.black;
		this._root_node.owner[8*6+i] = this.constants.owner.white;
		this._root_node.owner[8*7+i] = this.constants.owner.white;
	}
	this._history_fen0 = this.toFen();
	return true;
};

AntiCrux.prototype.loadFen = function(pFen) {
	var list, x, y, i, car;

	//-- Checks
	if (pFen.length === 0)
		return false;

	//-- Clears the board
	this.clearBoard();

	//-- Splits the input parameter
	list = pFen.split(' ');

	//-- Loads the FEN
	x = 0;
	y = 0;
	for (i=0 ; i<list[0].length ; i++)
	{
		car = list[0].charAt(i);
		if (car == ' ')
			break;
		else if ('12345678'.indexOf(car) != -1)
			x += parseInt(car);
		else if (car == '/')
		{
			x = 0;
			y++;
		}
		else if ('prnbqk'.indexOf(car.toLowerCase()) != -1)
		{
			this._root_node.piece[8*y+x] = this.constants.piece.mapping[car];
			this._root_node.owner[8*y+x] = (car == car.toLowerCase() ? this.constants.owner.black : this.constants.owner.white);
			x++;
		}
		else
		{
			this.clearBoard();
			return false;
		}
	}

	//-- Current player
	if (list[1] === undefined)
		this._root_node.player = this.constants.owner.white;
	else
		this._root_node.player = (list[1] == 'b' ? this.constants.owner.black : this.constants.owner.white);

	//-- En passant
	if (this.options.variant.enPassant && (list[3] !== undefined) && (list[3] !== '-'))
	{
		i = 'abcdefgh'.indexOf(list[3]);
		if (i !== -1)
			this._root_node.enpassant = 8*(this._root_node.player == this.constants.owner.white ? 2 : 5) + i;
	}

	//-- Halfmove clock
	this._halfmoveclock = (list[4] !== undefined ? parseInt(list[4]) : 0);
	this._halfmoveclock_status = -1;

	//-- Final
	this._root_node.valuation = this._ai_nodeValuate().valuation;
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

AntiCrux.prototype.loadLichess = function(pKey) {
	var that;

	//References :
	//	https://github.com/ornicar/lila#http-api
	//	https://en.lichess.org/api/game/oPUvsggeDeTg?with_fens=1&with_moves=1

	//-- Checks
	if (!pKey.match(/^[a-zA-Z0-9]{8}$/) && !pKey.match(/^[a-zA-Z0-9]{12}$/))
		return false;

	//-- Gets the JSON
	that = this;
	$.ajaxSetup({ cache: false });
	$.get(	'https://en.lichess.org/api/game/'+pKey+'?with_fens=1&with_moves=1',
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
				that.defaultBoard(that.constants.board.classicalFischer);

			//-- Determines the current player
			if (that._has(data, 'color', 'black'))
				playerIndication = that.constants.owner.black;
			else
				playerIndication = that.constants.owner.white;

			//-- Determines the first player of the game
			moves = data.moves.split(' ');
			if ((playerIndication == that.constants.owner.white) && (moves.length % 2 == 1))
				playerIndication = that.constants.owner.black;
			else
				playerIndication = that.constants.owner.white;

			//-- Processes the moves
			that._history = [];
			for (i=0 ; i<moves.length ; i++)
			{
				move = that.movePiece(moves[i], true, playerIndication);
				if (move == that.constants.move.none)
					return false;
				else
				{
					that.updateHalfMoveClock();
					that.logMove(move);
					that.highlightMove(move);
					playerIndication = (playerIndication == that.constants.owner.white ? that.constants.owner.black : that.constants.owner.white);
				}
			}

			//-- Result
			that._root_node.player = playerIndication;
			return true;
		});
	return true;
};

AntiCrux.prototype.hasSetUp = function() {
	//-- Position
	if (!this._has(this, '_history_fen0', true))
		return false;

	//-- Result
	return (this._history_fen0.substring(0,43) != 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
};

AntiCrux.prototype.getInitialPosition = function() {
	return (!this._has(this, '_history_fen0', true) ? '' : this._history_fen0);
};

AntiCrux.prototype.getPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Finds the player
	return (pNode.hasOwnProperty('player') ? pNode.player : this.constants.owner.none);
};

AntiCrux.prototype.getOppositePlayer = function(pNode) {
	switch (this.getPlayer(pNode))
	{
		case this.constants.owner.none:
			return this.constants.owner.none;
		case this.constants.owner.white:
			return this.constants.owner.black;
		case this.constants.owner.black:
			return this.constants.owner.white;
		default:
			return null;
	}
};

AntiCrux.prototype.setLevel = function(pLevel) {
	//-- Checks
	if ((pLevel < 1) || (pLevel > 20))
		return false;

	//-- Applies the new settings
	this.options.ai.maxDepth			= [3, 8, 8, 8, 3, 5, 6, 7, 8, 9, 10, 15, 20, 30, 30, 30, 40, 40, 45, 50][pLevel-1];
	this.options.ai.maxNodes			= [100, 50000, 50000, 50000, 15000, 30000, 50000, 75000, 80000, 85000, 90000, 120000, 150000, 200000, 300000, 400000, 500000, 750000, 1000000, 2000000][pLevel-1];
	this.options.ai.minimizeLiberty		= (pLevel >= 8);
	this.options.ai.maxReply			= [1, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2][pLevel-1];
	this.options.ai.noStatOnForcedMove	= (pLevel >= 6);
	this.options.ai.wholeNodes			= (pLevel >= 11);
	this.options.ai.randomizedSearch	= true;
	this.options.ai.pessimisticScenario	= (pLevel >= 10);
	this.options.ai.bestStaticScore		= (pLevel >= 12);
	this.options.ai.opportunistic		= (pLevel >= 13);
	this.options.ai.handicap			= [0, 70, 50, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][pLevel-1];
	this.options.ai.acceleratedEndGame	= (pLevel >= 5);
	this.options.ai.oyster				= (pLevel == 1);
	this._lastLevel = pLevel;
	return true;
};

AntiCrux.prototype.setPlayer = function(pPlayer, pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Sets the player
	if ([this.constants.owner.black, this.constants.owner.none, this.constants.owner.white].indexOf(pPlayer) !== -1)
	{
		pNode.player = pPlayer;
		return true;
	}
	else
		return false;
};

AntiCrux.prototype.getPieceByCoordinate = function(pCoordinate, pNode) {
	var index;

	//-- Checks
	if (!pCoordinate.match(/^[a-h][1-8]$/))
		return false;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Information
	index = (8-parseInt(pCoordinate.charAt(1)))*8 + 'abcdefgh'.indexOf(pCoordinate.charAt(0));
	return { owner: pNode.owner[index],
			 piece: pNode.piece[index]
		};
};

AntiCrux.prototype.isMove = function(pMove) {
	return	pMove.match(/^[RNBQK]?([a-h]([0-9])?)?x?[a-h][0-9]=?[RrNnBbQqKk]?\s?[\!|\+|\#|\-|\/|\=|\?]*$/) ||
			pMove.match(/^[0-6]?[0-7]{4}$/);
};

AntiCrux.prototype.movePiece = function(pMove, pCheckLegit, pPlayerIndication, pNode) {
	var	regex, player, node, moves, i, x, y, tX, tY, valid,
		move_promotion, move_fromY, move_fromX, move_toY, move_toX;

	//-- Self
	if ((pMove === undefined) || (pMove == this.constants.move.none))
		return this.constants.move.none;
	if (pNode === undefined)
		pNode = this._root_node;
	if (this.hasPendingPromotion(pNode))
		return this.constants.move.none;
	if (pPlayerIndication === undefined)
		pPlayerIndication = this.constants.owner.none;
	if (pNode === null)
		return this.constants.move.none;

	//-- Converts from the external notation
	if (typeof pMove == 'string')
	{
		//- Decode the input string
		regex = pMove.match(/^([RNBQK])?([a-h]([0-9])?)?(x)?([a-h][0-9])=?([RrNnBbQqKk])?\s?[\!|\+|\#|\-|\/|\=|\?]*$/); //case-sensitive, no castling
		if (regex === null)
			return this.constants.move.none;

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
		if (pPlayerIndication == this.constants.owner.none)
		{
			node.player = this.constants.owner.black;
			this._ai_nodeMoves(node);
			moves = moves.concat(node.moves);
			node.player = this.constants.owner.white;
			this._ai_nodeMoves(node);
			node.moves = moves.concat(node.moves);
		}
		else
		{
			node.player = pPlayerIndication;
			this._ai_nodeMoves(node);
		}
		moves = [];

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
				// Checks the originating owner
				if ((pPlayerIndication != this.constants.owner.none) && (node.owner[8*y+x] != pPlayerIndication))
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
				if ((regex[1].length == 1) && (this.constants.piece.mapping[regex[1]] != node.piece[8*y+x])) //Is it the described piece ?
					continue;
				if ((regex[1].length === 0) && (regex[2].length != 2) && (node.piece[8*y+x] != this.constants.piece.pawn)) //Is it a partially identified pawn ?
					continue;
				// Validates the move
				if (moves.indexOf(node.moves[i]%10000) == -1)
					moves.push(node.moves[i]%10000);
			}
		}

		//- Move from : chooses the final move
		if (moves.length != 1)
			return this.constants.move.none;
		move_fromY = Math.floor(moves[0]/1000) % 10;
		move_fromX = Math.floor(moves[0]/100 ) % 10;
	}
	else
	{
		pMove = parseInt(pMove);
		if (pMove === 0)
			return this.constants.move.none;
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
		return this.constants.move.none;
	pMove = move_promotion*10000 + move_fromY*1000 + move_fromX*100 + move_toY*10 + move_toX;

	//-- Finds the player
	player = pNode.owner[8*move_fromY+move_fromX];
	if (player == this.constants.owner.none)
		return this.constants.move.none;
	pNode.player = player;

	//-- Verifies if the move is legit
	if (pCheckLegit)
	{
		node = this._ai_nodeCopy(pNode, false);
		node.player = player;
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
			this._highlight = [];
			return this.constants.move.none;
		}
	}

	//-- En passant...
	//- Executes the move
	if (	this.options.variant.enPassant &&
			pNode.hasOwnProperty('enpassant') &&
			(8*move_toY+move_toX == pNode.enpassant) &&									//Target cell is identified as "en passant"
			(pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) &&		//Source piece is a pawn
			(pNode.piece[8*move_toY+move_toX] == this.constants.piece.none)				//Target piece is blank
		)
	{
		// Locates the target pawn
		tX = move_toX;
		tY = move_toY + pNode.player;
		// Removes the target pawn
		if ((tX>=0) && (tX<=7) && (tY>=0) && (tY<=7) &&									//Assumed to be always true
			(pNode.piece[8*tY+tX] == this.constants.piece.pawn) &&						//Kill an en passant pawn
			(pNode.owner[8*tY+tX] != pNode.owner[8*move_fromY+move_fromX])				//Black vs. White
		) {
			pNode.piece[8*tY+tX] = this.constants.piece.none;
			pNode.owner[8*tY+tX] = this.constants.owner.none;
			delete pNode.enpassant;
		}
	}
	//- Marks the cell
	else if (	(pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) &&
				(Math.abs(move_toY-move_fromY) == 2)
	)
		pNode.enpassant = 4*(move_toY+move_fromY) + move_toX;
	//- Removes the cell
	else
		delete pNode.enpassant;

	//-- Updates the status to change the halfmove clock later
	this._halfmoveclock_status = 1;
	if ((pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) ||		//Pawn advance
		(pNode.piece[8*move_toY+move_toX] != this.constants.piece.none)				//Capturing move
	)
		this._halfmoveclock_status = 0;

	//-- Performs the move
	pNode.piece[8*move_toY+move_toX]     = pNode.piece[8*move_fromY+move_fromX];
	pNode.piece[8*move_fromY+move_fromX] = this.constants.piece.none;
	pNode.owner[8*move_toY+move_toX]     = pNode.owner[8*move_fromY+move_fromX];
	pNode.owner[8*move_fromY+move_fromX] = this.constants.owner.none;

	//-- Promotes the pawn immediately or not
	if ((move_toY === 0) || (move_toY === 7))
	{
		if (pNode.piece[8*move_toY+move_toX] == this.constants.piece.pawn)
		{
			//- Forced promotion
			if (this.options.variant.promoteQueen)
				move_promotion = this.constants.piece.queen;

			//- Effective promotion
			if (move_promotion != this.constants.piece.none)
				pNode.piece[8*move_toY+move_toX] = move_promotion;
			else
				pNode._pendingPromotion = 8*move_toY+move_toX;
		}
	}

	//-- Result
	this._highlight = [];
	return pMove;
};

AntiCrux.prototype.getMoveAI = function(pPlayer, pNode) {
	var	i,
		maxDepth, curDepth, limitDepth, reg_x, reg_y, reg_mean_x, reg_mean_y, reg_sxx, reg_sxy, reg_a, reg_b, reg_estimate;

	//-- Checks
	if (pNode === undefined)
		pNode = this._root_node;
	if (pPlayer === undefined)
		pPlayer = this.getPlayer(pNode);
	if ((pPlayer != this.constants.owner.black) && (pPlayer != this.constants.owner.white))
		return this.constants.move.none;
	this._buffer = '';

	//-- Pre-conditions
	if (this.hasPendingPromotion(pNode))
		return this.constants.move.none;
	if (this.options.ai.maxReply < 1)
		this.options.ai.maxReply = 1;
	this._ai_nodeFreeMemory(pNode);				//Should be done by the calling program in any case
	this._ai_nodeShrink(pNode);
	pNode.player = pPlayer;
	maxDepth = this.options.ai.maxDepth;

	//-- End of game ?
	this._ai_nodeMoves(pNode);
	if (pNode.moves.length === 0)
		return this.constants.move.none;
	limitDepth = (this.options.ai.noStatOnForcedMove && (pNode.moves.length === 1));

	//-- Oyster : you can't lose against this level
	if (this.options.ai.oyster)
	{
		this.resetStats();
		return pNode.moves[Math.round(Math.random() * (pNode.moves.length-1))];
	}

	//-- Builds the decision tree level by level
	reg_x = [];
	reg_y = [];
	for (curDepth=1 ; curDepth<=maxDepth ; curDepth++)
	{
		//- Explores to the temporary lowest level
		this._numNodes = 0;
		this.options.ai.maxDepth = curDepth;
		this._ai_nodeRecurseTree(pPlayer, 0, pNode);
		this._reachedDepth = curDepth;

		//- Callback
		if (this.callbackExploration !== null)
			this.callbackExploration(maxDepth, this._reachedDepth, this._numNodes);

		//- Estimates the number of nodes for the next level
		// The mathematical background is at http://keisan.casio.com/exec/system/14059930754231
		if (this._numNodes === 0)
			throw 'Internal error - Report any error (#001)';
		// Input data
		reg_x.push(curDepth);
		reg_y.push(this._numNodes);
		// Average
		reg_mean_x = 0;
		reg_mean_y = 0;
		for (i=0 ; i<reg_x.length ; i++)
			reg_mean_x += reg_x[i];
		reg_mean_x /= reg_x.length;
		for (i=0 ; i<reg_y.length ; i++)
			reg_mean_y += Math.log(reg_y[i]);
		reg_mean_y /= reg_y.length;
		// Factor Sxx
		reg_sxx = 0;
		for (i=0 ; i<reg_x.length ; i++)
			reg_sxx += Math.pow(reg_x[i]-reg_mean_x, 2);
		reg_sxx /= reg_x.length;
		// Factor Sxy
		reg_sxy = 0;
		for (i=0 ; i<reg_y.length ; i++)
			reg_sxy += (reg_x[i]-reg_mean_x) * (Math.log(reg_y[i])-reg_mean_y);
		reg_sxy /= reg_y.length;
		// Factor B and A
		reg_b = (reg_sxx === 0 ? 0 : reg_sxy/reg_sxx);
		reg_a = Math.exp(reg_mean_y-reg_b*reg_mean_x);
		// Next number of nodes (exponential model)
		reg_estimate = Math.floor(reg_a*Math.exp(reg_b*(curDepth+1)));

		//- Reaches the next level if allowed
		if (	(curDepth >= (limitDepth ? 1 : maxDepth)) ||			//Max depth reached
				(	!this.options.ai.wholeNodes &&						//Exceeded projection with 5% of tolerance
					(this.options.ai.maxNodes !== 0) &&
					(reg_estimate > this.options.ai.maxNodes)
				) ||
				(	this.options.ai.wholeNodes &&
					(this.options.ai.maxNodes !== 0) &&					//Max nodes reached
					(this._numNodes >= this.options.ai.maxNodes)
				)
		)
			break;
	}
	this.options.ai.maxDepth = maxDepth;								//Restores the initial setting

	//-- Valuates the decision tree entirely
	this._ai_gc();
	this._ai_nodeSolve(pPlayer, 0, '', pNode);
	return this._ai_nodePick(pPlayer, pNode);
};

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
	this._helper.options.ai.maxDepth = 3;
	this._helper.options.ai.maxNodes = 0;
	this._helper.options.ai.wholeNodes = true;
	this._helper.options.board.symbols = this.options.board.symbols;
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
		if (move === this._helper.constants.move.none)
		{
			this._helper.freeMemory();
			break;
		}
		if (buffer.length > 0)
			buffer += ' ';
		buffer += this._helper.moveToString(move);

		//- Next position
		this._helper.freeMemory();
		if (this._helper.movePiece(move, true) == this._helper.constants.move.none)
			throw 'Internal error - Report any error (#012)';
		else
			this._helper.switchPlayer();
	}

	//-- Result
	return 'The predicted moves are :' + "\n" + buffer + "\n" + "\n" + 'Score = ' + this._helper.getScore().valuationSolverPC + '%';
};

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

AntiCrux.prototype.getHalfMoveClock = function() {
	return this._halfmoveclock;
};

AntiCrux.prototype.updateHalfMoveClock = function() {
	// To be called after AntiCrux.prototype.movePiece()
	if (this._halfmoveclock_status == 1)
		this._halfmoveclock++;
	else
		if (this._halfmoveclock_status === 0)
			this._halfmoveclock = 0;
	this._halfmoveclock_status = -1;
};

AntiCrux.prototype.resetStats = function() {
	this._numNodes = 0;
	this._reachedDepth = 0;
};

AntiCrux.prototype.undoMove = function() {
	var i, hist;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return '';

	//-- Prepares the board
	hist = this._history.slice(0);
	hist.pop();
	this.loadFen(this._history_fen0);

	//-- Builds the new board
	for (i=0 ; i<hist.length ; i++)
	{
		if (this.movePiece(hist[i], true, this.constants.owner.none) == this.constants.move.none)
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

AntiCrux.prototype.getNumNodes = function() {
	return (this.hasOwnProperty('_numNodes') ? this._numNodes : 0);
};

AntiCrux.prototype.getReachedDepth = function() {
	return (this.hasOwnProperty('_reachedDepth') ? this._reachedDepth : 0);
};

AntiCrux.prototype.hasPendingPromotion = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Result
	return pNode.hasOwnProperty('_pendingPromotion');
};

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
	pNode.piece[pNode._pendingPromotion] = piece;
	delete pNode._pendingPromotion;
	return piece;
};

AntiCrux.prototype.getPieceSymbol = function(pPiece, pPlayer, pSymbol) {
	var output;
	if (!pSymbol)
		return (pPiece == this.constants.piece.pawn ? '' : this.constants.piece.mapping_rev[pPiece].toUpperCase());
	else
	{
		if (pPlayer == this.constants.owner.white)
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

AntiCrux.prototype.moveToString = function(pMove, pNode) {
	var move, move_promo, move_fromY, move_fromX, move_toY, move_toX,
		buffer, taken, output;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if ((pMove === null) || (pMove == this.constants.move.none))
		return '';

	//-- Elements
	move = parseInt(pMove);
	move_promo = Math.floor(move/10000) % 10;
	move_fromY = Math.floor(move/1000 ) % 10;
	move_fromX = Math.floor(move/100  ) % 10;
	move_toY   = Math.floor(move/10   ) % 10;
	move_toX   =            move        % 10;

	//-- Piece
	output = this.getPieceSymbol(	pNode.piece[8*move_fromY+move_fromX],
									pNode.owner[8*move_fromY+move_fromX],
									this.options.board.symbols
								);

	//-- Taken piece
	taken = (pNode.owner[8*move_toY+move_toX] != pNode.owner[8*move_fromY+move_fromX]) &&
			(pNode.owner[8*move_toY+move_toX] != this.constants.owner.none);
	if (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant)
		taken = taken || (	(pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) &&
							(8*move_toY+move_toX == pNode.enpassant)
						);

	//-- Initial position
	if ((this._ai_nodeInventory(pNode.owner[8*move_fromY+move_fromX], pNode.piece[8*move_fromY+move_fromX], undefined, pNode) > 1) ||
		(taken && (pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn))
	) {
		buffer = 'abcdefgh'.charAt(move_fromX);
		if (this._ai_nodeInventory(pNode.owner[8*move_fromY+move_fromX], pNode.piece[8*move_fromY+move_fromX], move_fromX, pNode) > 1)
			buffer += 8-move_fromY;
	}
	else
		buffer = '';

	//-- Simplified notation
	if (!taken && (pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) && (move_fromX == move_toX))
		buffer = '';
	if (!taken && (this._ai_nodeInventory(pNode.owner[8*move_fromY+move_fromX], pNode.piece[8*move_fromY+move_fromX], undefined, pNode) == 1))
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
												pNode.owner[8*move_fromY+move_fromX],
												this.options.board.symbols
											);

	//-- Result
	return output;
};

AntiCrux.prototype.moveToUCI = function(pMove) {
	if ((pMove === null) || (typeof pMove !== 'number') || (pMove == this.constants.move.none))
		return '0000';
	else
		return ( 'abcdefgh'[Math.floor(pMove/100) % 10] +
				 (8-Math.floor(pMove/1000) % 10) +
				 'abcdefgh'[pMove % 10] +
				 (8-Math.floor(pMove/10) % 10) +
				 '  rnbqk'[Math.floor(pMove/10000) % 10]
				).trim();
};

AntiCrux.prototype.getScore = function(pNode) {
	var score;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Determines the score
	score = this._ai_nodeValuate(pNode);
	if (score === null)							//Game data have been dropped, so we rely on the data of the node
		return {
			valuation       : (pNode.hasOwnProperty('valuation') ? pNode.valuation : null),
			valuationSolver : (pNode.hasOwnProperty('valuationSolver') ? pNode.valuationSolver : null)
		};
	else
		return score;
};

AntiCrux.prototype.switchPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (!pNode.hasOwnProperty('player'))
		return false;

	//-- Switches the players
	if (pNode.player == this.constants.owner.white)
		pNode.player = this.constants.owner.black;
	else
		pNode.player = this.constants.owner.white;
	return true;
};

AntiCrux.prototype.getWinner = function(pNode) {
	var node = this._ai_nodeCopy((pNode === undefined ? this._root_node : pNode), true);

	//-- Tests for White
	node.player = this.constants.owner.white;
	this._ai_nodeMoves(node);
	if (!this._has(node, 'moves', true))
		return this.constants.owner.white;

	//-- Tests for Black
	node.player = this.constants.owner.black;
	this._ai_nodeMoves(node);
	if (!this._has(node, 'moves', true))
		return this.constants.owner.black;

	//-- No winner
	return this.constants.owner.none;
};

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
		this._helper.copyOptions(this);
		if (this._helper.loadFen(this._history_fen0))
		{
			//- Builds all the positions
			positions = [this._history_fen0.substring(0, this._history_fen0.indexOf(' '))];
			for (i=0 ; i<this._history.length ; i++)
			{
				if (this._helper.movePiece(this._history[i], true, this._helper.getPlayer()) == this._helper.constants.move.none)
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
		if (	(this._ai_nodeCountPiece(this.constants.owner.white) == 1) &&
				(this._ai_nodeCountPiece(this.constants.owner.black) == 1)
		) {
			white = this._ai_nodeLocatePiece(this.constants.owner.white, this.constants.piece.bishop);
			black = this._ai_nodeLocatePiece(this.constants.owner.black, this.constants.piece.bishop);
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

AntiCrux.prototype.isPossibleDraw = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Too long history
	if (this._history.length >= 150)
		return true;

	//-- Possible draw based on the deep evaluation
	if (	!this.hasOwnProperty('_reachedDepth') ||
			!pNode.hasOwnProperty('valuation') ||
			!pNode.hasOwnProperty('valuationSolver')
	)
		return false;
	else
		return (	(this._reachedDepth >= 5) &&															//Sufficient depth for the valuation
					(pNode.valuation === 0) &&																//Equal game on both side
					(pNode.valuationSolver === 0) &&														//No deep opportunity
					(this._ai_nodeInventory(this.constants.owner.black, null, undefined, pNode) <= 5) &&	//Few remaining pieces
					(this._ai_nodeInventory(this.constants.owner.white, null, undefined, pNode) <= 5)		//Few remaining pieces
				);
};

AntiCrux.prototype.getDrawReason = function() {
	return this._lastDrawReason;
};

AntiCrux.prototype.isEndGame = function(pSwitch, pNode) {
	var node = this._ai_nodeCopy(pNode === undefined ? this._root_node : pNode, false);
	if (pSwitch)
		this.switchPlayer(node);
	this._ai_nodeMoves(node);
	return !this._has(node, 'moves', true);
};

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

AntiCrux.prototype.highlightMove = function(pMove) {
	var move_fromY, move_fromX, move_toY, move_toX;

	//-- No move resets the highlight
	if (pMove === 0)
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

AntiCrux.prototype.getHistory = function() {
	return (this.hasOwnProperty('_history') ? this._history : []);
};

AntiCrux.prototype.getHistoryHtml = function() {
	var i, output;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return '';

	//-- Initial position
	this._initHelper();
	this._helper.copyOptions(this);
	if (!this._helper.loadFen(this._history_fen0))
		return '';

	//-- Builds the moves
	output = '<table class="ui-table AntiCrux-table" data-role="table">';
	for (i=0 ; i<this._history.length ; i++)
	{
		if (i % 2 === 0)
			output += '<tr><th>' + Math.floor((i+2)/2) + '</th>';
		output += '<td class="AntiCrux-history-item" data-index="'+i+'" title="Click to review this past move">' + this._helper.moveToString(this._history[i]) + '</td>';
		if (this._helper.movePiece(this._history[i], true, this._helper.constants.owner.none) == this._helper.constants.move.none)
			throw 'Internal error - Report any error (#010)';
		if (i % 2 == 1)
			output += '</tr>';
	}
	if (i % 2 == 1)
		output += '</tr>';
	return output + '</table>';
};

AntiCrux.prototype.getDecisionTreeHtml = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Extracts the data
	this._buffer = '';
	this._ai_nodeTreeHtml(0, pNode);
	if (this._buffer.length === 0)
		this._buffer = '<tr><td colspan="7">No data</td></tr>';
	return	'<table class="ui-table AntiCrux-table" data-role="table">' +
			'	<thead>' +
			'		<tr>' +
			'			<th>Static</th>' +
			'			<th>Deep</th>' +
			'			<th colspan="5">Moves</th>' +
			'		</tr>' +
			'	</thead>' +
			'	<tbody>' + "\n" +
					this._buffer +
			'	</tbody>' +
			'</table>';
};

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

		//- Static score
		output += '<td>';
		if (score.valuation == this.constants.owner.black*this.constants.score.infinite)
			output += '<img src="images/mate_'+this.constants.owner.white+'.png" title="White wins" alt="-&#8734;" />';
		else if (score.valuation == this.constants.owner.white*this.constants.score.infinite)
			output += '<img src="images/mate_'+this.constants.owner.black+'.png" title="Black wins" alt="+&#8734;" />';
		else
			output += (score.valuationPC !== null ? score.valuationPC+'%' : score.valuation);
		output += '</td>';

		//- Deep score
		output += '<td>';
		if (score.valuationSolver == this.constants.owner.black*this.constants.score.infinite)
			output += '<img src="images/mate_'+this.constants.owner.white+'.png" title="White wins" alt="-&#8734;" />';
		else if (score.valuationSolver == this.constants.owner.white*this.constants.score.infinite)
			output += '<img src="images/mate_'+this.constants.owner.black+'.png" title="Black wins" alt="+&#8734;" />';
		else
			output += (score.valuationSolverPC !== null ? score.valuationSolverPC+'%' : score.valuationSolver);
		if (pNode.nodes[i].hasOwnProperty('_opportunity') &&
			(Math.abs(pNode.nodes[i].valuationSolver) != this.constants.score.infinite)
		) {
			output += '<td>';
			switch (pNode.nodes[i]._opportunity)
			{
				case '-': output += '<img src="images/opportunity_0.png" title="Risk of defeat" />';			break;
				case '±': output += '<img src="images/opportunity_1.png" title="Uncertain end of game" />';		break;
				case '+': output += '<img src="images/opportunity_2.png" title="Opportunity of victory" />';	break;
				default : throw 'Internal error - Report any error (#016)';
			}
			output += '</td>';
		}
		else
			output += '<td></td>';
		output += '</td></tr>';
	}

	//-- Final text
	return (output.length === 0 ? '' :
				'<table class="ui-table" data-role="table" data-mode="table">' +
				'<thead><tr class="th-groups"><th></th><th colspan="3">Evaluation</th></tr>' +
				'<tr><th data-priority="1">Move</th><th data-priority="2">Static</th><th data-priority="3">Deep</th><th data-priority="4">&nbsp;</th></tr></thead>' +
				'<tbody>' +
				output +
				'</tbody></table>');
};

AntiCrux.prototype.toHtml = function(pNode) {
	var x, y, rotated, color, abc, owner, output;

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
					owner = (pNode.owner[8*y+x] != this.constants.owner.none ? this.constants.owner.white : pNode.owner[8*y+x]);
					break;
				case 2:
					owner = (pNode.owner[8*y+x] != this.constants.owner.none ? this.constants.owner.black : pNode.owner[8*y+x]);
					break;
				case 3:
					owner = this.constants.owner.none;
					break;
				case 4:
					if (pNode.owner[8*y+x] == this.constants.owner.none)
						owner = this.constants.owner.none;
					else
					{
						if (Math.floor(100*Math.random()) % 2 === 0)
							owner = this.constants.owner.black;
						else
							owner = this.constants.owner.white;
					}
					break;
				default:
					owner = pNode.owner[8*y+x];
					break;
			}
			output += '<div class="AntiCrux-board-cell-' + (this._highlight.indexOf(8*y+x) != -1 ? 'hl' : color) + ' AntiCrux-board-piece-' + owner + pNode.piece[8*y+x] + '" data-xy="' + abc[x] + (8-y) + '">';
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

AntiCrux.prototype.toFen = function(pNode) {
	// https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
	// https://www.chessclub.com/user/help/PGN-spec

	var i, output, empty, piece;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (!this._has(pNode, 'piece', true) || !this._has(pNode, 'owner', true))
		return '';

	//-- Builds the FEN code for the main board
	output = '';
	empty = 0;
	for (i=0 ; i<64 ; i++)
	{
		//Piece
		if (pNode.owner[i] == this.constants.owner.none)
			empty++;
		else
		{
			if (empty > 0)
			{
				output += empty;
				empty = 0;
			}

			//Identifies a piece
			piece = this.constants.piece.mapping_rev[pNode.piece[i]];
			if (pNode.owner[i] == this.constants.owner.black)
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
	if (pNode.player == this.constants.owner.black)
		output += ' b';
	else
		output += ' w';

	//-- Castling doesn't exist for AntiChess
	output += ' -';

	//-- En passant
	if (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant)
		output += ' ' + ('abcdefgh'[pNode.enpassant%8]);
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

AntiCrux.prototype.toText = function(pNode) {
	// Use one of the fonts "Chess" available at www.dafont.com

	var x, y, rotated, i, b, car, buffer, owner;

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

			//- Owner
			switch (this.options.variant.pieces)
			{
				case 1:
					owner = (pNode.owner[i] != this.constants.owner.none ? this.constants.owner.white : pNode.owner[i]);
					break;
				case 2:
					owner = (pNode.owner[i] != this.constants.owner.none ? this.constants.owner.black : pNode.owner[i]);
					break;
				case 3:
					owner = this.constants.owner.none;
					break;
				case 4:
					if (pNode.owner[i] == this.constants.owner.none)
						owner = this.constants.owner.none;
					else
					{
						if (Math.floor(100*Math.random()) % 2 === 0)
							owner = this.constants.owner.black;
						else
							owner = this.constants.owner.white;
					}
					break;
				default:
					owner = pNode.owner[i];
					break;
			}

			//- Nature of the position
			switch (owner)
			{
				case this.constants.owner.none:
					car = (b ? '+' : '*');
					break;
				case this.constants.owner.white:
					car = ' prnbqk'[pNode.piece[i]];
					break;
				case this.constants.owner.black:
					car = ' otmvwl'[pNode.piece[i]];
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

AntiCrux.prototype.toPgn = function(pHeader) {
	// https://www.chessclub.com/user/help/PGN-spec

	var	lf_setheader, pgn,
		i, e, turn, moveStr, symbols;

	//-- Checks
	if (!this._has(this, '_history', true) || !this._has(this, '_history_fen0', true))
		return '';

	//-- Prepares the header
	if (typeof pHeader !== 'object')
		pHeader = {};
	lf_setheader = function (pKey, pValue) {
		if (!pHeader.hasOwnProperty(pKey))
			pHeader[pKey] = pValue;
	};

	lf_setheader('Event', 'Game');
	lf_setheader('Site', 'https://github.com/ecrucru/anticrux/');
	lf_setheader('Date', (new Date().toISOString().slice(0, 10)));
	if (this.options.board.rotated)
	{
		lf_setheader('White', 'AntiCrux ' + this.options.ai.version + (this._lastLevel===null?'':' - Level '+this._lastLevel));
		lf_setheader('Black', 'You');
	}
	else
	{
		lf_setheader('White', 'You');
		lf_setheader('Black', 'AntiCrux ' + this.options.ai.version + (this._lastLevel===null?'':' - Level '+this._lastLevel));
	}
	lf_setheader('Termination', 'normal');
	lf_setheader('Result', '*');
	if (this.hasSetUp())
	{
		lf_setheader('SetUp', '1');
		lf_setheader('FEN', this._history_fen0);
	}
	lf_setheader('PlyCount', this._history.length);
	lf_setheader('Variant', 'antichess');
	lf_setheader('TimeControl', '-');

	//-- Builds the header
	pgn = '';
	for (e in pHeader)
	{
		if (typeof pHeader[e] === 'string')
			pgn += '['+e+' "'+pHeader[e].split('"').join("'")+'"]' + "\n";
		else
			pgn += '['+e+' "'+pHeader[e]+'"]' + "\n";
	}
	pgn += "\n";

	//-- Deactivates the symbols
	symbols = this.options.board.symbols;
	this.options.board.symbols = false;

	//-- Loads the initial position
	this._initHelper();
	this._helper.copyOptions(this);
	if (!this._helper.loadFen(this._history_fen0))
		return '';

	//-- Moves
	turn = 0;
	for (i=0 ; i<this._history.length ; i++)
	{
		//- Next turn
		if (i % 2 === 0)
			pgn += (turn>0 ? ' ' : '') + (++turn) + '.';

		//- Move
		moveStr = this._helper.moveToString(this._history[i]);
		if (this._helper.movePiece(this._history[i], true, this._helper.getPlayer()) == this._helper.constants.move.none)
			throw 'Internal error - Report any error (#011)';
		else
		{
			pgn += ' ' + moveStr;
			this._helper.updateHalfMoveClock();
			this._helper.logMove(this._history[i]);
			this._helper.switchPlayer();
		}
	}

	//-- Final position
	if (pHeader.Result != '*')
		pgn += '# ' + pHeader.Result;
	else
		switch (this._helper.getWinner())
		{
			case this._helper.constants.owner.white:
				pgn += '# 1-0';
				pgn = pgn.replace('[Result "*"]', '[Result "1-0"]');
				break;
			case this._helper.constants.owner.black:
				pgn += '# 0-1';
				pgn = pgn.replace('[Result "*"]', '[Result "0-1"]');
				break;
			case this._helper.constants.owner.none:
				if (this._helper.isDraw())
				{
					pgn += '# 1/2-1/2';
					pgn = pgn.replace('[Result "*"]', '[Result "1/2-1/2"]');
				}
				break;
		}

	//-- Restores the symbols
	this.options.board.symbols = symbols;

	//-- Result
	return pgn;
};

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
			car = this.constants.piece.mapping_rev[pNode.piece[i]];
			switch (pNode.owner[i])
			{
				case this.constants.owner.white:
					car = car.toUpperCase();
					break;
				case this.constants.owner.black:
					car = car.toLowerCase();
					break;
				case this.constants.owner.none:
					if (!pBorder && (pNode.piece[i] == this.constants.owner.none))
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

AntiCrux.prototype.freeMemory = function() {
	var count;
	this._buffer = '';
	count = this._ai_nodeFreeMemory(this._root_node);
	this._ai_gc();
	return count;
};


//---- Events

AntiCrux.prototype.callbackExploration = null;


//---- Private members

AntiCrux.prototype._init = function() {
	//-- Constants
	this.constants = {
		piece : {
			none   : 0,							//Must be zero
			pawn   : 1,
			rook   : 2,
			knight : 3,
			bishop : 4,
			queen  : 5,
			king   : 6							//Must be the highest ID
		},
		owner : {
			black  : -1,						//Negative points are black
			none   : 0,
			white  : 1							//Positive points are white
		},
		score : {
			infinite : 16777217,				//8^8+1
			neutral  : 0
		},
		board : {
			classicalFischer : 519
		},
		move : {
			none : 0
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
	this.constants.piece.mapping_rev[this.constants.piece.none]   = '';
	this.constants.piece.mapping_rev[this.constants.piece.pawn]   = 'P';
	this.constants.piece.mapping_rev[this.constants.piece.rook]   = 'R';
	this.constants.piece.mapping_rev[this.constants.piece.knight] = 'N';
	this.constants.piece.mapping_rev[this.constants.piece.bishop] = 'B';
	this.constants.piece.mapping_rev[this.constants.piece.queen]  = 'Q';
	this.constants.piece.mapping_rev[this.constants.piece.king]   = 'K';

	//-- Options
	this.options = {
		ai : {
			version : '0.2.1',							//Version of AntiCrux
			elo : 1750,									//Approximative strength of the algorithm
			valuation : [],								//Valuation of each piece
			maxDepth : 12,								//Maximal depth for the search dependant on the simplification of the tree
			maxNodes : 100000,							//Maximal number of nodes before the game exhausts your memory (0=Dangerously infinite)
			minimizeLiberty : true,						//TRUE allows a deeper inspection by forcing the moves, FALSE does a complete evaluation
			maxReply : 1,								//Number >=1 corresponding to the maximal number of moves that a player is allowed in return when minimizeLiberty is enabled
			noStatOnForcedMove : false,					//TRUE plays faster but the player won't be able to check the situation
			wholeNodes : true,							//TRUE evaluates the depths until the limit is reached and makes the analysis stronger
			randomizedSearch : true,					//TRUE helps the game to not played the same pieces
			pessimisticScenario : true,					//TRUE makes the algorithm stronger, FALSE is more random
			bestStaticScore : true,						//TRUE makes the algorithm stronger, FALSE is more random for low determined situations
			opportunistic : false,						//TRUE helps to find a winning position
			handicap : 0,								//To weaken the algorithm, remove between 0% and 100% of the moves above a fixed number of moves
			acceleratedEndGame : true,					//TRUE makes more direct kills but doesn't change the output
			oyster : false								//TRUE is a full random play
		},
		variant : {
			enPassant : true,							//TRUE activates the move "en passant" (some AI doesn't manage IT)
			promoteQueen : false,						//TRUE only promotes pawns as queen
			activePawns : false,						//TRUE makes the pawns stronger for the valuation once they are moved, and are consequently less mobile
			pieces : 0									//Variant for the pieces: 0=normal, 1=white pieces, 2=black pieces, 3=blind, 4=random
		},
		board : {
			rotated : false,							//TRUE rotates the board at 180°
			symbols : false,							//Symbols in Unicode for the display
			fischer : this.getNewFischerId(),			//Default layout (519=classical)
			coordinates : true,							//TRUE displays the coordinates around the board
			noStatOnOwnMove : true,						//TRUE plays faster but the player won't be able to know if he played the right wove
			decisionTree : false,						//TRUE activates the visualization of the decision tree at the cost of memory
			fullDecisionTree : false,					//TRUE displays the full decision tree in the user interface and this may represent too much data. The option is essentially used for debugging purposes
			analysisDepth : 5,							//Depth for the analysis of the possible moves
			debugCellId : false							//TRUE display the internal identifier of every cell of the board when there is no piece on it
		}
	};
	this.options.ai.valuation[ this.constants.piece.none  ] =   0;
	this.options.ai.valuation[ this.constants.piece.pawn  ] = 100;
	this.options.ai.valuation[-this.constants.piece.pawn  ] = 180;	//A pawn is more active when it is released
	this.options.ai.valuation[ this.constants.piece.rook  ] = 500;
	this.options.ai.valuation[ this.constants.piece.knight] = 300;
	this.options.ai.valuation[ this.constants.piece.bishop] = 300;
	this.options.ai.valuation[ this.constants.piece.queen ] = 900;
	this.options.ai.valuation[ this.constants.piece.king  ] = 250;

	//-- General variables
	this._helper = null;								//You can't refer to that variable without calling first _initHelper()
	this._buffer_fischer = [];							//You can't refer to that variable without calling first _initFischer()
	this._lastLevel = null;
};

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

AntiCrux.prototype._initHelper = function() {
	if (this._helper === null)
		this._helper = new AntiCrux();
};

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

AntiCrux.prototype._ai_nodeCopy = function(pNode, pFull) {
	//-- Clones the node
	var	newNode = {
		player	: pNode.player,
		piece	: pNode.piece.slice(0),
		owner	: pNode.owner.slice(0)
	};
	if (pNode.hasOwnProperty('enpassant'))
		newNode.enpassant = pNode.enpassant;

	//-- Extends the copy
	if (pFull)
	{
		if (pNode.hasOwnProperty('valuation'))
			newNode.valuation = pNode.valuation;
		if (pNode.hasOwnProperty('valuationSolver'))
			newNode.valuationSolver = pNode.valuationSolver;
		if (pNode.hasOwnProperty('moves'))
			newNode.moves = pNode.moves.slice(0);
		if (pNode.hasOwnProperty('_pendingPromotion'))
			newNode._pendingPromotion = pNode._pendingPromotion;
	}

	//-- Result
	return newNode;
};

AntiCrux.prototype._ai_nodeShrink = function(pNode) {
	var f;
	for (f in pNode)
		if (['owner', 'piece', 'player', 'enpassant', '_pendingPromotion'].indexOf(f) === -1)
			delete pNode[f];
};

AntiCrux.prototype._ai_nodeInventory = function(pPlayer, pPiece, pColumn, pNode) {
	var i, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Counts
	counter = 0;
	for (i=0 ; i<64 ; i++)
		if (	((pNode.owner[i] == pPlayer) || (pPlayer === null)) &&
				((pNode.piece[i] == pPiece ) || (pPiece  === null))
		) {
			if (pColumn !== undefined)
				if (i%8 != pColumn)
					continue;
			counter++;
		}
	return counter;
};

AntiCrux.prototype._ai_nodeCountPiece = function(pPlayer, pNode) {
	var i, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Counts
	counter = 0;
	for (i=0 ; i<64 ; i++)
		counter += (pNode.owner[i] == pPlayer ? 1 : 0);
	return counter;
};

AntiCrux.prototype._ai_nodeLocatePiece = function(pPlayer, pPiece, pNode) {
	var x, y;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Locates the piece
	for (y=0 ; y<8 ; y++)
		for (x=0 ; x<8 ; x++)
			if (	((pNode.owner[8*y+x] == pPlayer) || (pPlayer === null)) &&
					((pNode.piece[8*y+x] == pPiece ) || (pPiece  === null))
			)
				return {x:x, y:y};
	return null;
};

AntiCrux.prototype._ai_nodeMoves = function(pNode) {
	var i, x, y, t, epX, epY, tX, tY,
		move_base, moves, forced,
		directionX, directionY, directionXY;

	//-- Local functions (macros)
	var that = this;
	var moveLegit = function(pY, pX, pKill, pRestricted) {
		var target_type, opponent, promo_move, promoted;

		//- Boundaries
		if ((pX<0) || (pX>7) || (pY<0) || (pY>7))
			return false;

		//- Validity
		target_type = pNode.owner[8*pY+pX];
		opponent =	(target_type != pNode.player) &&
					(target_type != that.constants.owner.none);			//Target is opponent
		if ((target_type == pNode.player) || (opponent && !pKill))		//Impossible move
			return false;

		//- Forced move
		if (opponent && !forced)
		{
			moves = [];
			forced = true;
		}

		//- Logs the move
		if (opponent || (!opponent && !forced && !pRestricted))
		{
			//Promotes a pawn
			promoted = false;
			if (pNode.piece[8*y+x] == that.constants.piece.pawn)
			{
				if (	((pY === 0) && (pNode.owner[8*y+x] == that.constants.owner.white)) ||
						((pY === 7) && (pNode.owner[8*y+x] == that.constants.owner.black))
				  )
				{
					promo_move = move_base + 10*pY + pX;
					moves.push(promo_move + 10000*that.constants.piece.queen);		//All the promotions will be analyzed later to eliminate the wrong one
					if (!that.options.variant.promoteQueen)
					{
						moves.push(promo_move + 10000*that.constants.piece.rook);
						moves.push(promo_move + 10000*that.constants.piece.knight);
						moves.push(promo_move + 10000*that.constants.piece.bishop);
						moves.push(promo_move + 10000*that.constants.piece.king);
					}
					promoted = true;
				}
			}

			//Normal move
			if (!promoted)
				moves.push(move_base + 10*pY + pX);
		}

		//- Result
		return !opponent;
	};

	//-- Checks
	if ((pNode === undefined) || (pNode === null))
		return;

	//-- Scans every position
	forced = false;
	moves = [];
	for (y=0 ; y<8 ; y++)
	{
		for (x=0 ; x<8 ; x++)
		{
			i = 8*y + x;

			//- Initialization for the piece
			if (pNode.owner[i] != pNode.player)
				continue;
			move_base = y*1000 + x*100;

			//- Processing of the piece
			switch (pNode.piece[i])
			{
				case this.constants.piece.none:
					continue;

				case this.constants.piece.pawn:
					directionY = -pNode.player;

					// Straight and by side
					if (moveLegit(y+directionY, x, false, false))
					{
						if (((directionY==-1) && (y==6)) ||
							((directionY== 1) && (y==1))
						)
							moveLegit(y+2*directionY, x, false, false);
					}
					moveLegit(y+directionY, x-1, true, true);
					moveLegit(y+directionY, x+1, true, true);

					// En passant
					if (pNode.hasOwnProperty('enpassant') && this.options.variant.enPassant)
					{
						//Source pawn at y/x
						//Mid position at epX/epY
						epX = pNode.enpassant % 8;
						epY = Math.floor(pNode.enpassant / 8);
						//Target pawn at tY/tX
						tX = epX;
						tY = epY-directionY;
						//Check
						if ((epX>=0) && (epX<=7) && (epY>=0) && (epY<=7) &&				//Assumed to be always true
							( tX>=0) && ( tX<=7) && ( tY>=0) && ( tY<=7) &&				//Assumed to be always true
							(Math.abs(epX-x) == 1) && (epY-y == directionY) &&			//Right distance
							(pNode.piece[i        ] == this.constants.piece.pawn) &&	//Right exchanged pieces
							(pNode.piece[8*epY+epX] == this.constants.piece.none) &&
							(pNode.piece[8* tY+ tX] == this.constants.piece.pawn) &&
							(pNode.owner[8*epY+epX] != pNode.owner[8*tY+tX])
						) {
							if (!forced)
								moves = [];
							forced = true;
							moves.push(move_base + 10*epY + epX);
						}
					}
					break;

				case this.constants.piece.queen:
				case this.constants.piece.rook:
					// Moves
					for (directionX=1 ; directionX<8 ; directionX++)
						if (!moveLegit(y, x+directionX, true, false))
							break;
					for (directionX=1 ; directionX<8 ; directionX++)
						if (!moveLegit(y, x-directionX, true, false))
							break;
					for (directionY=1 ; directionY<8 ; directionY++)
						if (!moveLegit(y+directionY, x, true, false))
							break;
					for (directionY=1 ; directionY<8 ; directionY++)
						if (!moveLegit(y-directionY, x, true, false))
							break;
					if (pNode.piece[i] == this.constants.piece.rook)		// Queen = Rook + Bishop
						break;
					//else no break, yes !

				case this.constants.piece.bishop:
					for (directionXY=1 ; directionXY<8 ; directionXY++)
						if (!moveLegit(y+directionXY, x+directionXY, true, false))
							break;
					for (directionXY=1 ; directionXY<8 ; directionXY++)
						if (!moveLegit(y+directionXY, x-directionXY, true, false))
							break;
					for (directionXY=1 ; directionXY<8 ; directionXY++)
						if (!moveLegit(y-directionXY, x+directionXY, true, false))
							break;
					for (directionXY=1 ; directionXY<8 ; directionXY++)
						if (!moveLegit(y-directionXY, x-directionXY, true, false))
							break;
					break;

				case this.constants.piece.king:
					for (directionX=-1 ; directionX<=1 ; directionX++)
					{
						for (directionY=-1 ; directionY<=1 ; directionY++)
						{
							if ((directionX === 0) && (directionY === 0))
								continue;
							moveLegit(y+directionY, x+directionX, true, false);
						}
					}
					break;

				case this.constants.piece.knight:
					moveLegit(y-2, x-1, true, false);
					moveLegit(y-2, x+1, true, false);
					moveLegit(y+2, x-1, true, false);
					moveLegit(y+2, x+1, true, false);
					moveLegit(y-1, x-2, true, false);
					moveLegit(y-1, x+2, true, false);
					moveLegit(y+1, x-2, true, false);
					moveLegit(y+1, x+2, true, false);
					break;

				default:
					throw 'Internal error - Report any error (#003)';
			}
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

AntiCrux.prototype._ai_nodeCreateNodes = function(pNode) {
	var i, node;

	//-- Checks
	if (!pNode.hasOwnProperty('moves') || !pNode.hasOwnProperty('player'))
		return;

	//-- Builds the new sub-nodes
	pNode.nodes = [];
	for (i=0 ; i<pNode.moves.length ; i++)
	{
		//- Moves the piece
		node = this._ai_nodeCopy(pNode, false);
		if (this.movePiece(pNode.moves[i], false, pNode.player, node) == this.constants.move.none)
			throw 'Internal error - Report any error (#013)';
		this.switchPlayer(node);
		pNode.nodes.push(node);
	}
};

AntiCrux.prototype._ai_nodeRecurseTree = function(pPlayer, pDepth, pNode) {
	var	i, p, min_moves;

	//-- Checks
	if ((pNode === undefined) || (pNode === null))
		return;

	//-- Builds the sub-nodes for the decision tree
	if ((this.options.ai.handicap > 0) && (pNode.player == pPlayer))
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
	min_moves = this.constants.score.infinite;
	for (i=0 ; i<pNode.nodes.length ; i++)					//For each situation to be played by the opponent...
	{
		if (!pNode.nodes[i].hasOwnProperty('moves'))
			this._ai_nodeMoves(pNode.nodes[i]);
		if (this.options.ai.minimizeLiberty && (pNode.nodes[i].player != pPlayer))
			if ((pNode.nodes[i].moves.length >= this.options.ai.maxReply) && (pNode.nodes[i].moves.length < min_moves))
				min_moves = pNode.nodes[i].moves.length;
	}
	for (i=pNode.nodes.length-1 ; i>=0 ; i--)
	{
		if ((pNode.player == pPlayer) && (pNode.nodes[i].moves.length > min_moves))
		{
			pNode.moves.splice(i, 1);
			pNode.nodes.splice(i, 1);
		}
		else
		{
			this._numNodes++;
			if (!pNode.nodes[i].hasOwnProperty('valuation'))
				pNode.nodes[i].valuation = this._ai_nodeValuate(pNode.nodes[i]).valuation;
			if (	(pDepth >= this.options.ai.maxDepth) ||
					((this.options.ai.maxNodes !== 0) && (this._numNodes >= this.options.ai.maxNodes))
			)
				;		//No recursive search
			else
				this._ai_nodeRecurseTree(pPlayer, pDepth+1, pNode.nodes[i]);
		}
	}
};

AntiCrux.prototype._ai_nodeValuate = function(pNode) {
	var i, val, result;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, 'piece', true) || !this._has(pNode, 'owner', true))
		return {
			black				: 0,
			white				: 0,
			scale				: 1,
			valuation			: (pNode.hasOwnProperty('valuation') ? pNode.valuation : '-'),
			valuationPC			: null,
			valuationSolver		: (pNode.hasOwnProperty('valuationSolver') ? pNode.valuationSolver : '-'),
			valuationSolverPC	: null
		};

	//-- Initialization
	result = {
		black				: 0,
		white				: 0,
		scale				: 0,
		valuation			: 0,
		valuationPC			: 0,
		valuationSolver		: 0,
		valuationSolverPC	: 0
	};

	//-- Gets the valuation per player
	for (i=0 ; i<64 ; i++)
	{
		//- Determines the value of the piece
		if	(	this.options.variant.activePawns &&
				(pNode.piece[i] == this.constants.piece.pawn) &&
				(	((pNode.owner[i] == this.constants.owner.black) && (Math.floor(i/8) != 1)) ||
					((pNode.owner[i] == this.constants.owner.white) && (Math.floor(i/8) != 6))
				)
		)
			val = this.options.ai.valuation[-pNode.piece[i]];
		else
			val = this.options.ai.valuation[pNode.piece[i]];

		//- Assigns the value to the right player
		switch (pNode.owner[i])
		{
			case this.constants.owner.black:
				result.black += val;
				break;
			case this.constants.owner.white:
				result.white += val;
				break;
			case this.constants.owner.none:
				break;
			default:
				throw 'Internal error - Report any error (#014)';
		}
	}

	//-- Valuates the position
	if (result.black === 0)
		result.valuation = this.constants.owner.white * this.constants.score.infinite;		//No more piece for Black
	else if (result.white === 0)
		result.valuation = this.constants.owner.black * this.constants.score.infinite;		//No more piece for White
	else
		result.valuation =	this.constants.owner.black * result.black +						//Normal case
							this.constants.owner.white * result.white;

	//-- No possible move anymore
	if (pNode.hasOwnProperty('moves'))
		if (pNode.moves.length === 0)
			result.valuation = pNode.player * -this.constants.score.infinite;

	//-- Scale
	result.scale = (result.black > result.white ? result.black : result.white);
	if (result.scale === 0)
	{
		result.valuation = 0;
		result.scale = 1;
	}

	//-- Static percentage
	result.valuationPC = Math.round(100*result.valuation/result.scale);
	result.scale = Math.round(result.scale);
	result.valuation = Math.round(result.valuation);

	//-- Deep score
	result.valuationSolver = (pNode.hasOwnProperty('valuationSolver') ?
									pNode.valuationSolver :
									result.valuation);
	if (Math.abs(result.valuationSolver) > result.scale)		//A deep promotion can generate a valuation greater than the current static valuation
		result.scale = Math.abs(result.valuationSolver);

	//-- Deep percentage
	result.valuationSolverPC = Math.round(2*(100*(result.valuationSolver+result.scale)/(2*result.scale) - 50));

	//-- Result
	return result;
};

AntiCrux.prototype._ai_nodeSolve = function(pPlayer, pDepth, pPath, pNode) {
	var i, has, hasNode, allForced, hasForced, condition, threshold, val, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	hasNode = this._has(pNode, 'nodes', true);

	//-- Path of the moves
	if (	this.options.board.decisionTree &&
			hasNode &&
			(pDepth <= this.options.board.analysisDepth)
	) {
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			//- Path of the moves
			if (!pNode.nodes[i].hasOwnProperty('path'))
				pNode.nodes[i].path = pPath;
			if (pNode.nodes[i].path.length > 0)
				pNode.nodes[i].path += '¦';
			pNode.nodes[i].path += this.moveToString(pNode.moves[i], pNode);
		}
	}

	//-- Checks the maximal depth
	if (!hasNode)
	{
		//- Applies the valuation for the solver
		pNode.valuationSolver = pNode.valuation;
		pNode._forced = true;						//All the lowest levels are defined as forced moves
		if (pNode.valuationSolver == pPlayer*-this.constants.score.infinite)
		{
			pNode._sequence = 1;					//The sequence will help for quicker (or longer ;-) when losing) ends of game
			pNode._opportunity = '+';
		}
		else if (pNode.valuationSolver == pPlayer*this.constants.score.infinite)
			pNode._opportunity = '-';

		//- Memory
		if (pDepth > 1)								//This condition is needed to display the score in HTML format
		{
			delete pNode.owner;
			delete pNode.piece;
		}
		return;
	}

	//-- Sets the flag for the forced moves and opportunities + Updates the lowest valuations recursively
	allForced = true;
	hasForced = false;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		//- Valuation
		this._ai_nodeSolve(pPlayer, pDepth+1, pNode.nodes[i].path, pNode.nodes[i]);

		//- Forced moves
		has = pNode.nodes[i].hasOwnProperty('_forced');
		if (!has || !pNode.nodes[i]._forced)
			allForced = false;
		else if (has && pNode.nodes[i]._forced)
			hasForced = true;

		//- Opportunities
		if (pNode.nodes[i].hasOwnProperty('_opportunity'))
		{
			if (!pNode.hasOwnProperty('_opportunity'))
				pNode._opportunity = pNode.nodes[i]._opportunity;
			if (pNode._opportunity != pNode.nodes[i]._opportunity)
				pNode._opportunity = '±';
		}
	}
	if ((pNode.player == pPlayer) && hasForced)
		pNode._forced = hasForced;
	else if ((pNode.player != pPlayer) && allForced)
		pNode._forced = allForced;

	//-- Removes the wrong nodes to always play the forced moves with the highest damage
	if ((pNode.player == pPlayer) && hasForced)
	{
		threshold = pPlayer * this.constants.score.infinite;

		//- Finds the valuation of the forced moves
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (!this._has(pNode.nodes[i], '_forced'))
			{
				pNode.moves.splice(i, 1);
				pNode.nodes.splice(i, 1);
				continue;
			}

			// Determines the best threshold
			if (((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuationSolver < threshold)) ||
				((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuationSolver > threshold))
			)
				threshold = pNode.nodes[i].valuationSolver;
		}

		//- Remove the weak moves
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (pNode.nodes[i].valuationSolver != threshold)
			{
				pNode.moves.splice(i, 1);
				pNode.nodes.splice(i, 1);
			}
		}
	}

	//-- Evaluates the current node by using an average (default calculation)
	// Remark: for forced moves, it should keep the same value
	condition = ((pNode.player == pPlayer) || !this.options.ai.pessimisticScenario);
	if (condition)
	{
		pNode.valuationSolver = 0;
		counter = 0;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (Math.abs(pNode.nodes[i].valuationSolver) == this.constants.score.infinite)	//For the weakest levels...
			{
				if (pNode.nodes[i].valuationSolver == pPlayer*this.constants.score.infinite)
				{
					counter = 0;		//...a loosing position is considered else the end of game is abnormally easy
					break;
				}
				else
					continue;			//...a winning position is voluntarily ignored. The combinations must be good in average which gives the human player the possibility to react
			}
			pNode.valuationSolver += pNode.nodes[i].valuationSolver;
			counter++;
		}
		if (counter !== 0)
		{
			pNode.valuationSolver = Math.round(pNode.valuationSolver/counter);	//Always integer !
			if (pDepth > 1)
			{
				delete pNode.owner;
				delete pNode.piece;
			}
		}
		else
			condition = false;			//The valuation will follow the other rule
	}

	//-- Evaluates the current node by using the worst valuation
	if (!condition)
	{
		val = pPlayer * -this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if ( ((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuationSolver > val)) ||
				 ((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuationSolver < val))
				)
				val = pNode.nodes[i].valuationSolver;
		}
		pNode.valuationSolver = val;
		if (pDepth > 1)
		{
			delete pNode.owner;
			delete pNode.piece;
		}
	}

	//-- Calculates the sequence which leads to a faster end of game
	if (this.options.ai.acceleratedEndGame && this._has(pNode, '_forced') && (pNode.valuationSolver == pPlayer*-this.constants.score.infinite))
	{
		val = this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (!pNode.nodes[i].hasOwnProperty('_sequence'))
				continue;
			if ((pNode.nodes[i]._sequence > 0) && (pNode.nodes[i]._sequence < val))
				val = pNode.nodes[i]._sequence;
		}
		if (val != this.constants.score.infinite)
			pNode._sequence = val+1;
	}
};

AntiCrux.prototype._ai_nodePick = function(pPlayer, pNode) {
	var	i, threshold, status, val,
		mixedStatic, mixedDeep,
		better, same, moves;

	//-- Local functions (macros)
	var mixture = function(pNode) {
		mixedStatic = null;
		mixedDeep = null;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			//- Initialization
			if (mixedStatic === null)
				mixedStatic = pNode.nodes[i].valuation;
			if (mixedDeep === null)
				mixedDeep = pNode.nodes[i].valuationSolver;

			//- Comparison
			if ((typeof mixedStatic !== 'boolean') && (mixedStatic != pNode.nodes[i].valuation))
				mixedStatic = true;
			if ((typeof mixedDeep !== 'boolean') && (mixedDeep != pNode.nodes[i].valuationSolver))
				mixedDeep = true;
		}
		if (typeof mixedStatic !== 'boolean')
			mixedStatic = false;
		if (typeof mixedDeep !== 'boolean')
			mixedDeep = false;
	};

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Keeps the moves which lead to fast end of game
	if (this.options.ai.acceleratedEndGame && this._has(pNode, '_forced') && (pNode.valuationSolver == pNode.player * -this.constants.score.infinite))
	{
		threshold = this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (this._has(pNode.nodes[i], '_forced') && (pNode.nodes[i]._sequence > 0) && (pNode.nodes[i]._sequence < threshold))
				threshold = pNode.nodes[i]._sequence;
		}
		if (threshold == this.constants.score.infinite)
			throw 'Internal error - Report any error (#006)';
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (pNode.nodes[i]._sequence != threshold)
			{
				pNode.moves.splice(i, 1);
				this._ai_nodeFreeMemory(pNode.nodes[i]);
				pNode.nodes.splice(i, 1);
			}
		}
	}

	//-- When there are still plenty of equivalent moves, we keep the ones having the best opportunity
	mixture(pNode);
	if (this.options.ai.opportunistic && (pNode.nodes.length > 1))
	{
		//- Finds the best status
		status = '';
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			val = (pNode.nodes[i].hasOwnProperty('_opportunity') ? pNode.nodes[i]._opportunity : ' ');
			if ((status.length === 0) || ('- ±+'.indexOf(val) > '- ±+'.indexOf(status)))
				status = val;
		}
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if ((pNode.nodes[i].hasOwnProperty('_opportunity') ? pNode.nodes[i]._opportunity : ' ') != status)
			{
				pNode.moves.splice(i, 1);
				this._ai_nodeFreeMemory(pNode.nodes[i]);
				pNode.nodes.splice(i, 1);
			}
		}
	}

	//-- Keeps the less risky static moves when we have plenty of moves
	mixture(pNode);
	if (this.options.ai.bestStaticScore && !mixedDeep && mixedStatic)	//At least 2 nodes are implied
	{
		threshold = pPlayer * this.constants.score.infinite;

		//- Finds the corresponding valuation
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			// Determines the best valuation
			if ( ((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuation < threshold)) ||
				 ((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuation > threshold))
				)
				threshold = pNode.nodes[i].valuation;
		}

		//- Removes the weak moves
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
		{
			if (pNode.nodes[i].valuation != threshold)
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
	threshold = pPlayer * this.constants.score.infinite;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		//- Comparison
		val = Math.round(pNode.nodes[i].valuationSolver);
		better = ((pPlayer == this.constants.owner.white) && (val < threshold)) ||
				 ((pPlayer == this.constants.owner.black) && (val > threshold));
		same   = ((pPlayer == this.constants.owner.white) && (val == threshold)) ||
				 ((pPlayer == this.constants.owner.black) && (val == threshold));

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

AntiCrux.prototype._ai_nodeTreeHtml = function(pDepth, pNode) {
	var that, fLimitDepth, fAbsScoreFormat, i, j, writeMode;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this.options.board.decisionTree)
		return;
	if (!this._has(pNode, 'nodes', true))
		return;

	//-- Library
	that = this;
	fLimitDepth = function(pNodeToCheck) {
		var i;
		for (i=0 ; i<pNodeToCheck.nodes.length ; i++)
			if (!pNodeToCheck.nodes[i].hasOwnProperty('path'))
				return true;
		return false;
	};
	fAbsScoreFormat = function(pValuation) {
		if (pValuation === null)
			return '-';
		else if (pValuation == that.constants.owner.black*that.constants.score.infinite)
			return '<img src="images/mate_'+that.constants.owner.white+'.png" title="White wins" alt="-&#8734;" />';
		else if (pValuation == that.constants.owner.white*that.constants.score.infinite)
			return '<img src="images/mate_'+that.constants.owner.black+'.png" title="Black wins" alt="+&#8734;" />';
		else
			return pValuation;
	};

	//-- Formats
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if (!pNode.nodes[i].hasOwnProperty('path'))
			continue;
		writeMode = (	(this.options.board.fullDecisionTree) ||
						(pDepth === 0) ||
						(pDepth === this.options.board.analysisDepth) ||
						!this._has(pNode.nodes[i], 'nodes', true) ||
						fLimitDepth(pNode)
					);

		//-- Line
		if (writeMode)
		{
			//- Valuation
			this._buffer += '<tr data-depth="'+pDepth+'">';
			this._buffer += '<td>' + fAbsScoreFormat(pNode.nodes[i].valuation) + '</td>';
			this._buffer += '<td>' + fAbsScoreFormat(pNode.nodes[i].valuationSolver) + '</td>';

			//- New move
			this._buffer += '<td>' + pNode.nodes[i].path.split('¦').join('</td><td>') + '</td>';
			for (j=pDepth+1 ; j<this.options.board.analysisDepth ; j++)
				this._buffer += '<td>&nbsp;</td>';
			this._buffer += '</tr>' + "\n";
		}

		//- Next level
		if (pNode.nodes[i].hasOwnProperty('nodes') && (pDepth+1 < this.options.board.analysisDepth))
			this._ai_nodeTreeHtml(pDepth+1, pNode.nodes[i]);
	}
};

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

AntiCrux.prototype._ai_gc = function() {
	//-- Garbage collector for V8 if run with the right option
	if ((typeof global == 'object') && (typeof global.gc == 'function'))
		global.gc();
};


//---- Node.js

if ((typeof module !== 'undefined') && module.exports)
	module.exports = AntiCrux;
