/*
	AntiCrux - Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile
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


// Interesting positions for playing with AntiCrux :
//		r1bqk1nr/p2npp1p/1p4p1/8/4P3/6P1/P4b1P/5BR1 w - -			Uncertain game
//		3q1b2/4p1pr/4P3/8/6b1/8/5P2/8 w - -							Quick win or deep loss
//		8/6k1/3p3p/1p5P/1P6/5p2/1p3P2/8 b - -						Pawn game
//		1r6/4npb1/n4k2/7P/P6R/P4K2/2P2P2/2R5 w - -					Mate in 6 to be found
//		2r1k1nr/p1pp1ppp/8/8/P7/1R3P2/2PP2PP/1NB1K1NR b - -			Mate in 9 to be found
//		1n1qk1n1/r1pp1p1r/1p6/8/8/1P4P1/2PK1P1P/1N3BNR w - -		Mate in 10 to be found
//		rnb4r/p1pk3p/5P2/8/1p6/1P3P2/P1PNP1P1/R3KBN1 b - -			Mate in 10 to be found
//		rn2k2r/ppp2p1p/5p2/8/8/N6P/PPPKPP1P/R1B2BNR b - -			Mate in 11 to be found
//		rnb4K/pppp1k1p/5p2/2b5/4n3/8/8/8 b - -						Mate in 13 to be found
//		rnb1kb1r/p1pp1ppp/7n/4P3/1p5R/1P6/P1P1PPP1/RNBQKBN1 w - -	Mate in 15 to be found

// Interesting positions which illustrate the implemented features :
//		8/7p/8/8/8/b7/1P6/1N6 w - -									Originating piece in movePiece() : xa3, bxa3, b2a3, b2xa3, b1a3, b1xa3, Nxa3 are OK
//		8/3P4/8/2P5/4P3/8/8/6r1 w - -								Average valuation for weak levels : ignoring the infinite values makes a blunder if promoted to bishop
//		7K/p1p1p3/7b/7p/8/2k1p3/8/8 b - -							Average valuation for weak levels : ignoring the infinite values makes a blunder when not playing Bg7
//		8/5k2/8/3P4/8/8/8/8 b - -									Accelerated end of game
//		8/P7/1p6/8/8/8/8/8 w - -									Accelerated end of game
//		k7/1p6/1P6/8/8/8/8/8 w - -									Accelerated end of game
//		5R2/8/2k5/8/8/8/8/8 w - -									Accelerated end of game (Rc8 and Rf6 are forbidden)
//		8/5P2/8/8/4k1p1/8/8/8 w - -									Promotion
//		8/2p5/8/3P4/8/8/8/8 w - -									En passant is a forced move
//		7r/7p/8/8/8/5R2/8/8 b - -									En passant if no impact on the other pieces
//		2Rn1b1r/1ppppppq/1k3n1p/8/1P6/6P1/2PPPPNP/1KBN1BQR w - -	Minimization of the liberty (Rxc7=no minimization, Rxd8=minimization)
//		1rbqk2r/Rppppp2/8/5n2/4P3/2P5/2P2PPP/1N2K1NR w - -			Highlight the evaluated moves only (see highlightMoves)
//		3R4/8/8/8/8/8/2p5/8 w - -									Effect of the option "No statistic on forced moves"
//		6R1/8/8/8/8/2k5/8/8 w - -									Hard to finish (maximal number of nodes, no game strategy)
//		8/6p1/4K3/8/7r/8/8/8 b - -									Hard to finish (maximal number of nodes)
//		k7/8/8/2R5/8/8/8/8 w - -									Exploration level by level
//		1n1k4/8/5n2/5p2/3P1P2/1P6/8/8 b - -							Nfd7 is the move of 1 knight only



//======== Main class
var AntiCrux = function() {
	this._root_node = {
		piece : [],
		owner : []
	};
	this._init();
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
		throw 'Error - AntiCrux.prototype.openUI() is restricted to NodeJS';
};

AntiCrux.prototype.clearBoard = function(pNode) {
	var i;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (!this._has(pNode, 'piece', false))
		pNode.piece = [];
	if (!this._has(pNode, 'owner', false))
		pNode.owner = [];

	//-- Clears the board
	this.freeMemory();
	pNode.player = this.constants.owner.white;
	this._buffer = '';
	this._highlight = [];
	pNode._history = [];
	pNode._history_fen0 = '';
	this.fischer = null;
	for (i=0 ; i<64 ; i++)
	{
		pNode.piece[i] = this.constants.piece.none;
		pNode.owner[i] = this.constants.owner.none;
	}
	pNode = {
		piece : pNode.piece,
		owner : pNode.owner
	};
};

AntiCrux.prototype.defaultBoard = function(pFischer, pNode) {
	var i, z, p, krn, pieces;

	//-- Self
	if (pFischer === undefined)
		pFischer = this.constants.board.classicalFischer;
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Clears the board
	this.clearBoard(pNode);
	if ((pFischer < 1) || (pFischer > 960))
		return false;
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
		pNode.piece[8*0+i] = pieces[i];
		pNode.piece[8*1+i] = this.constants.piece.pawn;
		pNode.piece[8*6+i] = this.constants.piece.pawn;
		pNode.piece[8*7+i] = pieces[i];

		pNode.owner[8*0+i] = this.constants.owner.black;
		pNode.owner[8*1+i] = this.constants.owner.black;
		pNode.owner[8*6+i] = this.constants.owner.white;
		pNode.owner[8*7+i] = this.constants.owner.white;
	}
	pNode._history_fen0 = this.toFen();
	return true;
};

AntiCrux.prototype.getNewFischerId = function() {
	return Math.floor(Math.random()*960)+1;
};

AntiCrux.prototype.loadFen = function(pFen, pNode) {
	var list, x, y, i, car;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (pFen.length === 0)
		return false;

	//-- Clears the board
	this.clearBoard(pNode);

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
			pNode.piece[8*y+x] = this.constants.piece.mapping[car];
			pNode.owner[8*y+x] = (car == car.toLowerCase() ? this.constants.owner.black : this.constants.owner.white);
			x++;
		}
		else
		{
			this.clearBoard(pNode);
			return false;
		}
	}

	//-- Current player
	if (list[1] === undefined)
		pNode.player = this.constants.owner.white;
	else
		pNode.player = (list[1] == 'b' ? this.constants.owner.black : this.constants.owner.white);

	//-- En-passant
	if ((list[3] !== undefined) && (list[3] !== '-'))
	{
		i = 'abcdefgh'.indexOf(list[3]);
		if (i !== -1)
			pNode.enpassant = 8*(pNode.player == this.constants.owner.white ? 2 : 5) + i;
	}

	//-- Final
	this._ai_nodeValuate();
	pNode._history_fen0 = this.toFen();
	this.fischer = this._discoverFischer(pNode);
	return true;
};

AntiCrux.prototype.loadLichess = function(pKey, pNode) {
	var that;

	//References :
	//	https://github.com/ornicar/lila#http-api
	//	https://en.lichess.org/api/game/oPUvsggeDeTg?with_fens=1&with_moves=1

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
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
			var fen0, moves, playerIndication, hist, node, i;

			//-- Checks the variant
			if (!that._has(data, 'variant', 'antichess'))
				return false;

			//-- Sets the initial position of the board
			node = {};
			if (that._has(data, 'initialFen', true))
				that.loadFen(data.initialFen, node);
			else
				that.defaultBoard(that.constants.board.classicalFischer, node);
			fen0 = that.toFen(node);

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
			hist = [];
			for (i=0 ; i<moves.length ; i++)
			{
				if (!that.movePiece(moves[i], true, playerIndication, node))
					return false;
				else
				{
					hist.push(node.lastMove);
					that.highlightMove(node.lastMove);
					playerIndication = (playerIndication == that.constants.owner.white ? that.constants.owner.black : that.constants.owner.white);
				}
			}

			//-- Result
			pNode.owner = node.owner;
			pNode.piece = node.piece;
			pNode.player = playerIndication;
			pNode._history = hist;
			pNode._history_fen0 = fen0;
			that.fischer = that._discoverFischer(pNode);
			return true;
		});
	return true;
};

AntiCrux.prototype.hasSetUp = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Position
	if (!this._has(pNode, '_history_fen0', true))
		return false;

	//-- Result
	return (pNode._history_fen0.substring(0,43) != 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
};

AntiCrux.prototype.getInitialPosition = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Result
	return (!this._has(pNode, '_history_fen0', true) ? '' : pNode._history_fen0);
};

AntiCrux.prototype.getPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Finds the player
	if (pNode.player === undefined)
		return this.constants.owner.none;
	else
		return pNode.player;
};

AntiCrux.prototype.setPlayer = function(pPlayer, pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Sets the player
	pNode.player = pPlayer;
};

AntiCrux.prototype.getPieceByCoordinate = function(pCoordinate, pNode) {
	var index;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!pCoordinate.match(/^[a-h][1-8]$/))
		return false;
	index = (8-parseInt(pCoordinate.charAt(1)))*8 + 'abcdefgh'.indexOf(pCoordinate.charAt(0));

	//-- Information
	return { owner: pNode.owner[index],
			 piece: pNode.piece[index]
		};
};

AntiCrux.prototype.movePiece = function(pMove, pCheckLegit, pPlayerIndication, pNode) {
	var	regex, player, node, moves, i, x, y, tX, tY, valid,
		move_promotion, move_fromY, move_fromX, move_toY, move_toX;

	//-- Self
	if (pMove === true)
		return false;
	if (pNode === undefined)
		pNode = this._root_node;
	if (this.hasPendingPromotion(pNode))
		return false;
	if (pPlayerIndication === undefined)
		pPlayerIndication = this.constants.owner.none;
	if (pNode === null)
		return false;

	//-- Converts from the external notation
	if (typeof pMove == 'string')
	{
		//- Decode the input string
		regex = pMove.match(/^([RNBQK])?([a-h]([0-9])?)?(x)?([a-h][0-9])(=[RNBQK])?\s?[\!|\+|\#|\-|\/|\=|\?]*$/); //case-sensitive, no castling
		if (regex === null)
			return false;

		//- Fixes the missing values
		for (i=0 ; i<regex.length ; i++)
			if (regex[i] === undefined)
				regex[i] = '';

		//- Promotion
		if (regex[6].length > 1)
			move_promotion = this.constants.piece.mapping[regex[6].substring(1)];
		else
			move_promotion = 0;

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
			return false;
		move_fromY = Math.floor(moves[0]/1000 ) % 10;
		move_fromX = Math.floor(moves[0]/100  ) % 10;
	}
	else
	{
		pMove = parseInt(pMove);
		if (pMove === 0)
			return false;
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
		return false;
	pMove = move_promotion*10000 + move_fromY*1000 + move_fromX*100 + move_toY*10 + move_toX;

	//-- Finds the player
	player = pNode.owner[8*move_fromY+move_fromX];
	if (player == this.constants.owner.none)
		return false;
	pNode.player = player;
	pNode.lastMove = pMove;

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
			return false;
		}
	}

	//-- En passant...
	//- Executes the move
	if (	this._has(pNode, 'enpassant', false) &&
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
			pNode.enpassant = null;
		}
	}
	//- Marks the cell
	else if (	(pNode.piece[8*move_fromY+move_fromX] == this.constants.piece.pawn) &&
				(Math.abs(move_toY-move_fromY) == 2)
	)
		pNode.enpassant = 4*(move_toY+move_fromY) + move_toX;
	//- Removes the cell
	else if (this._has(pNode, 'enpassant', false))
		pNode.enpassant = null;

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
	return true;
};

AntiCrux.prototype.getMoveAI = function(pPlayer, pNode) {
	var	i,
		maxDepth, curDepth, reg_x, reg_y, reg_mean_x, reg_mean_y, reg_sxx, reg_sxy, reg_a, reg_b, reg_estimate;

	//-- Checks
	if (pNode === undefined)
		pNode = this._root_node;
	if (pPlayer === undefined)
		pPlayer = this.getPlayer(pNode);
	if ((pPlayer != this.constants.owner.black) && (pPlayer != this.constants.owner.white))
		return null;
	this._buffer = '';

	//-- Pre-conditions
	if (this.hasPendingPromotion(pNode))
		return null;
	if (this.options.ai.maxDepth < 3)
		this.options.ai.maxDepth = 3;			//At depth 2, the algorithm doesn't attack...
	this._ai_nodeFreeMemory(pNode);				//Should be done by the calling program in any case
	pNode.player = pPlayer;
	maxDepth = this.options.ai.maxDepth;

	//-- End of game ?
	this._ai_nodeMoves(pNode);
	if (pNode.moves.length === 0)
		return null;

	//-- Oyster : you can't lose against this level
	if (this.options.ai.oyster)
	{
		this._numNodes = 0;
		this._reachedDepth = 0;
		return pNode.moves[Math.floor(Math.random() * (pNode.moves.length-1) + 0.5)];
	}

	//-- Builds the decision tree level by level
	reg_x = [];
	reg_y = [];
	for (curDepth=3 ; curDepth<=maxDepth ; curDepth++)
	{
		//- Explores to the temporary lowest level
		this._numNodes = 0;
		this.options.ai.maxDepth = curDepth;
		this._ai_nodeRecurseTree(pPlayer, 0, pNode);
		this._reachedDepth = curDepth;

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
		if (	(curDepth >= maxDepth) ||								//Max depth reached
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
	this._ai_nodeSolve(pPlayer, pNode);
	return this._ai_nodePick(pPlayer, pNode);
};

AntiCrux.prototype.predictMoves = function(pNode) {
	var subai, move, i, buffer;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (this.hasPendingPromotion(pNode))
		return 'Error : the position is waiting for a promotion.';

	//-- Duplicates the game
	this._ai_nodeFreeMemory(pNode);
	subai = new AntiCrux();
	subai.options.ai.maxDepth = 3;
	subai.options.ai.maxNodes = 0;
	subai.options.ai.wholeNodes = true;
	subai.options.board.symbols = this.options.board.symbols;
	if (!subai.loadFen(this.toFen(pNode)))
		return 'Error : the position cannot be loaded.';

	//-- End of game ?
	subai._ai_nodeMoves(subai._root_node);
	if (subai._root_node.moves.length === 0)
		return 'The game is over.';

	//-- Builds N levels of data
	buffer = '';
	for (i=0 ; i<5 ; i++)
	{
		//- Gets the move
		move = subai.getMoveAI();
		if (move === null)
		{
			subai.freeMemory();
			break;
		}
		if (buffer.length > 0)
			buffer += ' ';
		buffer += subai.moveToString(move);

		//- Next position
		subai.freeMemory();
		if (!subai.movePiece(move, true))
			throw 'Internal error - Report any error (#012)';
		else
			subai.switchPlayer();
	}

	//-- Result
	return 'The predicted moves are :' + "\n" + buffer + "\n" + "\n" + 'Score = ' + subai.getScore() + '%';
};

AntiCrux.prototype.logMove = function(pMove, pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;
	if (pMove === undefined)
	{
		if (this._has(pNode, 'lastMove', false))
			pMove = pNode.lastMove;
		else
			return false;
	}

	//-- Logs the move
	if (typeof pMove !== 'number')
		return false;
	else
	{
		pNode._history.push(pMove);
		return true;
	}
};

AntiCrux.prototype.undoMove = function(pNode) {
	var i, hist;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, '_history', true) || !this._has(pNode, '_history_fen0', true))
		return '';

	//-- Prepares the board
	hist = pNode._history.slice(0, pNode._history.length-1);
	this.loadFen(pNode._history_fen0, pNode);

	//-- Builds the new board
	for (i=0 ; i<hist.length ; i++)
	{
		if (!this.movePiece(hist[i], true, this.constants.owner.none, pNode))
			throw 'Internal error - Report any error (#004)';
		else
			this.switchPlayer(pNode);
	}
	pNode._history = hist;
	return true;
};
	
AntiCrux.prototype.getNumNodes = function() {
	return (this._numNodes === undefined ? 0 : this._numNodes);
};

AntiCrux.prototype.getReachedDepth = function() {
	return (this._reachedDepth === undefined ? 0 : this._reachedDepth);
};

AntiCrux.prototype.hasPendingPromotion = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Result
	return this._has(pNode, '_pendingPromotion', false);
};

AntiCrux.prototype.promote = function(pPiece, pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this.hasPendingPromotion(pNode))
		return false;

	//-- Transcodes
	if (typeof pPiece == 'string')
		pPiece = this.constants.piece.mapping[pPiece];

	//-- Promotes the piece
	pNode.piece[pNode._pendingPromotion] = (this.options.variant.promoteQueen ? this.options.piece.queen : pPiece);
	pNode.lastMove = (this.options.variant.promoteQueen ? this.options.piece.queen : pPiece)*10000 + (pNode.lastMove % 10000);
	pNode._pendingPromotion = null;
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
	if (pMove === null)
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
	if (this._has(pNode, 'enpassant', false))
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

AntiCrux.prototype.getScore = function(pNode) {
	var i, val, valD, valW, valB;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Gets the score per player
	valW = 0;
	valB = 0;
	for (i=0 ; i<64 ; i++)
	{
		val = this.options.ai.valuation[pNode.piece[i]];
		switch (pNode.owner[i])
		{
			case this.constants.owner.black:
				valB += val;
				break;
			case this.constants.owner.white:
				valW += val;
				break;
		}
	}

	//-- Final score
	valD = (valB > valW ? valB : valW);
	if (valD === 0)
		return 0;
	else
	{
		if (this._has(pNode, 'valuationSolver', false))
			val = pNode.valuationSolver;
		else
		{
			if (!this._has(pNode, 'valuation', false))
				this._ai_nodeValuate(pNode);
			val = pNode.valuation;
		}
		val = 2*(Math.round(100*(val+valD)/(2*valD))-50);

		//- Adjust the boundaries to correct the effects of the big weights representing a defeat/victory
		if (val < -100)
			val = -100;
		if (val > 100)
			val = 100;
		return val;
	}
};

AntiCrux.prototype.switchPlayer = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Switches the players
	if (pNode.player == this.constants.owner.white)
		pNode.player = this.constants.owner.black;
	else
		pNode.player = this.constants.owner.white;
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

AntiCrux.prototype.isDraw = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(this, '_reachedDepth', false) || !this._has(pNode, 'valuation', false) || !this._has(pNode, 'valuationSolver', false))
		return false;

	//-- Possible draw
	return (	(this._reachedDepth >= 5) &&															//Sufficient depth for the valuation
				(pNode.valuation === 0) &&																//Equal game on both side
				(pNode.valuationSolver === 0) &&														//No deep opportunity
				(this._ai_nodeInventory(this.constants.owner.black, null, undefined, pNode) <= 5) &&	//Few remaining pieces
				(this._ai_nodeInventory(this.constants.owner.white, null, undefined, pNode) <= 5)		//Few remaining pieces
			);
};

AntiCrux.prototype.isEndGame = function(pNode) {
	var node = this._ai_nodeCopy(pNode === undefined ? this._root_node : pNode, false);
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
	for (i=0 ; i<node.moves.length ; i++)
	{
		//- Disabled move
		if (node.moves[i] === 0)
			continue;
		//- Rejected move
		if (this._has(node, 'nodes', true))
			if (node.nodes[i] === null)
				continue;
		//- Considered move
		position = node.moves[i] % 100;
		this._highlight.push(8*Math.floor(position/10) + (position%10));
	}
};

AntiCrux.prototype.getHistory = function(pNode) {
	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Result
	return (!this._has(pNode, '_history', false) ? [] : pNode._history);
};

AntiCrux.prototype.getHistoryHtml = function(pNode) {
	var node, i, output;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, '_history', false) || !this._has(pNode, '_history_fen0', false))
		return '';
	if ((pNode._history.length === 0) || (pNode._history_fen0.length === 0))
		return '';

	//-- Initial position
	node = {};
	this.loadFen(pNode._history_fen0, node);

	//-- Builds the moves
	output = '<table class="ui-table AntiCrux-table" data-role="table">';
	for (i=0 ; i<pNode._history.length ; i++)
	{
		if (i % 2 === 0)
			output += '<tr><th>' + Math.floor((i+2)/2) + '</th>';
		output += '<td class="AntiCrux-history-item" data-index="'+i+'" title="Click to review this past move">' + this.moveToString(pNode._history[i], node) + '</td>';
		if (!this.movePiece(pNode._history[i], true, this.constants.owner.none, node))
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
	this._ai_nodeTreeHtml(0, '', pNode);
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
			'	<tbody>' +
					this._buffer +
			'	</tbody>' +
			'</table>';
};

AntiCrux.prototype.getMovesHtml = function(pPlayer, pNode) {
	var i, node, maxVal, output;

	//-- Fetches the result of the last calculation of the AI
	node = (pNode === undefined ? this._root_node : pNode);
	if (!this._has(node, 'nodes', false) || !this._has(node, 'moves', false))
	{
		node = this._ai_nodeCopy(node, false);
		node.player = pPlayer;
		this._ai_nodeMoves(node);
	}

	//-- Output
	output = '';
	if (this._has(node, 'nodes', true) && this._has(node, 'moves', true))
	{
		maxVal = this._ai_getMaxValuation(node);
		if (maxVal === 0)
			maxVal = 1;
		for (i=0 ; i<node.moves.length ; i++)
		{
			if (node.nodes[i] === null)
				continue;
			output += '<tr><td>' + this.moveToString(node.moves[i], node) + '</td>';
			if (node.nodes[i].hasOwnProperty('valuation'))
			{
				if (node.nodes[i].hasOwnProperty('valuationSolver'))
				{
					output += '<td>' + this._ai_formatScore(100*node.nodes[i].valuationSolver/maxVal, true);
					if (this._has(node.nodes[i], '_win', false) &&
						(Math.abs(node.nodes[i].valuationSolver) != this.constants.score.infinite)
					)
						output += ' <span title="Opportunity of victory">*</span>';
					output += '</td>';
				}
				else
					output += '<td></td>';
				output += '<td>' + this._ai_formatScore(100*node.nodes[i].valuation/maxVal, true) + '</td>';
			}
			else
				output += '<td></td><td></td>';
			output += '</tr>';
		}
	}
	return (output.length === 0 ? '' :
				'<table class="ui-table" data-role="table" data-mode="table">' +
				'<thead><tr class="th-groups"><th></th><th colspan="2">Evaluation</th></tr>' +
				'<tr><th data-priority="1">Move</th><th data-priority="2">Deep</th><th data-priority="3">Static</th></tr></thead>' +
				'<tbody>' +
				output +
				'</tbody></table>');
};

AntiCrux.prototype.toHtml = function(pNode) {
	var x, y, rotated, color, abc, output;

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
			output += '<div class="AntiCrux-board-cell-' + (this._highlight.indexOf(8*y+x) != -1 ? 'hl' : color) + ' AntiCrux-board-piece-' + (this.options.variant.whiteBoard && (pNode.owner[8*y+x] != this.constants.owner.none) ? this.constants.owner.white : pNode.owner[8*y+x]) + pNode.piece[8*y+x] + '" data-xy="' + abc[x] + (8-y) + '">';
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
	if (this._has(pNode, 'enpassant', false))
		output += ' ' + ('abcdefgh'[pNode.enpassant%8]);
	else
		output += ' -';

	//-- Halfmove clock: count of ply since the last pawn advance or capturing move (not supported)
	output += ' 0';

	//-- Fullmove number
	if (!this._has(pNode, '_history', true))
		output += ' 0';
	else
		output += ' ' + Math.ceil(pNode._history.length/2);

	//-- Result
	return output;
};

AntiCrux.prototype.toText = function(pNode) {
	// Use one of the fonts "Chess" available at www.dafont.com

	var x, y, rotated, i, b, car, buffer;

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

			//- Nature of the position
			switch (this.options.variant.whiteBoard && (pNode.owner[i] != this.constants.owner.none) ? this.constants.owner.white : pNode.owner[i])
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

AntiCrux.prototype.toPgn = function(pNode) {
	// https://www.chessclub.com/user/help/PGN-spec

	var pgn, i, turn, fen0, hist, move, symbols;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, '_history', true) || !this._has(pNode, '_history_fen0', true))
		return '';

	//-- Header
	pgn  = '[Event "Game"]' + "\n";
	pgn += '[Site "https://github.com/ecrucru/anticrux/"]' + "\n";
	pgn += '[Date "' + (new Date().toISOString().slice(0, 10)) + '"]' + "\n";
	if (this.options.board.rotated)
		pgn +=	'[White "AntiCrux '+this.options.ai.version+'"]' + "\n" +
				'[Black "You"]' + "\n";
	else
		pgn +=	'[White "You"]' + "\n" +
				'[Black "AntiCrux '+this.options.ai.version+'"]' + "\n";
	pgn += '[Result "?"]' + "\n";
	if (this.hasSetUp(pNode))
	{
		pgn += '[SetUp "1"]' + "\n";
		pgn += '[FEN "' + pNode._history_fen0 + '"]' + "\n";
	}
	pgn += '[PlyCount "' + (pNode._history.length) +'"]' + "\n";
	pgn += '[Variant "Antichess"]' + "\n";
	pgn += '[TimeControl "-"]' + "\n\n";

	//-- Deactivates the symbols
	symbols = this.options.board.symbols;
	this.options.board.symbols = false;

	//-- Loads the initial position
	fen0 = pNode._history_fen0;
	hist = pNode._history.slice(0);
	this.loadFen(pNode._history_fen0, pNode);
	pNode._history = hist;
	pNode._history_fen0 = fen0;

	//-- Moves
	turn = 0;
	for (i=0 ; i<pNode._history.length ; i++)
	{
		//- Next turn
		if (i % 2 === 0)
			pgn += (turn>0 ? ' ' : '') + (++turn) + '.';

		//- Move
		move = this.moveToString(pNode._history[i], pNode);
		if (!this.movePiece(pNode._history[i], true, this.constants.owner.none, pNode))
			throw 'Internal error - Report any error (#011)';
		else
		{
			pgn += ' ' + move;
			this.switchPlayer(pNode);
		}
	}

	//-- Final position
	switch (this.getWinner(pNode))
	{
		case this.constants.owner.white:
			pgn += '# 1-0';
			pgn = pgn.replace('[Result "?"]', '[Result "1-0"]');
			break;
		case this.constants.owner.black:
			pgn += '# 0-1';
			pgn = pgn.replace('[Result "?"]', '[Result "0-1"]');
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
	this._ai_nodeFreeMemory(this._root_node);
};


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
			version : '0.1.1',							//Version of AntiCrux
			valuation : [],								//Valuation of each piece
			maxDepth : 12,								//Maximal depth for the search dependant on the simplification of the tree
			maxNodes : 100000,							//Maximal number of nodes before the game exhausts your memory (0=Dangerously infinite)
			minimizeLiberty : true,						//TRUE allows a deeper inspection by forcing the moves, FALSE does a complete evaluation
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
			promoteQueen : false,						//TRUE only promotes pawns as queen
			activePawns : true,							//TRUE makes the pawns stronger for the valuation once they are moved
			whiteBoard : false							//TRUE makes the board fully white
		},
		board : {
			rotated : false,							//TRUE rotates the board at 180°
			symbols : false,							//Symbols in Unicode for the display
			fischer : this.getNewFischerId(),			//Default layout (519=classical)
			coordinates : true,							//TRUE displays the coordinates around the board
			noStatOnOwnMove : true,						//TRUE plays faster but the player won't be able to know if he played the right wove
			fullDecisionTree : false,					//TRUE displays the full decision tree in the user interface and this may represent too much data. The option is essentially used for debugging purposes
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
};

AntiCrux.prototype._has = function(pNode, pField, pLengthCheckOrString) {
	var b = ((pNode !== undefined) && (pNode !== null));
	if (b)
	{
		b = pNode.hasOwnProperty(pField);
		if (b && (pNode[pField] === null))
			return false;
		if (typeof pLengthCheckOrString === 'string')
		{
			if (b)
				b = (pNode[pField] == pLengthCheckOrString);
		}
		else
			if (b && pLengthCheckOrString)
				b = (pNode[pField].length > 0);
	}
	return b;
};

AntiCrux.prototype._discoverFischer = function(pNode) {
	var f, result, pattern, board;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, '_history_fen0', true))
		return null;

	//-- Detects the initial Fischer's position
	result = null;
	board = new AntiCrux();
	pattern = this.toFen(pNode).split(' ')[0];
	for (f=1 ; f<=960 ; f++)
	{
		board.defaultBoard(f);
		if (board.toFen().substring(0, pattern.length) == pattern)
		{
			result = f;
			break;
		}
	}
	return result;
};

AntiCrux.prototype._ai_nodeCopy = function(pNode, pFull) {
	//-- Clones the node
	var	newNode = {
		player	: pNode.player,
		piece	: pNode.piece.slice(0),
		owner	: pNode.owner.slice(0)
	};
	if (this._has(pNode, 'enpassant', false))
		newNode.enpassant = pNode.enpassant;

	//-- Extends the copy
	if (pFull)
	{
		if (this._has(pNode, 'valuation', false))
			newNode.valuation = pNode.valuation;
		if (this._has(pNode, 'valuationSolver', false))
			newNode.valuationSolver = pNode.valuationSolver;
		if (this._has(pNode, 'moves', false))
			newNode.moves = pNode.moves.slice(0);
		if (this._has(pNode, '_pendingPromotion', false))
			newNode._pendingPromotion = pNode._pendingPromotion;
	}

	//-- Result
	return newNode;
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
					if (this._has(pNode, 'enpassant', false))
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
			y = Math.floor(Math.random() * x + 0.5);
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
	if (!pNode.hasOwnProperty('moves'))
		return;

	//-- Builds the new sub-nodes
	pNode.nodes = [];
	for (i=0 ; i<pNode.moves.length ; i++)
	{
		if (pNode.moves[i] === 0)
			continue;

		//- Moves the piece
		node = this._ai_nodeCopy(pNode, false);
		this.movePiece(pNode.moves[i], false, pNode.player, node);
		if (node.player == this.constants.owner.white)
			node.player = this.constants.owner.black;
		else
			node.player = this.constants.owner.white;
		pNode.nodes.push(node);
	}
};

AntiCrux.prototype._ai_nodeRecurseTree = function(pPlayer, pDepth, pNode) {
	var	i, min_moves, killed;

	//-- Checks
	if ((pNode === undefined) || (pNode === null))
		return;

	//-- Builds the sub-nodes for the decision tree
	if (!this._has(pNode, 'moves', true))
		this._ai_nodeMoves(pNode);
	if ((this.options.ai.handicap > 0) && (pNode.player == pPlayer))
	{
		//- Number of moves to remove (simulation of an handicap)
		if (pNode.moves.length > 4)
			min_moves = Math.floor((pNode.moves.length-4) * this.options.ai.handicap / 100);
		else
			min_moves = 0;
		//- Removes random valid moves
		for (i=min_moves ; i>0 ; i--)
			pNode.moves.splice(Math.floor(Math.random() * pNode.moves.length), 1);
	}
	if (!this._has(pNode, 'nodes', true) ||
		(pNode.nodes.length != pNode.moves.length)
	)
		this._ai_nodeCreateNodes(pNode);

	//-- Kills the bad sub-levels to constraint the opponent
	min_moves = this.constants.score.infinite;
	for (i=0 ; i<pNode.nodes.length ; i++)							//For each situation to be played by the opponent...
	{
		this._ai_nodeMoves(pNode.nodes[i]);
		if (this.options.ai.minimizeLiberty && (pNode.nodes[i].player != pPlayer))
			if ((pNode.nodes[i].moves.length > 0) && (pNode.nodes[i].moves.length < min_moves))
				min_moves = pNode.nodes[i].moves.length;
	}
	killed = false;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if ((pNode.player == pPlayer) && (pNode.nodes[i].moves.length > min_moves))
		{
			pNode.moves[i] = 0;
			pNode.nodes[i] = null;
			killed = true;
		}
		else
		{
			this._numNodes++;
			this._ai_nodeValuate(pNode.nodes[i]);
			if (	(pDepth >= this.options.ai.maxDepth) ||
					((this.options.ai.maxNodes !== 0) && (this._numNodes >= this.options.ai.maxNodes))
			)
				;		//No recursive search
			else
			{
				if (	!this.options.ai.noStatOnForcedMove ||
						(this.options.ai.noStatOnForcedMove && (pNode.moves.length > 1))
				)
					this._ai_nodeRecurseTree(pPlayer, pDepth+1, pNode.nodes[i]);
			}
		}
	}

	//-- Compacts the arrays
	if (killed)
	{
		for (i=pNode.moves.length-1 ; i>=0 ; i--)
			if (pNode.moves[i] === 0)
				pNode.moves.splice(i, 1);
		for (i=pNode.nodes.length-1 ; i>=0 ; i--)
			if (pNode.nodes[i] === null)
				pNode.nodes.splice(i, 1);
		if (pNode.moves.length != pNode.nodes.length)
			throw 'Internal error - Report any error (#005)';
	}
};

AntiCrux.prototype._ai_nodeValuate = function(pNode) {
	var i, val, valB, valW;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Gets the score per player
	valB = 0;
	valW = 0;
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
				valB += val;
				break;
			case this.constants.owner.white:
				valW += val;
				break;
		}
	}

	//-- Valuates the position
	if (valB === 0)
		pNode.valuation =	this.constants.score.infinite;			//No more piece for Black
	else if (valW === 0)
		pNode.valuation =  -this.constants.score.infinite;			//No more piece for White
	else
		pNode.valuation =	this.constants.owner.black*valB +		//Normal case
							this.constants.owner.white*valW;

	//-- No move possible anymore
	if (this._has(pNode, 'moves', false))
		if (pNode.moves.length === 0)
			pNode.valuation = pNode.player * -this.constants.score.infinite;
};

AntiCrux.prototype._ai_getMaxValuation = function(pNode) {
	var i, val, valW, valB;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Valuates the position
	valW = 0;
	valB = 0;
	for (i=0 ; i<64 ; i++)
	{
		val = this.options.ai.valuation[pNode.piece[i]];
		switch (pNode.owner[i])
		{
			case this.constants.owner.black:
				valB += val;
				break;
			case this.constants.owner.white:
				valW += val;
				break;
		}
	}
	return (valB > valW ? valB : valW);
};

AntiCrux.prototype._ai_nodeSolve = function(pPlayer, pNode) {
	var i, allForced, hasForced, condition, threshold, val, counter;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks the maximal depth
	if (!this._has(pNode, 'nodes', true))
	{
		//- Applies the valuation for the solver
		pNode.valuationSolver = pNode.valuation;
		pNode._forced = true;																		//All the lowest levels are defined as forced moves
		pNode._sequence = (pNode.valuationSolver==pPlayer*-this.constants.score.infinite ? 1 : 0);	//Will help for quicker ends of game
		if (this.options.ai.opportunistic && (pNode._sequence == 1))
			pNode._win = true;
		return;
	}

	//-- Sets the flag of forced moves + Updates the lowest valuations recursively
	allForced = true;
	hasForced = false;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if (pNode.nodes[i] === null)
			continue;
		this._ai_nodeSolve(pPlayer, pNode.nodes[i]);
		if (!pNode.nodes[i]._forced)
			allForced = false;
		else
			hasForced = true;
		if (this._has(pNode.nodes[i], '_win', false))
			pNode._win = true;								//There is an opportunity of win for the branch of the node
	}
	if (pNode.player == pPlayer)
		pNode._forced = hasForced;
	else
		pNode._forced = allForced;							//The parent levels are forced moves if all the children are too

	//-- Removes the wrong nodes to always play the forced moves with the highest damage
	if ((pNode.player == pPlayer) && hasForced)
	{
		threshold = pPlayer * this.constants.score.infinite;

		//- Finds the valuation of the forced move
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if (!pNode.nodes[i]._forced)
			{
				pNode.nodes[i] = null;
				continue;
			}

			// Determines the best threshold
			if (((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuationSolver < threshold)) ||
				((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuationSolver > threshold))
			)
				threshold = pNode.nodes[i].valuationSolver;
		}

		//- Remove the weak moves
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if (pNode.nodes[i].valuationSolver != threshold)
				pNode.nodes[i] = null;
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
			if (pNode.nodes[i] === null)
				continue;
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
			pNode.valuationSolver = Math.floor(pNode.valuationSolver/counter + 0.5);	//Always integer !
		else
			condition = false;			//The valuation will follow the other rule
	}

	//-- Evaluates the current node by using the worst valuation
	if (!condition)
	{
		val = pPlayer * -this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if ( ((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuationSolver > val)) ||
				 ((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuationSolver < val))
				)
				val = pNode.nodes[i].valuationSolver;
		}
		pNode.valuationSolver = val;
	}

	//-- Calculates the sequence which leads to faster end of game
	if (!this.options.ai.acceleratedEndGame)
		pNode._sequence = 0;
	else
	{
		val = this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if ((pNode.nodes[i]._sequence > 0) && (pNode.nodes[i]._sequence < val))
				val = pNode.nodes[i]._sequence;
		}
		pNode._sequence = (pNode._forced && (pNode.valuationSolver==pPlayer*-this.constants.score.infinite) ? val+1 : 0);
	}
};

AntiCrux.prototype._ai_nodePick = function(pPlayer, pNode) {
	var i, threshold, flag, val, better, same, moves;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Keeps the moves which lead to fast end of game
	if (this.options.ai.acceleratedEndGame && pNode._forced && (pNode.valuationSolver == pNode.player * -this.constants.score.infinite))
	{
		threshold = this.constants.score.infinite;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if (pNode.nodes[i]._forced && (pNode.nodes[i]._sequence > 0) && (pNode.nodes[i]._sequence < threshold))
				threshold = pNode.nodes[i]._sequence;
		}
		if (threshold == this.constants.score.infinite)
			throw 'Internal error - Report any error (#006)';
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if (pNode.nodes[i]._sequence != threshold)
				pNode.nodes[i] = null;
		}
	}

	//-- Keeps the less risky static moves when we have plenty of moves
	if (this.options.ai.bestStaticScore && (pNode.nodes.length > 1))
	{
		threshold = pPlayer * this.constants.score.infinite;

		//- Finds the corresponding valuation
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;

			// Determines the best valuation
			if ( ((pPlayer == this.constants.owner.white) && (pNode.nodes[i].valuationSolver < threshold)) ||
				 ((pPlayer == this.constants.owner.black) && (pNode.nodes[i].valuationSolver > threshold))
				)
				threshold = pNode.nodes[i].valuationSolver;
		}

		//- Removes the weak moves
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;
			if (pNode.nodes[i].valuationSolver != threshold)
				pNode.nodes[i] = null;
		}
	}

	//-- When there are still plenty of equivalent moves, we keep the ones having an opportunity of win
	if (this.options.ai.opportunistic && (pNode.nodes.length > 1))
	{
		flag = false;
		for (i=0 ; i<pNode.nodes.length ; i++)
		{
			if (pNode.nodes[i] === null)
				continue;

			//- Determines the existence of an oppontunity
			if (!flag && this._has(pNode.nodes[i], '_win', false))
			{
				i = -1;
				flag = true;
				continue;
			}

			//- Keeps the opportunistic moves
			if (flag && !this._has(pNode.nodes[i], '_win', false))
				pNode.nodes[i] = null;
		}
	}

	//-- Lists the eligible moves
	// White will minimize the valuation
	// Black will maximize the valuation
	moves = [];
	threshold = pPlayer * this.constants.score.infinite;
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if (pNode.nodes[i] === null)
			continue;

		//- Comparison
		val = Math.floor(pNode.nodes[i].valuationSolver + 0.5);
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
		default: return moves[Math.floor(Math.random() * (moves.length-1) + 0.5)];
	}
};

AntiCrux.prototype._ai_formatScore = function(pValue, pPercent) {
	if ((pPercent && (pValue < -100)) || (pValue == -this.constants.score.infinite))
		return '<img src="images/mate_'+this.constants.owner.white+'.png" title="White wins" alt="-&#8734;" />';
	if ((pPercent && (pValue > 100)) || (pValue == this.constants.score.infinite))
		return '<img src="images/mate_'+this.constants.owner.black+'.png" title="Black wins" alt="+&#8734;" />';
	return pValue.toFixed(0) + (pPercent ? '%' : '');
};

AntiCrux.prototype._ai_nodeTreeHtml = function(pDepth, pHTML, pNode) {
	var i, j, subHTML, writeMode;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!this._has(pNode, 'nodes', false))
		return;

	//-- Formats
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if (pNode.nodes[i] === null)
			continue;
		subHTML = pHTML;
		writeMode = (	(this.options.board.fullDecisionTree) ||
						(pDepth === 0) ||
						!this._has(pNode.nodes[i], 'nodes', true) || (pDepth >= 3)
					);

		//- Valuation
		if (writeMode)
		{
			this._buffer += '<tr data-depth="'+pDepth+'">';
			if (pNode.nodes[i].hasOwnProperty('valuation'))
			{
				this._buffer += '<td>' + this._ai_formatScore(pNode.nodes[i].valuation, false) + '</td>';
				if (pNode.nodes[i].hasOwnProperty('valuationSolver'))
					this._buffer += '<td>' + this._ai_formatScore(pNode.nodes[i].valuationSolver, false) + '</td>';
				else
					this._buffer += '<td>&nbsp;</td>';
			}
			else
				this._buffer += '<td>&nbsp;</td><td>&nbsp</td>';
		}

		//- New move
		subHTML += '<td>' + this.moveToString(pNode.moves[i], pNode) + '</td>';
		if (writeMode)
		{
			this._buffer += subHTML;
			for (j=pDepth ; j<4 ; j++)
				this._buffer += '<td>&nbsp;</td>';
			this._buffer += '</tr>';
		}

		//- Next level
		if (pNode.nodes[i].hasOwnProperty('nodes') && (pDepth < 4))
			this._ai_nodeTreeHtml(pDepth+1, subHTML, pNode.nodes[i]);
	}
};

AntiCrux.prototype._ai_nodeFreeMemory = function(pNode) {
	var i;

	//-- Self
	if (pNode === undefined)
		pNode = this._root_node;

	//-- Checks
	if (!pNode.hasOwnProperty('nodes'))
		return;
	if (pNode.nodes === null)
		return;

	//-- Removes the links between the objects to help the garbage collector to remove the unused objects
	for (i=0 ; i<pNode.nodes.length ; i++)
	{
		if (pNode.nodes[i] === null)
			continue;
		else
			this._ai_nodeFreeMemory(pNode.nodes[i]);
	}
	pNode.nodes = null;
	pNode.moves = null;
};


//---- NodeJS

if ((typeof module !== 'undefined') && module.exports)
	module.exports = AntiCrux;
