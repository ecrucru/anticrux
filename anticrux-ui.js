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

var	ai = new AntiCrux(),
	ai_rewind = new AntiCrux(),
	ui_mobile, ui_cordova, ui_move, ui_move_pending, ui_possibledraw, ui_rewind, ui_rematch;

ai.options.board.symbols = true;
ai.defaultBoard();

function acui_options_load() {
	var level;

	//-- Common elements
	$('#acui_option_darktheme').prop('checked', ai.options.board.darkTheme);
	$('#acui_option_rotated').prop('checked', ai.options.board.rotated);

	//-- Mobile version
	if (ui_mobile)
	{
		level = ai.getLevel();
		if (level !== null)
			$('#acui_option_level').val(level).change();
	}
	else
	//-- Desktop version
	{
		//- AI
		$('#acui_option_maxdepth').val(ai.options.ai.maxDepth);
		$('#acui_option_maxnodes').val(ai.options.ai.maxNodes);
		$('#acui_option_minimizeliberty').prop('checked', ai.options.ai.minimizeLiberty);
		$('#acui_option_maxreply').val(ai.options.ai.maxReply).slider('refresh');
		$('#acui_option_randomizedsearch').prop('checked', ai.options.ai.randomizedSearch);
		$('#acui_option_worstcase').prop('checked', ai.options.ai.worstCase);
		$('#acui_option_opportunistic').prop('checked', ai.options.ai.opportunistic);
		$('#acui_option_distance').prop('checked', ai.options.ai.distance);
		$('#acui_option_handicap').val(ai.options.ai.handicap).slider('refresh');
		$('#acui_option_oyster').prop('checked', ai.options.ai.oyster);

		//- Board
		$('#acui_option_fischer').val(ai.options.board.fischer);
		$('#acui_option_assistance').prop('checked', ai.options.board.assistance);
		$('#acui_option_symbols').prop('checked', ai.options.board.symbols);
		$('#acui_option_coordinates').prop('checked', ai.options.board.coordinates);
		$('#acui_option_nostatonforcedmove').prop('checked', ai.options.board.noStatOnForcedMove);
		$('#acui_option_nostatonownmove').prop('checked', ai.options.board.noStatOnOwnMove);
		$('#acui_option_debug').prop('checked', ai.options.board.debug);

		//- Variant
		$('#acui_option_enpassant').prop('checked', ai.options.variant.enPassant);
		$('#acui_option_promotequeen').prop('checked', ai.options.variant.promoteQueen);
		$('#acui_option_superqueen').prop('checked', ai.options.variant.superQueen);
		$('#acui_option_pieces').val(ai.options.variant.pieces).change();
		$('#acui_option_randomizedposition').val(ai.options.variant.randomizedPosition).change();
	}
}

function acui_reset_ui(pResetPlayer) {
	var element;

	ui_rewind = false;
	$('#acui_tab_board_header').trigger('click');
	$('#acui_valuation').val(0).slider('refresh');
	$('#acui_score, #acui_lastmove, #acui_assistance, #acui_depth, #acui_nodes, #acui_nps, #acui_matdiff, #acui_moves, #acui_history').html('');
	$('#acui_sect_rewind').hide();
	$('#acui_pgn').addClass('ui-disabled');
	ai.resetStats();
	$('#acui_graph_score').empty();
	if (pResetPlayer)
		$('#acui_player').val(ai.constants.player.white).change();
}

