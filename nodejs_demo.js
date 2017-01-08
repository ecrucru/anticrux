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

// To run this demo:
//	1) Install NodeJS.org
//	2) Run "build_nodejs.bat" or install the package "anticrux"
//	3) Open a command line for NodeJS
//	4) From the right directory, execute:
//			node nodejs_demo.js


//-- Library
var AntiCrux = require('anticrux');

//-- Instance
var ai = new AntiCrux();

//-- Options
// Refer to the default settings in "ai.options"

//-- Suggested move
try {
	//- Position
	if (!ai.loadFen('1r6/4npb1/n4k2/7P/P6R/P4K2/2P2P2/2R5 w - -'))
	{
		console.log('Wrong FEN : impossible to continue');
		return;
	}

	//- Analysis
	console.log(ai.toConsole() + "\n\n");
	console.log('FEN   : ' + ai.toFen());
	console.log('Move  : ' + ai.moveToString(ai.getMoveAI()));
	var score = ai.getScore();
	if (score === 0)
		console.log('Score : neutral');
	else if (score < 0)
		console.log('Score : ' + (-score) + '% against Black');
	else
		console.log('Score : ' + score + '% against White');
}
catch(e) {
	console.log(e);
}
