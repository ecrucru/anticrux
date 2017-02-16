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

var	ai = new AntiCrux(),
	ui_move, ui_move_pending, ui_rewind;
ai.options.board.symbols = true;
ai.defaultBoard();

function acui_options_load() {
	//-- AI
	$('#acui_option_maxdepth').val(ai.options.ai.maxDepth);
	$('#acui_option_maxnodes').val(ai.options.ai.maxNodes);
	$('#acui_option_minimizeliberty').prop('checked', ai.options.ai.minimizeLiberty);
	$('#acui_option_maxreply').val(ai.options.ai.maxReply).slider('refresh');
	$('#acui_option_nostatonforcedmove').prop('checked', ai.options.ai.noStatOnForcedMove);
	$('#acui_option_wholenodes').prop('checked', ai.options.ai.wholeNodes);
	$('#acui_option_randomizedsearch').prop('checked', ai.options.ai.randomizedSearch);
	$('#acui_option_pessimisticscenario').prop('checked', ai.options.ai.pessimisticScenario);
	$('#acui_option_beststaticscore').prop('checked', ai.options.ai.bestStaticScore);
	$('#acui_option_opportunistic').prop('checked', ai.options.ai.opportunistic);
	$('#acui_option_handicap').val(ai.options.ai.handicap).slider('refresh');
	$('#acui_option_acceleratedendgame').prop('checked', ai.options.ai.acceleratedEndGame);
	$('#acui_option_oyster').prop('checked', ai.options.ai.oyster);

	//-- Board
	$('#acui_option_fischer').val(ai.options.board.fischer);
	$('#acui_option_rotated').prop('checked', ai.options.board.rotated);
	$('#acui_option_symbol').prop('checked', ai.options.board.symbols);
	$('#acui_option_coordinates').prop('checked', ai.options.board.coordinates);
	$('#acui_option_nostatonownmove').prop('checked', ai.options.board.noStatOnOwnMove);
	$('#acui_option_decisiontree').prop('checked', ai.options.board.decisionTree);
	$('#acui_option_fulldecisiontree').prop('checked', ai.options.board.fullDecisionTree);
	$('#acui_option_debugcellid').prop('checked', ai.options.board.debugCellId);

	//-- Variant
	$('#acui_option_promotequeen').prop('checked', ai.options.variant.promoteQueen);
	$('#acui_option_activepawns').prop('checked', ai.options.variant.activePawns);
	$('#acui_option_pieces').val(ai.options.variant.pieces).change();
}

function acui_reset_ui(pResetPlayer) {
	ui_rewind = false;
	$('#acui_tab_board_header').trigger('click');
	$('#acui_valuation').val(0).slider('refresh');
	$('#acui_lastmove, #acui_nodes, #acui_depth, #acui_moves, #acui_history, #acui_dtree').html('');
	$('#acui_sect_rewind').hide();
	$('#acui_pgn').addClass('ui-disabled');
	ai.resetStats();
	if (pResetPlayer)
		$('#acui_player').val(ai.constants.owner.white).change();
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
			//- Overrides the existing selection if it is the same player
			if (ui_move.length == 2)
			{
				if (ai.getPieceByCoordinate(ui_move).owner == ai.getPieceByCoordinate(move).owner)
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
				if (move != ai.constants.move.none)
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
				throw 'Internal error - Report any error (#007)';
		}
		return true;
	});
	return true;
}

function acui_refresh_moves() {
	var val, player = parseInt($('#acui_player').val());
	$('#acui_valuation').val($('#acui_option_pro').prop('checked') ? ai.constants.score.neutral : ai.getScore().valuationSolverPC).slider('refresh');
	val = ai.getNumNodes();
	$('#acui_nodes').html((val === 0 ? '' : 'Nodes : '+val));
	val = ai.getReachedDepth();
	$('#acui_depth').html((val === 0 ? '' : 'Depth : '+val));
	$('#acui_moves').html($('#acui_option_pro').prop('checked') ? '<div>No statistic with the professional mode.</div>' : ai.getMovesHtml(player));
	if (ai.options.board.decisionTree)
		$('#acui_dtree').html(ai.getDecisionTreeHtml());
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
		var	index = parseInt(this.dataset.index),
			hist = ai.getHistory(),
			rewind, i;

		//-- Checks
		if (hist.length === 0)
			return false;
		if ((index < 0) || (index >= hist.length))
			return false;

		//-- Determines the position for the provided index
		rewind = new AntiCrux();
		rewind.copyOptions(ai);
		if (rewind.options.variant.pieces == 3)
			rewind.options.variant.pieces = 0;
		if (!rewind.loadFen(ai.getInitialPosition()))
			return false;
		for (i=0 ; i<=index ; i++)
		{
			if (rewind.movePiece(hist[i], false, rewind.constants.owner.none) == rewind.constants.move.none)
				throw 'Internal error - Report any error (#015)';
			else
			{
				rewind.switchPlayer();
				rewind.highlightMove(hist[i]);
			}
		}

		//-- Sets the mode
		acui_reset_ui(false);
		ui_rewind = true;
		$('#acui_player').val(rewind.getPlayer()).change();
		acui_refresh_history(false);
		$('#acui_board').html(rewind.toHtml());		//No event is attached to the cells
		return true;
	});
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
	ui_move = '';
	ai.logMove(ui_move_pending);
	ui_move_pending = ai.constants.move.none;
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
				acui_popup('The game is a possible draw.');
			setTimeout(	function() {		//Refreshes the screen before the AI plays
							$('#acui_play_ai').click();
						}, 1000);
		}
	}
}