function acui_refresh_board() {
	//-- Checks the current mode
	if (ui_rewind)
		return false;

	//-- Refreshes the board
	var player = parseInt($('#acui_player').val());
	ai.freeMemory();
	$('#acui_board').html(ai.toHtml());
	$('#acui_board').css('width', (ai.options.board.coordinates?420:400) + 'px');
	$('#acui_board').css('height', $('#acui_board').css('width'));
	acui_refresh_matdiff();

	//-- Reactivates the cells of the board
	$('.AntiCrux-board-cell-0, .AntiCrux-board-cell-1, .AntiCrux-board-cell-hl').click(function() {
		var move = this.dataset.xy;

		//- Checks the format of the value
		if (!move.match(/^[a-h][1-8]$/))
			return false;

		//- Cancels the current move if it is the same position
		if (move == ui_move)
			ui_move = '';
		else
		{
			//- Reselects a cell for the first click if it was a blank cell
			if ((ui_move.length == 2) && (ai.getPieceByCoordinate(ui_move).piece == ai.constants.piece.none))
				ui_move = '';

			//- Overrides the existing selection if it is the same player
			if (ui_move.length == 2)
			{
				if (ai.getPieceByCoordinate(ui_move).player == ai.getPieceByCoordinate(move).player)
					ui_move = move;
				else
					ui_move += move;
			}
			else
			//- Appends the coordinate
				ui_move += move;
		}

		//- Makes a human move
		switch (ui_move.length)
		{
			case 4:
				// Statistics of the current situation
				if (!ai.options.board.noStatOnOwnMove)
					ai.getMoveAI(player);

				// Explicit move for the user
				move = ai.movePiece(ui_move, true, player);
				acui_refresh_stats(move);
				if (move != ai.constants.noMove)
					acui_promote(move);
				else
				{
					acui_popup('The move has been denied. Choose another one.');
					ai.highlight(true, null);
					acui_refresh_board();
				}
				ai.freeMemory();
				ui_move = '';
				break;

			case 0:
			case 2:
				ai.highlight(true, ui_move);
				acui_refresh_board();
				break;

			default:
				throw 'Internal error - Report any error (#001)';
		}
		return true;
	});
	return true;
}

function acui_refresh_matdiff() {
	var piece, diff, cp, buffer, pro;

	//-- Prepares the buffer
	buffer = '';
	pro = $('#acui_option_pro').prop('checked');
	if (!pro)
	{
		diff = ai.getMaterialDifference(ui_rewind ? ai_rewind.getMainNode() : ai.getMainNode());
		cp = 0;
		for (piece=ai.constants.piece.none ; piece<=ai.constants.piece.king ; piece++)
			if (diff[piece] != 0)
			{
				cp += diff[piece] * ai.options.ai.valuation[piece];
				if (buffer.length === 0)
					buffer += ' ';
				buffer +=	'<span title="'+Math.abs(diff[piece])+' more">' +
							ai.getPieceSymbol(	piece,
												(diff[piece]<0 ? ai.constants.player.black : ai.constants.player.white),
												ai.options.board.symbols) +
							'</span>';
			}
		cp = Math.round(100 * cp / ai.options.ai.valuation[ai.constants.piece.pawn]);
	}

	//-- Layout
	$('#acui_matdiff').html(buffer.length > 0 ? 'Difference : '+buffer+' <span title="Static centipawns">'+cp+'&nbsp;cp</span>' : '');
	if (buffer.length > 0)
		$('#acui_matdiff').show();
	else
		$('#acui_matdiff').hide();
}

function acui_refresh_moves() {
	//Method to be called before the move is done else we can't display the moves with a nice format
	$('#acui_moves').html($('#acui_option_pro').prop('checked') ? '<div>No statistical data with the professional mode.</div>' : ai.getMovesHtml(parseInt($('#acui_player').val())));
}

function acui_refresh_score() {
	var canvas, i, h, w, eW, v, data, smooth;

	//-- Library
	smooth = function(pValue) {
		/* Linear */		return -pValue/101;
		//* Exponential */	return (pValue < 0 ? -1 : 1) * (Math.exp(-0.05*Math.abs(pValue))-1);
	};

	//-- Initializes
	canvas = $('#acui_graph_score');
	h = canvas.height();
	w = canvas.width();
	data = ai.getScoreHistory();

	//-- Draws the reference lines
	canvas.empty();
	canvas.append($(document.createElement('div'))
							.css('position',			'absolute')
							.css('width',				w+'px')
							.css('height',				Math.round(h * Math.abs(smooth(50)))+'px')
							.css('top',					Math.round((h/2) * (1 + smooth(50)))+'px')
							.css('left',				'0px')
							.css('border-top',			'1px dashed gray')
							.css('border-bottom',		'1px dashed gray')
				);
	canvas.append($(document.createElement('div'))
							.css('position',			'absolute')
							.css('width',				w+'px')
							.css('height',				Math.round(h * Math.abs(smooth(10)))+'px')
							.css('top',					Math.round((h/2) * (1 + smooth(10)))+'px')
							.css('left',				'0px')
							.css('border-top',			'1px dashed gray')
							.css('border-bottom',		'1px dashed gray')
				);

	//-- Width of the bar element
	eW = w/data.length;
	eW = (eW > 10 ? 10 : Math.floor(eW));

	//-- Draws the bars
	for (i=0 ; i<data.length ; i++)
	{
		//- Checks the value
		if (data[i].value === 0)
			continue;

		//- Bar
		v = (h/2) * (1 + smooth(data[i].value));
		canvas.append($(document.createElement('div'))
								.css('position',							'absolute')
								.css('left',								(eW*i)+'px')
								.css('top',									Math.round(v<h/2 ? v : h/2)+'px')
								.css('width',								eW+'px')
								.css('height',								Math.round(Math.abs(h/2-v))+'px')
								.css('border-'+(v<h/2 ? 'top' :'bottom'),	'1px solid '+(ai.options.board.darkTheme ? 'white' : 'black'))
								.css('background-color',					(data[i].type==ai.constants.bitmask.valuationDeep ? '#A6ABD6' : '#F08040'))
					);
	}

	//-- Draws the middle line
	canvas.append($(document.createElement('div'))
							.css('position',			'absolute')
							.css('width',				w+'px')
							.css('height',				'1px')
							.css('top',					Math.round(h/2)+'px')
							.css('left',				'0px')
							.css('background-color',	(ai.options.board.darkTheme ? 'white' : 'black'))
				);
}

