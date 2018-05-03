/*
	AntiCrux - Suicide chess engine acting as desktop engine, web page, mobile application, Internet chess server and library
	Copyright (C) 2016-2018, ecrucru

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


//-- Library
var	AntiCrux = require('anticrux'),
	ai = new AntiCrux(),
	positions, i, results, index;

function printMessage(pMessage) {
	console.log((i<9?' ':'') + (i+1)+') '+positions[i][0]+', "'+positions[i][1]+'" => '+pMessage);
}


//-- Lists the positions to check
positions = [
	//- Interesting positions
	['Pawn game',										'8/6k1/3p3p/1p5P/1P6/5p2/1p3P2/8 b - -',						'g7g6'],
	['Quick win (f2f4) or Deep loss (f2f3)',			'3q1b2/4p1pr/4P3/8/6b1/8/5P2/8 w - -',							'f2f4'],
	['Deep win (f1h2) or Deep loss (f7e8)',				'1brqkn2/p1pppBp1/8/1p6/8/2P5/PP1PPP1r/B1RQKNNb w - -',			'f1h2'],
	['Mate in 4',										'2b1R1n1/5pp1/8/8/8/5P1P/8/5r2 w - -',							'e8g8'],
	['Mate in 5',										'8/6p1/4K3/8/7r/8/8/8 b - -',									'g7g5'],
	['Mate in 6',										'1r6/4npb1/n4k2/7P/P6R/P4K2/2P2P2/2R5 w - -',					'c1b1'],
	['Mate in 6',										'8/5pb1/n5k1/8/P6R/PP6/4KP2/8 w - -',							'h4d4'],
	['Mate in 7',										'1nb1k3/4Q3/6pn/8/8/8/2PqPP2/4K1N1 b - -',						'd2e1,e8e7,d2e2'],
	['Mate in 7 or 11 (3 possibilities)',				'r1bqk1nr/p2npp1p/1p4p1/8/4P3/6P1/P4b1P/5BR1 w - -',			'e4e5,f1a6,g3g4'],
	['Mate in 8 with 2 possibilities',					'r7/p7/n4B2/8/8/4PN2/P7/RN2K3 w - -',							'f6h8,f6d8'],
	['Mate in 10',										'2r1k1nr/p1pp1ppp/8/8/P7/1R3P2/2PP2PP/1NB1K1NR b - -',			'c8b8'],
	['Mate in 10',										'rnb4r/p1pk3p/5P2/8/1p6/1P3P2/P1PNP1P1/R3KBN1 b - -',			'd7e7'],
	['Mate in 10',										'6n1/p7/2B2p2/8/8/4K3/P1P2PPR/RN6 w - -',						'h2h6'],
	['Mate in 11',										'1n1qk1n1/r1pp1p1r/1p6/8/8/1P4P1/2PK1P1P/1N3BNR w - -',			'b1a3,f1a6'],
	['Mate in 11',										'rn2k2r/ppp2p1p/5p2/8/8/N6P/PPPKPP1P/R1B2BNR b - -',			'b7b5'],
	['Mate in 11',										'4k2r/pppn2pp/4p3/8/8/N3PN2/PPP1K1P1/R1B5 w - -',				'f3e5'],
	['Mate in 12',										'1rbqk2r/Rppppp2/8/5n2/4P3/2P5/2P2PPP/1N2K1NR w - -',			'a7b7'],
	['Mate in 13 with 28 possibilities',				'rnb4K/pppp1k1p/5p2/2b5/4n3/8/8/8 b - -',						'f6f5,e4d6,c5e7,b7b6,c7c6,b7b5,b8c6,c5d4,e4g3,b8a6,c5a3,c5b4,a7a6,e4d2,e4f2,e4c3,c5g1,c5f2,c5e3,c5b6,c5d6,c5f8,d7d5,d7d6,7a5,f7e7,f7e8,f7e6'],
	['Mate in 16',										'1nbqkbnr/r1pp1ppp/4p3/1p6/1P6/2P5/P2PPPPP/RNB1KBNR b - b3',	'a7a2,f8b4'],
	['Mate in 16',										'rnb1kb1r/p1pp1ppp/7n/4P3/1p5R/1P6/P1P1PPP1/RNBQKBN1 w - -',	'd1d7,h4h6,h4b4'],

	//- Features
	['Support for the syntax of the moves',				'8/7p/8/8/8/b7/1P6/1N6 w - -',									''],				//xa3, bxa3, b2a3, b2xa3, b1a3, b1xa3, Na3, Nxa3 are supported
	['Average valuation at low level',					'8/3P4/8/2P5/4P3/8/8/6r1 w - -',								'd7d8n'],			//No promotion to bishop
	['Average valuation at low level',					'7K/p1p1p3/7b/7p/8/2k1p3/8/8 b - -',							'h6g7'],			//Forced move
	['Short path finder : direct suicide',				'8/5k2/8/3P4/8/8/8/8 b - -',									'f7e6'],
	['Short path finder : with promotion',				'8/P7/1p6/8/8/8/8/8 w - -',										'a7a8r,a7a8q'],
	['Short path finder : forced move',					'k7/1p6/1P6/8/8/8/8/8 b - -',									'a8a7'],
	['Short path finder : two-step move',				'8/8/8/1P6/8/8/8/5r2 b - -',									'f1c1,f1a1,f1f7'],
	['Short path finder : hard at low level',			'8/8/4kn2/8/1K6/8/2P5/8 w - -',									'b4c4'],
	['Short path finder : with distance',				'5R2/8/2k5/8/8/8/8/8 w - -',									'f8e8'],
	['Short path finder : delayed loss',				'8/8/8/8/2r5/8/K7/8 w - -',										'a2a1'],
	['Minimization of the liberty : direct effect',		'2Rn1b1r/1ppppppq/1k3n1p/8/1P6/6P1/2PPPPNP/1KBN1BQR w - -',		'c8d8,c8c7'],		//Rxd8=minimization, Rxc7=no minimization
	['Minimization of the liberty : negative effect',	'4k1nr/7Q/8/8/8/3P4/6PP/6rR b - -',								'g1g2,g1h1'],		//h8h7 loses
	['Distance : king vs. rook',						'8/1k6/8/8/5R2/8/8/8 w - -',									'f4d4'],
	['Promotion',										'8/5P2/8/8/4k1p1/8/8/8 w - -',									'f7f8r'],
	['En passant',										'8/8/8/2pP4/8/8/8/8 w - c6',									'd5c6'],
	['Deep move',										'8/8/1P2P1K1/8/3k4/8/8/8 b - -',								'd4c5'],
	['Draw by position',								'8/8/8/8/5B2/8/1p6/8 b - -',									'b2b1b']
];


//-- Processes each positions
ai.setLevel(15);
for (i=0 ; i<positions.length ; i++)
{
	//- Checks
	if (!ai.loadFen(positions[i][1]))
	{
		printMessage('KO - Invalid FEN');
		continue;
	}

	//- Finds the right move
	if (positions[i][2] != '')
	{
		results = positions[i][2].split(',');
		index = results.indexOf(ai.moveToUCI(ai.getMoveAI()));
		if (index == -1)
			printMessage('KO - Move not found');
		else
			printMessage('OK, #'+(index+1)+' choice');
		ai.freeMemory();
	}
}