function acui_switch_players() {
	if (ai.getPlayer() == ai.constants.owner.black)
		$('#acui_player').val(ai.constants.owner.white).change();
	else
		$('#acui_player').val(ai.constants.owner.black).change();
}

function acui_showWinner() {
	var winner = ai.getWinner();
	if (winner == ai.constants.owner.none)
		throw 'Internal error - Report any error (#008)';
	winner = (winner == ai.constants.owner.white ? 'White' : 'Black');
	acui_popup('End of the game. '+winner+' has won !');
}

function acui_popup(pMessage) {
	$('#acui_popup_text').html(pMessage);
	$('#acui_popup').popup('open', {});
}

$(document).ready(function() {
	//-- Initialization
	ui_move = '';
	ui_move_pending = ai.constants.move.none;
	ui_rewind = false;
	acui_refresh_board();

	//-- Updates the list of players
	$('#acui_player').find('option').remove().end();
	$('<option/>').val(ai.constants.owner.white).html('White to play').appendTo('#acui_player');
	$('<option/>').val(ai.constants.owner.black).html('Black to play').appendTo('#acui_player');
	$('#acui_player').val(ai.constants.owner.white).change();

	//-- Events (General)
	$("input[type='text']").on('click', function () {
		$(this).select();
		return true;
	});

	//-- Events (Board)
	$('#acui_player').change(function() {
		if (!ui_rewind)
			ai.setPlayer(parseInt($('#acui_player').val()));
		return !ui_rewind;
	});

	$('#acui_play_ai').click(function() {
		//-- Checks the current mode
		if (acui_isRewind())
			return false;

		//-- Inputs
		var	player = parseInt($('#acui_player').val()),
			move = ai.getMoveAI(player),
			doSwitch = false;

		//-- Checks
		if (move === null)
		{
			if (ai.isEndGame(false))
				acui_showWinner();
			return true;
		}

		//-- Moves
		$('#acui_lastmove').html('Last move : ' + ai.moveToString(move));
		acui_refresh_moves();
		if (ai.movePiece(move, true, player) != ai.constants.move.none)
		{
			ui_move = '';
			ai.logMove(move);
			acui_refresh_history(true);
			ai.highlightMove(move);
			if (ai.isEndGame(true))
			{
				acui_showWinner();
				acui_switch_players();
			}
			else
				doSwitch = true;
		}
		else
			acui_popup('The move has been denied. Choose another one.');
		acui_refresh_board();
		if (doSwitch)
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
		if (move != ai.constants.move.none)
			acui_promote(move);
		else
			acui_popup('The move has been denied. Choose another one.');
		ai.freeMemory();
		return true;
	});

	$('#acui_play_hint_soft').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Simple hints
		ui_move = '';
		ai.highlightMoves(true);
		acui_refresh_board();
		return true;
	});

	$('#acui_play_hint_hard').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Detailed hints
		ai.getMoveAI(parseInt($('#acui_player').val()));
		ui_move = '';
		ai.highlightMoves(false);
		acui_refresh_moves();
		acui_refresh_board();
		ai.freeMemory();
		return true;
	});

	$('#acui_play_hint_irma').click(function() {
		//-- Checks the current mode
		if (ui_rewind)
			return false;

		//-- Suggestion
		setTimeout(function() {
						acui_popup(ai.predictMoves().split("\n").join('<br/>'));
					}, 500);
		return true;
	});

	$('#acui_play_undo').click(function() {
		//-- Checks the current mode
		if (acui_isRewind())
			return false;

		//-- Undo
		var hist;
		if (ai.undoMove())
		{
			ui_move = '';
			acui_reset_ui(false);
			acui_refresh_moves();
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
		var dl, pgn;

		//-- Gets the PGN data
		pgn = ai.toPgn();
		if (pgn.length === 0)
			acui_popup('No data to export to PGN.');
		else
		{
			//- Downloads as a file
			// http://stackoverflow.com/questions/3665115/
			dl = document.createElement('a');
			dl.setAttribute('href', 'data:application/x-chess-pgn;charset=iso-8859-1,' + encodeURIComponent(pgn));
			dl.setAttribute('download', 'anticrux_'+(new Date().toISOString().slice(0, 10))+'.pgn');
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
		acui_reset_ui(true);
		acui_refresh_board();
		return true;
	});

	$('#acui_default').click(function() {
		ai.defaultBoard();
		ui_move = '';
		acui_reset_ui(true);
		acui_refresh_board();
		return true;
	});

	$('#acui_fischer_new').click(function() {
		$('#acui_option_fischer').dblclick();
		$('#acui_fischer_current').click();
		setTimeout(function() {
					acui_popup('You are playing AntiChess ' + ai.fischer + '.');
				}, 1000);
		return true;
	});

	$('#acui_fischer_current').click(function() {
		ai.defaultBoard(ai.options.board.fischer);
		ui_move = '';
		acui_reset_ui(true);
		acui_refresh_board();
		return true;
	});

	$('#acui_option_fischer').dblclick(function() {
		$('#acui_option_fischer').val(ai.getNewFischerId()).change();
		return true;
	});

	$('#acui_fen_load').click(function() {
		var player;
		if (!ai.loadFen($('#acui_input').val()))
		{
			acui_popup('The FEN cannot be loaded because it has a wrong format.');
			return false;
		}
		else
		{
			player = ai.getPlayer();
			ui_move = '';
			acui_reset_ui(true);
			acui_refresh_board();
			$('#acui_tab_board_header').trigger('click');
			$('#acui_player').val(player).change();
			if (ai.fischer !== null)
			{
				$('#acui_option_fischer').val(ai.fischer).change();
				if (ai.fischer != ai.constants.board.classicalFischer)
					acui_popup('You are playing AntiChess ' + ai.fischer + '.');
			}
			return true;
		}
	});

	$('#acui_fen_gen').click(function() {
		$('#acui_input').val(ai.toFen()).focus().click();
		return true;
	});

	$('#acui_lichess_load').click(function() {
		var player;
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
							acui_reset_ui(true);
							acui_refresh_board();
							acui_refresh_history(true);
							$('#acui_player').val(player).change();
							if (ai.fischer !== null)
							{
								$('#acui_option_fischer').val(ai.fischer).change();
								if (ai.fischer != ai.constants.board.classicalFischer)
									acui_popup('You are playing AntiChess ' + ai.fischer + '.');
							}
						}, 5000);				//5 seconds are arbitrary
			return true;
		}
	});

	$('#acui_text_gen').click(function() {
		$('#acui_input').val(ai.toText()).focus().click();
		return true;
	});

	$('#acui_free').click(function() {
		ai.freeMemory();
		return true;
	});

	//-- Events (Options)
	$('#acui_option_predef').change(function() {
		var i, d;

		//-- Predefined levels
		var levels = [
				//Champion
				{ maxDepth:50,	maxNodes:1000000,	wholeNodes:true,	minimizeLiberty:true,	maxReply:2,	noStatOnForcedMove:true,	randomizedSearch:true,	oyster:false,	pessimisticScenario:true,	bestStaticScore:true,	opportunistic:true,		handicap:0,		acceleratedEndGame:true		},
				{ maxDepth:40,	maxNodes: 500000,	wholeNodes:true,	minimizeLiberty:true,	maxReply:2,	noStatOnForcedMove:true,	randomizedSearch:true,	oyster:false,	pessimisticScenario:true,	bestStaticScore:true,	opportunistic:true,		handicap:0,		acceleratedEndGame:true		},
				{ maxDepth:30,	maxNodes: 200000,	wholeNodes:true,	minimizeLiberty:true,	maxReply:2,	noStatOnForcedMove:true,	randomizedSearch:true,	oyster:false,	pessimisticScenario:true,	bestStaticScore:true,	opportunistic:true,		handicap:0,		acceleratedEndGame:true		},
				//Tactical player
				{ maxDepth:10,	maxNodes:  90000,	wholeNodes:true,	minimizeLiberty:true,	maxReply:1,	noStatOnForcedMove:true,	randomizedSearch:true,	oyster:false,	pessimisticScenario:true,	bestStaticScore:false,	opportunistic:false,	handicap:0,		acceleratedEndGame:true		},
				//Advanced classical player
				{ maxDepth: 7,	maxNodes:  75000,	wholeNodes:false,	minimizeLiberty:false,	maxReply:1,	noStatOnForcedMove:false,	randomizedSearch:true,	oyster:false,	pessimisticScenario:false,	bestStaticScore:false,	opportunistic:false,	handicap:0,		acceleratedEndGame:true		},
				//Classical player
				{ maxDepth: 3,	maxNodes:  15000,	wholeNodes:false,	minimizeLiberty:false,	maxReply:1,	noStatOnForcedMove:false,	randomizedSearch:true,	oyster:false,	pessimisticScenario:false,	bestStaticScore:false,	opportunistic:false,	handicap:0,		acceleratedEndGame:true		},
				//Handicaped player
				{ maxDepth: 7,	maxNodes:  50000,	wholeNodes:false,	minimizeLiberty:false,	maxReply:1,	noStatOnForcedMove:false,	randomizedSearch:true,	oyster:false,	pessimisticScenario:false,	bestStaticScore:false,	opportunistic:false,	handicap:70,	acceleratedEndGame:true		},
				//Oyster
				{ maxDepth: 3,	maxNodes:    100,	wholeNodes:false,	minimizeLiberty:false,	maxReply:1,	noStatOnForcedMove:false,	randomizedSearch:true,	oyster:true,	pessimisticScenario:false,	bestStaticScore:false,	opportunistic:false,	handicap:0,		acceleratedEndGame:false	}
			];

		//-- Applies the configuration
		i = parseInt($('#acui_option_predef').val());
		if (levels[i] === undefined)
			return false;
		for (d in levels[i])
			ai.options.ai[d] = levels[i][d];
		acui_options_load();
		$("input[type='checkbox']").checkboxradio('refresh');
		return true;
	});

	$('#acui_option_maxreply').change(function() {
		$('#acui_option_minimizeliberty').prop('checked', true).checkboxradio('refresh');
		return true;
	});

	$('#acui_option_fulldecisiontree').change(function() {
		if ($('#acui_option_fulldecisiontree').prop('checked'))
			$('#acui_option_decisiontree').prop('checked', true).checkboxradio('refresh');
		return true;
	});

	$('.AntiCrux-ui-option').change(function() {
		//-- AI
		ai.options.ai.maxDepth				= parseInt($('#acui_option_maxdepth').val());
		ai.options.ai.maxNodes				= parseInt($('#acui_option_maxnodes').val());
		ai.options.ai.minimizeLiberty		= $('#acui_option_minimizeliberty').prop('checked');
		ai.options.ai.maxReply				= parseInt($('#acui_option_maxreply').val());
		ai.options.ai.noStatOnForcedMove	= $('#acui_option_nostatonforcedmove').prop('checked');
		ai.options.ai.wholeNodes			= $('#acui_option_wholenodes').prop('checked');
		ai.options.ai.randomizedSearch		= $('#acui_option_randomizedsearch').prop('checked');
		ai.options.ai.pessimisticScenario	= $('#acui_option_pessimisticscenario').prop('checked');
		ai.options.ai.bestStaticScore		= $('#acui_option_beststaticscore').prop('checked');
		ai.options.ai.opportunistic			= $('#acui_option_opportunistic').prop('checked');
		ai.options.ai.handicap				= parseInt($('#acui_option_handicap').val());
		ai.options.ai.acceleratedEndGame	= $('#acui_option_acceleratedendgame').prop('checked');
		ai.options.ai.oyster				= $('#acui_option_oyster').prop('checked');

		//-- Board
		ai.options.board.fischer			= parseInt($('#acui_option_fischer').val());
		ai.options.board.rotated			= $('#acui_option_rotated').prop('checked');
		ai.options.board.symbols			= $('#acui_option_symbol').prop('checked');
		ai.options.board.coordinates		= $('#acui_option_coordinates').prop('checked');
		ai.options.board.noStatOnOwnMove	= $('#acui_option_nostatonownmove').prop('checked');
		ai.options.board.decisionTree		= $('#acui_option_decisiontree').prop('checked');
		ai.options.board.fullDecisionTree	= $('#acui_option_fulldecisiontree').prop('checked');
		ai.options.board.debugCellId		= $('#acui_option_debugcellid').prop('checked');

		//-- Variant
		ai.options.variant.promoteQueen		= $('#acui_option_promotequeen').prop('checked');
		ai.options.variant.activePawns		= $('#acui_option_activepawns').prop('checked');
		ai.options.variant.pieces			= parseInt($('#acui_option_pieces').val());
		return true;
	});

	$('.AntiCrux-ui-option-refresh').change(function() {
		acui_refresh_board();
		return true;
	});

	//-- Default elements
	$('#acui_js, #acui_sect_rewind').hide();
	$('#acui_option_predef').val(5).change();
	$('#acui_version').html(ai.options.ai.version);
	$(document).on('selectstart', false);				//No text selection to avoid moving the pieces on the screen (not supported)
});