function acui_refresh_history(pScroll) {
	//-- Main table
	var hist = ai.getHistoryHtml();
	$('#acui_history').html(hist);
	if (hist.length === 0)
		$('#acui_pgn').addClass('ui-disabled');
	else
		$('#acui_pgn').removeClass('ui-disabled');
	if (ui_rewind)
		$('#acui_sect_rewind').show();
	else
		$('#acui_sect_rewind').hide();
	if (pScroll)
		$('#acui_history_scrollbox').scrollTop(2*$('#acui_history').height());

	//-- Events
	$('.AntiCrux-history-item').click(function() {
		var	i,
			index = parseInt(this.dataset.index),
			hist = ai.getHistory(),
			scores = ai.getScoreHistory();

		//-- Checks
		if (hist.length === 0)
			return false;
		if ((index < 0) || (index >= hist.length))
			return false;

		//-- Determines the position for the provided index
		ai_rewind.copyOptions(ai);
		if (ai_rewind.options.variant.pieces == 3)
			ai_rewind.options.variant.pieces = 0;
		if (!ai_rewind.loadFen(ai.getInitialPosition()))
			return false;
		for (i=0 ; i<=index ; i++)
		{
			if (ai_rewind.movePiece(hist[i], false, ai_rewind.constants.player.none) == ai_rewind.constants.noMove)
				throw 'Internal error - Report any error (#002)';
			else
			{
				ai_rewind.updateHalfMoveClock();
				ai_rewind.logMove(hist[i], scores[i]);
				ai_rewind.switchPlayer();
				ai_rewind.highlightMove(hist[i]);
			}
		}

		//-- Sets the mode
		acui_reset_ui(false);
		ui_rewind = true;
		$('#acui_player').val(ai_rewind.getPlayer()).change();
		acui_refresh_matdiff();
		acui_refresh_score();
		acui_refresh_history(false);
		$('#acui_board').html(ai_rewind.toHtml());		//No event is attached to the cells
		return true;
	});
}

function acui_refresh_stats(pMove) {
	//The method has to be called after that the move is done
	var node, score, stats, objs, obj, i;

	//-- Gets the node
	node = ai.getMainNode();
	if (ai._has(node, 'moves', true) && ai._has(node, 'nodes', true) && (pMove !== ai.constants.noMove))
	{
		i = node.moves.indexOf(pMove);
		if (i !== -1)
			node = node.nodes[i];
	}

	//-- Sets the texts
	score = ai.getScore(node);
	stats = ai.getStatsAI();
	$('#acui_valuation').val($('#acui_option_pro').prop('checked') ? 0 : score.valuePercent).slider('refresh');
	$('#acui_score').html($('#acui_option_pro').prop('checked') ? 0 : score.valuePercent);
	$('#acui_depth').html((stats.depth === 0 ? '' : 'Depth : '+stats.depth));
	$('#acui_nodes').html((stats.nodes === 0 ? '' : 'Nodes : '+stats.nodes));
	$('#acui_nps').html((stats.nps === 0 ? '' : 'Speed : '+(Math.floor(stats.time/100)/10)+' seconds, '+stats.nps+' <span title="Nodes per second">nps</span>'));

	//-- Optimization of the space
	objs = ['acui_lastmove', 'acui_assistance', 'acui_depth', 'acui_nodes', 'acui_nps'];
	for (i=0 ; i<objs.length-1 ; i++)
	{
		obj = $('#'+objs[i]);
		if (obj.length > 0)
			if (obj.html().length === 0)
				obj.hide();
			else
				obj.show();
	}
}

function acui_isRewind() {
	if (ui_rewind)
	{
		$('#acui_tab_board_history_header').trigger('click');	//Switches the tab to locate the button
		acui_popup('Leave the review of the game to continue with it.');
	}
	return ui_rewind;
}

function acui_promote(pMove) {
	ui_move_pending = pMove;
	if (ai.hasPendingPromotion())
		$('#acui_promotion').popup('open', {});
	else
		acui_afterHumanMove();
}

function acui_afterHumanMove() {
	ai.updateHalfMoveClock();
	ai.logMove(ui_move_pending, null);
	ui_move = '';
	ui_move_pending = ai.constants.noMove;
	acui_refresh_score();
	acui_refresh_history(true);
	acui_refresh_board();
	if (ai.isEndGame(true))
	{
		acui_showWinner();
		acui_switch_players();
	}
	else
	{
		acui_switch_players();
		if ($('#acui_option_autoplay').prop('checked'))
		{
			if (ai.isDraw())
				acui_popup("The game ended in a tie.\n\nReason : "+ai.getDrawReason()+'.');
			else
			{
				if (ai.isPossibleDraw() && !ui_possibledraw)
				{
					acui_popup('The game is a possible draw.');
					ui_possibledraw = true;
				}
				setTimeout(	function() {		//Refreshes the screen before the AI plays
								$('#acui_play_ai').click();
							}, 1000);
			}
		}
	}
}

function acui_autostart() {
	if (ai.getPlayer() == (ai.options.board.rotated ? ai.constants.player.white : ai.constants.player.black))
		setTimeout(function() {
					$('#acui_play_ai').click();
				}, 500);
}

function acui_switch_players() {
	if (ai.getPlayer() == ai.constants.player.black)
		$('#acui_player').val(ai.constants.player.white).change();
	else
		$('#acui_player').val(ai.constants.player.black).change();
}

function acui_showWinner() {
	var winner = ai.getWinner();
	if (winner == ai.constants.player.none)
		throw 'Internal error - Report any error (#003)';
	winner = (winner == ai.constants.player.white ? 'White' : 'Black');
	acui_popup('End of the game. '+winner+' has won !');
}

function acui_setMultiLines(pState) {
	var obj;

	//-- Gets the editor
	obj = $('#acui_input');
	if (obj.length === 0)
		return;

	//-- Changes the options of the text area
	if (!pState)
		obj.val(obj.val().split("\r").join('').split("\n")[0]);
	obj.rows = (pState ? 10 : 1);
	obj.height(obj.rows * 20 / (ui_cordova ? window.devicePixelRatio : 1));
}

function acui_popup(pMessage) {
	setTimeout(function() {
					$('#acui_popup_text').html(pMessage.split("\n").join('<br/>'));
					$('#acui_popup').popup('open', {});
				}, 750);
}

function acui_fitBoard() {
	//-- Determines the best size
	var w = Math.floor(Math.min(screen.width, screen.height) / (ui_cordova ? window.devicePixelRatio : 1) * 0.85 / 8);

	//-- Applies the generated CSS
	if ((w < 50) && (ui_mobile || ui_cordova))
	{
		$('<style>')
			.prop('type', 'text/css')
			.html(	'.AntiCrux-board                        { height:'+(20+8*w)+'px; width:'+(20+8*w)+'px; }' +
					'.AntiCrux-board-coordinates-vertical   { line-height:'+w+'px;             }' +
					'.AntiCrux-board-coordinates-horizontal { width:'+w+'px;                   }' +
					'.AntiCrux-board-cell-0                 { width:'+w+'px; height:'+w+'px;   }' +
					'.AntiCrux-board-cell-1                 { width:'+w+'px; height:'+w+'px;   }' +
					'.AntiCrux-board-cell-hl                { width:'+w+'px; height:'+w+'px;   }' +
					'.AntiCrux-board-piece-161              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-162              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-163              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-164              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-165              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-166              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-241              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-242              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-243              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-244              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-245              { background-size:'+w+'px '+w+'px; }' +
					'.AntiCrux-board-piece-246              { background-size:'+w+'px '+w+'px; }'
				)
			.appendTo('head');
	}
}

function acui_isphone() {
	return (ui_cordova || (Math.min(screen.width, screen.height) < 768));
}

$(document).ready(function() {
	var i, defaultLevel;

	//-- Initialization
	ui_mobile = ($('#acui_ismobile').length > 0);
	ui_cordova = (window.cordova !== undefined);
	ui_move = '';
	ui_move_pending = ai.constants.noMove;
	ui_possibledraw = false;
	ui_rewind = false;
	ui_rematch = ai.constants.player.white;
	acui_refresh_board();

	//-- Dynamic content
	acui_fitBoard();

	//-- Updates the list of players
	$('#acui_player').find('option').remove().end();
	$('<option/>').val(ai.constants.player.white).html('White'+(ui_mobile?'':' to play')).appendTo('#acui_player');
	$('<option/>').val(ai.constants.player.black).html('Black'+(ui_mobile?'':' to play')).appendTo('#acui_player');
	$('#acui_player').val(ai.constants.player.white).change();

	//-- Updates the levels
	$('#acui_option_predef').find('option').remove().end();
	defaultLevel = ai.getLevel();
	for (i=1 ; i<=20 ; i++)
	{
		ai.setLevel(i);
		$('<option/>').val(i).html('Level '+i + (ai.options.ai.elo>0 ? ' ('+ai.options.ai.elo+')' : '')).appendTo('#acui_option_predef');
	}
	ai.setLevel(defaultLevel);

	//-- Events (General)
	$('textarea').on('click', function () {
		$(this).select();
		return true;
	});

	//-- Title bar
	$('#acui_switch_ui').click(function() {
		window.location.href = (ui_mobile ? 'index.html' : 'mobile.html');
	});

	//-- Events (Board)
	$('#acui_player').change(function() {
		if (!ui_rewind)
		{
			ai.setPlayer(parseInt($('#acui_player').val()));
			acui_refresh_board();
		}
		return !ui_rewind;
	});

	$('#acui_play_ai').click(function() {
		var buffer, player, move;

		//-- Checks the current mode
		if (acui_isRewind())
			return false;

		//-- Inputs
		player = parseInt($('#acui_player').val());
		move = ai.getMoveAI(player);

		//-- Checks
		if (move == ai.constants.noMove)
		{
			if (ai.isEndGame(false))
				acui_showWinner();
			return true;
		}

		//-- Moves
		buffer = ai.moveToString(move);
		$('#acui_lastmove').html(buffer.length>0 ? 'Last move : '+buffer : '');
		buffer = ($('#acui_option_pro').prop('checked') || !ai.options.board.assistance ? '' : ai.getAssistance(null, false));
		$('#acui_assistance').html(buffer.length>0 ? 'Assistance : '+buffer : '');
		acui_refresh_moves();
		if (ai.movePiece(move, true, player) != ai.constants.noMove)
		{
			ai.updateHalfMoveClock();
			ai.highlightMove(move);
			ai.logMove(move, null);
			ui_move = '';
			acui_refresh_stats(move);
			acui_refresh_score();
			acui_refresh_history(true);
			if (ai.isEndGame(true))
				acui_showWinner();
			else
				if (ai.isDraw())
					acui_popup("The game ended in a tie.\n\nReason : "+ai.getDrawReason()+'.');
		}
		else
			throw 'Internal error - Report any error (#004)';
		acui_refresh_board();
		acui_switch_players();
		return true;
	});

	$('#acui_play_human').click(function() {
		//-- Checks the current mode
		if (acui_isRewind())
			return false;

		//-- Inputs
		var	player = parseInt($('#acui_player').val()),
			move = window.prompt('Type your move :', '0');

		//-- Checks
		if (move === null)
		{
			acui_popup('No move has been considered.');
			return false;
		}

		//-- Statistics of the current situation
		if (!ai.options.board.noStatOnOwnMove)
		{
			ai.getMoveAI(player);
			acui_refresh_moves();
		}

		//-- Explicit move for the user
		move = ai.movePiece(move, true, player);
		acui_refresh_stats(move);
		if (move != ai.constants.noMove)
			acui_promote(move);
		else
			acui_popup('The move has been denied. Choose another one.');
		ai.freeMemory();
		return true;
	});

	$('#acui_hint_soft').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Simple hints
		ui_move = '';
		ai.highlightMoves(true);
		acui_refresh_board();
		return true;
	});

	$('#acui_hint_hard').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Detailed hints
		ai.getMoveAI(parseInt($('#acui_player').val()));
		ui_move = '';
		ai.highlightMoves(false);
		acui_refresh_moves();
		acui_refresh_stats(ai.constants.noMove);
		acui_refresh_board();
		ai.freeMemory();
		$('#acui_tab_board_evaluation_header').trigger('click');
		return true;
	});

	$('#acui_hint_irma').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Suggestion
		acui_popup(ai.predictMoves().split("\n").join('<br/>'));
		return true;
	});

	$('#acui_undo').click(function() {
		//-- Checks the current mode
		if (acui_isRewind())
			return false;

		//-- Undo
		var hist;
		if (ai.undoMove())
		{
			if ($('#acui_option_autoplay').prop('checked') && (ai.getHistory().length > 0))
				ai.undoMove();
			ui_move = '';
			ui_possibledraw = false;
			acui_reset_ui(false);
			acui_refresh_moves();
			acui_refresh_stats(ai.constants.noMove);
			acui_refresh_score();
			acui_refresh_history(true);
			hist = ai.getHistory();
			if (hist.length > 0)
				ai.highlightMove(hist[hist.length-1]);
			acui_refresh_board();
		}
		else
			acui_popup('Impossible to undo because there is not enough history.');
		$('#acui_player').val(ai.getPlayer()).change();
		return true;
	});

	$('#acui_rewind').click(function() {
		//-- Checks
		if (!ui_rewind)
			return false;

		//-- Resets the mode
		acui_reset_ui(false);
		$('#acui_player').val(ai.getPlayer()).change();
		acui_refresh_board();
		acui_refresh_history(true);
		return true;
	});

	$('#acui_pgn').click(function() {
		var dl, pgn, obj;

		//-- Gets the PGN data
		pgn = ai.toPgn({}, false);
		if (pgn.length === 0)
			acui_popup('No data to export to PGN.');
		else
		{
			//- Downloads as a file
			// http://stackoverflow.com/questions/3665115/
			dl = document.createElement('a');
			dl.setAttribute('href', 'data:application/x-chess-pgn;charset=iso-8859-1,' + encodeURIComponent(pgn));
			obj = ai.getDateElements();
			dl.setAttribute('download', 'anticrux_' + obj.year + obj.month + obj.day + '_' + obj.hours + obj.minutes + obj.seconds + '.pgn');
			dl.style.display = 'none';
			document.body.appendChild(dl);
			dl.click();
			document.body.removeChild(dl);
		}
		return true;
	});

	$('.AntiCrux-board-promotion').click(function() {
		var piece = ai.promote(this.dataset.promotion);
		if (piece != ai.constants.piece.none)
		{
			ui_move_pending += 10000 * piece;
			acui_afterHumanMove();
			return true;
		}
		else
			return false;
	});

	//-- Events (Actions)
	$('#acui_clear').click(function() {
		ai.clearBoard();
		ui_move = '';
		ui_possibledraw = false;
		acui_reset_ui(true);
		acui_refresh_board();
		acui_refresh_score();
		return true;
	});

	$('#acui_default').click(function() {
		ai.defaultBoard();
		ui_move = '';
		ui_possibledraw = false;
		acui_reset_ui(true);
		acui_refresh_board();
		acui_autostart();
		return true;
	});

	$('#acui_fischer_new').click(function() {
		$('#acui_option_fischer').dblclick();
		$('#acui_fischer_current').click();
		acui_popup('You are playing AntiChess ' + ai.fischer + '.');
		return true;
	});

	$('#acui_fischer_current').click(function() {
		ai.defaultBoard(ai.options.board.fischer);
		ui_move = '';
		ui_possibledraw = false;
		acui_reset_ui(true);
		acui_refresh_board();
		acui_autostart();
		return true;
	});

	$('#acui_rematch').click(function() {
		ui_rematch = (ui_rematch == ai.constants.player.white ? ai.constants.player.black : ai.constants.player.white);
		$('#acui_option_rotated').prop('checked', (ui_rematch == ai.constants.player.black)).checkboxradio('refresh').change();
		if (ai.fischer !== null)
		{
			if (ai.fischer == ai.constants.classicalFischer)
				$('#acui_default').click();
			else
				$('#acui_fischer_current').click();
		}
		else
		{
			if (ai.hasSetUp())
			{
				ui_move = '';
				acui_setMultiLines(false);
				$('#acui_input').val(ai.getInitialPosition());
				$('#acui_fen_load').click();
				acui_autostart();
			}
			else
				$('#acui_default').click();
		}
	});

	$('#acui_fen_load').click(function() {
		var player;
		acui_setMultiLines(false);
		if (!ai.loadFen($('#acui_input').val()))
		{
			acui_popup('The FEN cannot be loaded because it has a wrong format.');
			return false;
		}
		else
		{
			player = ai.getPlayer();
			ui_move = '';
			ui_possibledraw = false;
			acui_reset_ui(true);
			$('#acui_option_rotated').prop('checked', player==ai.constants.player.black).checkboxradio('refresh').change();
			acui_refresh_board();
			$('#acui_tab_board_header').trigger('click');
			$('#acui_player').val(player).change();
			if (ai.fischer !== null)
			{
				$('#acui_option_fischer').val(ai.fischer).change();
				if (ai.fischer != ai.constants.classicalFischer)
					acui_popup('You are playing AntiChess ' + ai.fischer + '.');
			}
			return true;
		}
	});

	$('#acui_fen_gen').click(function() {
		acui_setMultiLines(false);
		$('#acui_input').val((ui_rewind ? ai_rewind : ai).toFen()).focus().click();
		return true;
	});

	$('#acui_lichess_load').click(function() {
		var player;
		acui_setMultiLines(false);
		if (!ai.loadLichess($('#acui_input').val()))
		{
			acui_popup('The game cannot be retrieved from Lichess.org. Please never abuse.');
			return false;
		}
		else
		{
			$('#acui_tab_board_header').trigger('click');
			$('#acui_board').html('Please wait few seconds while the game is loaded...');
			setTimeout(	function() {
							player = ai.getPlayer();
							ui_move = '';
							ui_possibledraw = false;
							acui_reset_ui(true);
							acui_refresh_board();
							acui_refresh_history(true);
							$('#acui_player').val(player).change();
							if (ai.fischer !== null)
							{
								$('#acui_option_fischer').val(ai.fischer).change();
								if (ai.fischer != ai.constants.classicalFischer)
									acui_popup('You are playing AntiChess ' + ai.fischer + '.');
							}
						}, 5000);				//5 seconds are arbitrary
			return true;
		}
	});

	$('#acui_text_gen').click(function() {
		acui_setMultiLines(true);
		$('#acui_input').val((ui_rewind ? ai_rewind : ai).toText()).focus().click();
		return true;
	});

	$('#acui_free').click(function() {
		ai.freeMemory();
		return true;
	});

	$('#acui_about').click(function() {
		setTimeout(function() {
				window.location.href = 'https://github.com/ecrucru/anticrux/';
			}, 1000);
		return true;
	});

	//-- Events (Options)
	$('#acui_option_predef').change(function() {
		ai.setLevel(parseInt($('#acui_option_predef').val()));
		acui_options_load();
		$("input[type='checkbox']").checkboxradio('refresh');
		return true;
	});

	$('#acui_option_maxreply').change(function() {
		$('#acui_option_minimizeliberty').prop('checked', true).checkboxradio('refresh');
		return true;
	});

	$('#acui_option_fischer').dblclick(function() {
		$('#acui_option_fischer').val(ai.getNewFischerId()).change();
		return true;
	});

	$('#acui_option_pro').change(function() {
		if ($('#acui_option_pro').prop('checked'))
			$('#acui_option_assistance').prop('checked', false).checkboxradio('refresh');
		return true;
	});

	$('.AntiCrux-ui-option').change(function() {
		//-- Common elements
		ai.options.board.darkTheme = $('#acui_option_darktheme').prop('checked');
		ai.options.board.rotated = $('#acui_option_rotated').prop('checked');

		//-- Mobile version
		if (ui_mobile)
			ai.setLevel(parseInt($('#acui_option_level').val()));
		else
		//-- Desktop version
		{
			//- AI
			ai.options.ai.maxDepth					= parseInt($('#acui_option_maxdepth').val());
			ai.options.ai.maxNodes					= parseInt($('#acui_option_maxnodes').val());
			ai.options.ai.minimizeLiberty			= $('#acui_option_minimizeliberty').prop('checked');
			ai.options.ai.maxReply					= parseInt($('#acui_option_maxreply').val());
			ai.options.ai.randomizedSearch			= $('#acui_option_randomizedsearch').prop('checked');
			ai.options.ai.worstCase					= $('#acui_option_worstcase').prop('checked');
			ai.options.ai.opportunistic				= $('#acui_option_opportunistic').prop('checked');
			ai.options.ai.distance					= $('#acui_option_distance').prop('checked');
			ai.options.ai.handicap					= parseInt($('#acui_option_handicap').val());
			ai.options.ai.oyster					= $('#acui_option_oyster').prop('checked');

			//- Board
			ai.options.board.fischer				= parseInt($('#acui_option_fischer').val());
			ai.options.board.assistance				= $('#acui_option_assistance').prop('checked');
			ai.options.board.symbols				= $('#acui_option_symbols').prop('checked');
			ai.options.board.coordinates			= $('#acui_option_coordinates').prop('checked');
			ai.options.board.noStatOnForcedMove		= $('#acui_option_nostatonforcedmove').prop('checked');
			ai.options.board.noStatOnOwnMove		= $('#acui_option_nostatonownmove').prop('checked');
			ai.options.board.debug					= $('#acui_option_debug').prop('checked');

			//- Variant
			ai.options.variant.enPassant			= $('#acui_option_enpassant').prop('checked');
			ai.options.variant.promoteQueen			= $('#acui_option_promotequeen').prop('checked');
			ai.options.variant.superQueen			= $('#acui_option_superqueen').prop('checked');
			ai.options.variant.pieces				= parseInt($('#acui_option_pieces').val());
			ai.options.variant.randomizedPosition	= parseInt($('#acui_option_randomizedposition').val());
		}
		return true;
	});

	$('.AntiCrux-ui-option-refresh').change(function() {
		acui_refresh_board();
		if ($('#acui_option_pro').prop('checked'))
			$('#acui_sect_eval').hide();
		else
			$('#acui_sect_eval').show();
		return true;
	});

	$('#acui_option_darktheme').change(function() {
		$('#acui_page').removeClass('ui-page-theme-a ui-page-theme-b').addClass('ui-page-theme-' + (ai.options.board.darkTheme?'b':'a'));
		$('#acui_rewind, #acui_switch_ui').removeClass('ui-btn-a ui-btn-b').addClass('ui-btn-' + (ai.options.board.darkTheme?'a':'b'));
		$('#acui_lastmove, #acui_assistance').html('');
		acui_refresh_matdiff();
		acui_refresh_score();
		acui_refresh_history(true);
	});

	$('#acui_option_level').change(function() {
		//-- ELO rating
		$('#acui_sect_level_header').html('Level' + (ai.options.ai.elo>0 ? ' ('+ai.options.ai.elo+')' : ''));

		//-- Warning
		if ($('#acui_option_level').val() >= 13)
			$('#acui_sect_level_notice').show();
		else
			$('#acui_sect_level_notice').hide();
	});

	$('#acui_option_randomizedposition').change(function() {
		if ($('#acui_option_randomizedposition').val() > 0)
			$('#acui_fischer').addClass('ui-disabled');
		else
			$('#acui_fischer').removeClass('ui-disabled');
	});

	//-- Default elements
	// Board
	$('#acui_js, #acui_sect_rewind, #acui_sect_level_notice').hide();
	if ((ui_mobile && acui_isphone()) || (!ui_mobile && !acui_isphone()))
		$('#acui_switch_ui').hide();
	if (ui_cordova)
		$('#acui_pgn').hide();
	// Actions
	acui_setMultiLines(false);
	// Options
	if (ui_mobile)
		acui_options_load();
	else
		$('#acui_option_predef').val(8).change();
	$('#acui_option_darktheme').change();
	// About
	$('#acui_version').html(ai.options.ai.version);
	// General
	$(document).on('selectstart', function() {
		return ai.options.board.debug;	//By default, no text selection to avoid moving the pieces on the screen
	});
	$(document).on('contextmenu', function() {
		return ai.options.board.debug;	//By default, no right click to not pollute the screen
	});
});
