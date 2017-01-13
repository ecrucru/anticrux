# AntiCrux

> Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile

**Test it online at http://ecrucru.free.fr/?page=anticrux !**



## Quick summary

- [Presentation](#presentation)
- [Features](#features)
- [Gameplay](#gameplay)
- [Options](#options)
	- [Some theory](#some-theory)
	- [For the intelligence](#for-the-intelligence)
	- [For the board](#for-the-board)
- [Programming interface](#programming-interface)
	- [Notations](#notations)
	- [Methods](#methods)
	- [Valuation](#valuation)
	- [NodeJS](#nodejs)
- [Information](#information)
	- [Change log](#change-log)
	- [License](#license)



## Presentation

AntiChess is a variant of the classical chess which consists in losing to win. The rules are very simple :

- there are no check, no mate and no castling,
- the winner has no more piece on the board or cannot move,
- when you can take an opponent's piece, you **must** take it,
- when you can take several opponent's pieces, you may choose which one to take,
- you can promote a king.

The logic of loosing all one's pieces leads to a really different way of thinking. On contrary to the classical chess, when you start to lose, you can still expect to win at the end. The programming of such an algorithm is easier than the classical chess because the nodes are generally reduced to the forced moves causing a maximal damage. That's why it is generally called a "forced-move game" or "suicide game".

AntiChess is rapidely repetitive. That's why AntiCrux also plays AntiChess960. The concept is to shuffle the pieces of the first line and there are 960 different positions. The rules are the same and will change your habits !

The game is written in JavaScript and requires preferably a powerful desktop computer, else it will use a classical technique. Indeed, the JavaScript interpreter consumes a lot of memory depending on the current settings. The game works slightly better with the JavaScript implemented by Google compared to Mozilla.

AntiCrux is neither UCI-compatible, nor working as a Worker (which would allow an asynchronous execution).



## Features

- Client-side
- Based on HTML5 and jQuery Mobile
- 1 player (human vs. AI) or 2 local players (human vs. human)
- Initial or advanced position for AntiChess and AntiChess 960
- Several levels for the AI
- Informative or detailed hints
- History of the moves
- Undo
- Import from FEN, Lichess
- Export to FEN, PGN, Chess fonts
- NodeJS



## Gameplay

It mainly depends on the settings you set for the analysis of the decision tree. The default application is shipped along with several possible levels :

- Oyster : random play
- Handicaped player : restricted classical play
- Classical player : average damage at low depth
- Advanced classical player : deeper average damage
- Tactical player : set of techniques
- Champion 512 MB : full set of techniques
- Champion 1 GB : deeper full set of techniques
- Champion 2 GB : deepest full set of techniques

"Champion" is a very relative term as it has never won any competition at all and will certainly never succeed in that task. It just means that AntiCrux will use its maximal optimized capabilities. The number followed by MB or GB is the recommended memory to be available else the browser will probably crash.

The final release of AntiCrux has competed with StockFish Antichess available at [www.lichess.org](https://lichess.org). Following the [calculation rules](http://www.fide.com/component/handbook/?id=172&amp;view=article), the maximal rating of AntiCrux with no time limit is estimated at **1980** (with no guarantee of accuracy).



## Options


### Some theory

The options influence how the choice of a move is done by AntiCrux. Therefore, it is needed to know a little how it works.

Schematically, AntiCrux plays all the possible moves to find a better situation. The problem is that it becomes rapidely exponential and exploring more than 4 half-moves is complicated, at least in JavaScript. Thanks to the rules of AntiChess which insist on the forced moves, their quantity can be reduced a lot and it allows the algorithm to explore deeper. Then its efficiency is higher.

Basically, playing one piece is an **half-move** and it generates a new position called **node**. This node leads to new nodes if there are available moves for the next player. The nodes are linked to each other and the player is alternate between each turn. This is modelled with a tree with plenty of leaves and we have to cut the branches to discover its hidden treasure : the right move to play !

The positions are valuated at the lowest level. Then by use of rules of aggregations, the upper levels are weighted with some formulas based on the number of moves, the strength of the remaining pieces, etc... Once the first level is reached, we can pick the move with the best score. This score is a collection of hypothesis which should help the artificial intelligence to win. It is up to you to beat it. Have fun !

The algorithm implements some randomness in order to never play the same games. With the level "Champion", the randomness is rather reduced.


### For the intelligence

- **AntiCrux.options.ai.version**

It is the version of the algorithm implemented for AntiCrux.

- **AntiCrux.options.ai.maxDepth**

The maximal depth is the number of half-moves which can be explored. The value is restricted to the amount of available memory on your computer. Mathematically, there are more possible positions at the beginning of the game, so it is normal to be less restricted by the depth at the end of the game.

The value can be increased drastically if you enable *minimizeLiberty*. But the game will always play the forced moves even if it is not the best move. This is especially true at the beginning of the game.

If you don't want that, you should reach the maximal depth dynamically at any moment. So you can set the maximal depth to 99, define a maximal number of nodes relevant with the size of your memory (*maxNodes*) and ask to reach this limit all the time (*wholeNodes*).

- **AntiCrux.options.ai.maxNodes**

The number of positions to be analyzed impacts the consumption of memory. When there is not enough memory, the browser will crash and your game will be lost.

If you put the value to zero, the maximal number of nodes is defined by the depth to be reached. The risk of crash is then very high. So this option is more relevant at the end of the game where the possibilities are reduced.

The number of nodes is a known restriction to allow AntiCrux to finish a game properly. If a node is not evaluated because of this limit, AntiCrux may play inaccurately and it will rely on your own arbitration. Make a challenge "Rook vs. King" to see how undeterministic the situation is despite the fact that the rook can win if it has the right initial position.

- **AntiCrux.options.ai.minimizeLiberty**

The simplification consists in playing the forced moves all the time even if is not the best move from a general point of view. It also contributes to a reduced variety of the game.

When multiple moves are possible, the other options will help to decide how to pick the best one.

In the following table issued from a game, the number of nodes is really reduced when the feature is enabled :

| Depth | Normal nodes  | Reduced nodes |
|:-----:|:-------------:|:-------------:|
| 2     | 146           | 21            |
| 3     | 1898          | 40            |
| 4     | 35883         | 73            |
| 5     | 461749        | 147           |
| 6     | 5449480 (?)   | 322           |
| 7     | 70712349 (?)  | 648           |
| 8     | 917562070 (?) | 1506          |

- **AntiCrux.options.ai.noStatOnForcedMove**

To play faster when the moves are forced, you can choose to not perform a deep analysis to evaluate the position of the artificial intelligence.

The statistics will be updated the next time several moves are possible. So this option accelerates the game play.

- **AntiCrux.options.ai.wholeNodes**

The exploration is done depth by depth to permit an homogeneous evaluation of all the possible moves. When you reach a next depth, the number of nodes increases exponentially. Their number is approximately given by the relation "Nodes=A\*exp(B\*Depth)" where A and B are two constants to be determined with an [exponential regression](http://keisan.casio.com/exec/system/14059930754231).

If the option is set to true, you are exposed to a partial exploration of the deepest level while the previous one have been entirely explored. This is generally not an issue because it is often good to explore a maximal number of nodes even if some are not totally processed.

If you don't use the option, the number of nodes is first estimated for each depth. If the prediction is lower than the defined maximal number of nodes (*maxNodes*), the next level is explored and there is great chance that it will be entirely explored and still in the limit of the maximal number of nodes. The advantage of this option is that it reduces the thinking time dynamically. The game is quicker and never a constant.

- **AntiCrux.options.ai.randomizedSearch**

When you scan the nodes at the deepest level, the processing order is always the same. To bring some randomness in the game, the randomization of the moves at each level is a good option.

- **AntiCrux.options.ai.pessimisticScenario**

When it is not up to you to play, you can expect your opponent to play his best move. Assuming that you can't rely on the mistake of your opponent to reach a good position, the algorithm consider a very defensive approach by being pessimistic.

If your opponent is weak, you can turn off this option and you will be able to make higher damages if the chance is on your side.

Concluding the game with this option is particularly hard. That's why the option is silently turned off in some cases.

- **AntiCrux.options.ai.bestStaticScore**

When the algorithm has to choose between several positions having the same deep valuation, this option picks the move having the best immediate valuation.

The opponent may be discouraged in the short term by this killing move, even if it doesn't change a lot for the next turns.

The option reduces the randoness of the game.

- **AntiCrux.options.ai.opportunistic**

Sometimes a winning position is hidden by counter moves of the opponent. However, it will not necessary play one of these moves. So when we have equivalent positions, the option will favor the ones leading to a potential win.

The option reduces the randomness of the game.

- **AntiCrux.options.ai.handicap**

This option weakens the algorithm by removing randomly some possible moves above a minimal number of moves.

The number is expressed as a percentage between 0 and 100.

- **AntiCrux.options.ai.acceleratedEndGame**

When the artificial intelligence is sure to win, the move is chosen to put an end to the game as fast as possible. Else the game may never finish. Indeed, this option is recommended all the time.

It is up to the human player to declare a draw by stopping the game.

- **AntiCrux.options.ai.oyster**

This option activates the worst play ever. It just picks randomly among the possible moves.

Mechanically, it deactivates the other options based on the decision tree.


### For the board

- **AntiCrux.options.board.rotated**

When you play Black, the board must be rotated at 180°.

- **AntiCrux.options.board.symbols**

When the symbols are activated, some nice Unicode characters will replace the standard letters :

- R : rook
- N : knight
- B : bishop
- Q : queen
- K : king

If the unicode characters are not displayed (example: &#9819; and &#9813;), you have to turn off the option.

- **AntiCrux.options.board.fischer**

The option is a number between 1 and 960. It defines a position where the pieces of the first line are shuffled is a precise order.

The classical position is equal to 519. You can read more on [Wikipedia](https://en.wikipedia.org/wiki/Chess960).

- **AntiCrux.options.board.coordinates**

The option activates the coordinates all around the board.

When the option is disabled, the board is more compact.

- **AntiCrux.options.board.noStatOnOwnMove**

To not interfere with your thinking, the statistics are not generated when you play. You can use a hint on demand from the general user interface.

- **AntiCrux.options.board.fullDecisionTree**

The decision tree is the basic structure of nodes helping to find the best move. In practice, the player needs to read the deepest level, not every level.

Essentially for debugging purposes, you can ask to show all the levels. In any case, the depth is restricted to a certain level.

- **AntiCrux.options.board.debugCellId**

This option is used for debugging purposes in the process of developing AntiCrux.


### For the gameplay

- **AntiCrux.options.variant.promoteQueen**

With this option, you immediately promote paws as queen. You cannot choose for another piece.

- **AntiCrux.options.variant.activePawns**

The option gives the pawn a higher static valuation when it has left its initial position.

The impact is on the valuation, not on the performances.

- **AntiCrux.options.variant.whiteBoard**

This human-related option renders the board with white pieces only. It may be used to reduce the readability of the game but the players must still follow the basic rules.

The export to FEN and PGN is not impacted.



## Programming interface


### Notations

The board is a mono-dimensional array of 64 cells. Black is at the top. White is at the bottom.

|     |  A |  B |  C | . |  H |
|-----|----|----|----|---|----|
|**8**|  0 |  1 |  2 | . |  7 |
|**7**|  8 |  9 | 10 | . | 15 |
|**.**|  . |  . |  . | . |  . |
|**1**| 56 | 57 | 58 | . | 63 |

The pieces are represented with an arbitrary internal identifier :

- AntiCrux.constants.piece.none
- AntiCrux.constants.piece.pawn
- AntiCrux.constants.piece.rook
- AntiCrux.constants.piece.knight
- AntiCrux.constants.piece.bishop
- AntiCrux.constants.piece.queen
- AntiCrux.constants.piece.king

The pieces are owned by a player :

- AntiCrux.constants.owner.black
- AntiCrux.constants.owner.none
- AntiCrux.constants.owner.white

The moves are identified by 3 notation systems :

- Algebraic notation : e3, Ra6, Nfxe5, h8=Q... This classical notation is practical for the human players but necessitates a complex processing to convert it into X/Y coordinates. It is used to register the moves and to show their history.
- Index-based notation : 0=A8 and 63=H1 as seen above. When looping an the mono-dimensional array of the board, the analysis is very simple to mark cells. It is then used internally to highlight the cells.
- XY notation : massively used internally for the processing of the moves, X and Y are concatenated. The first figure is X from 0 to 7. The second figure is Y from 0 to 7. For example, 56=G3. You can combine up to 5 figures to build a move : the first one is the promotion based on *AntiCrux.constants.piece*, the following 2 figures describe the source position, the following 2 figures describe the target position. For example, 51201=(cxb8=Q).


### Methods

A **node** is a position defined by pieces and their owner :

```javascript
node = {
  piece : [ /* 64 cells */ ],
  owner : [ /* 64 cells */ ]
};
```

A node is enriched with attributes when you call the API below. Any field or method beginning with an underscore is a private member which is not expected to be called directly by a third-party application.

- AntiCrux.clearBoard(pNode)
- AntiCrux.defaultBoard(pFischer, pNode)
- AntiCrux.freeMemory()
- AntiCrux.getDecisionTreeHtml(pNode)
- AntiCrux.getHistory(pNode)
- AntiCrux.getHistoryHtml(pNode)
- AntiCrux.getInitialPosition(pNode)
- AntiCrux.getMoveAI(pPlayer, pNode)
- AntiCrux.getMovesHtml(pPlayer, pNode)
- AntiCrux.getNumNodes()
- AntiCrux.getPieceByCoordinate(pCoordinate, pNode)
- AntiCrux.getPieceSymbol(pPiece, pPlayer, pSymbol)
- AntiCrux.getPlayer(pNode)
- AntiCrux.getReachedDepth()
- AntiCrux.getScore(pNode)
- AntiCrux.getWinner(pNode)
- AntiCrux.hasPendingPromotion(pNode)
- AntiCrux.hasSetUp(pNode)
- AntiCrux.highlight(pReset, pPosition)
- AntiCrux.highlightMove(pMove)
- AntiCrux.highlightMoves(pRefresh)
- AntiCrux.isDraw(pNode)
- AntiCrux.isEndGame(pNode)
- AntiCrux.loadFen(pFen, pNode)
- AntiCrux.loadLichess(pKey, pNode)
- AntiCrux.logMove(pMove, pNode)
- AntiCrux.movePiece(pMove, pCheckLegit, pPlayerIndication, pNode)
- AntiCrux.moveToString(pMove, pNode)
- AntiCrux.predictMoves(pNode)
- AntiCrux.promote(pPiece, pNode)
- AntiCrux.setPlayer(pPlayer, pNode)
- AntiCrux.switchPlayer(pNode)
- AntiCrux.toConsole(pBorder, pNode)
- AntiCrux.toFen(pNode)
- AntiCrux.toHtml(pNode)
- AntiCrux.toPgn(pNode)
- AntiCrux.toText(pNode)
- AntiCrux.undoMove(pNode)

The parameter *pNode* is generally optional. When you omit it, the internal root node is automatically picked.

Your instance is AntiCrux and embeds by default a "root" node representing the current board. The same instance will apply on any node provided in the argument. Consequently : a node is minimalist and an instance of AntiCrux is unique.


### Valuation

Once a node is evaluated, you get 2 attributes among others :

- node.valuation : the static score based on the weight of every piece
- node.valuationSolver : the deep valuation after a certain exploration of the depths and based on the settings of the instance

The valuation is based on a deep static score known as [centipawn](http://chess.wikia.com/wiki/Centipawn). A queen has a high score, not a pawn. Black and White are added and the valuation is changed to a percentage for a better understanding. This score varies between -100% (bad score for Black) and +100% (bad score for white).

&#x26a0; The score shows the strength of the player, so its ability to lose AntiChess. Your objective is then to modify the score in favor of your opponent.


### NodeJS

AntiCrux is built to be compatible with NodeJS through the package named "anticrux".

```bash
npm install anticrux
```

If you meet the prerequisites, you can run the demo with the following command :

```bash
node nodejs_demo.js
```



## Information


### Change log

- November 11th 2016 - Creation of the project
- December 25th 2016 - Version 0.1
- In progress - Version 0.1.1
	- Library: AntiCrux.prototype.getMoves renamed as AntiCrux.prototype.getMovesHtml
	- Library: New mandatory parameter for AntiCrux.prototype.highlightMoves
	- UI: highlighted target cells when requesting a detailed hint
	- Library: no more 'v' in AntiCrux.options.ai.version
	- Library: AntiCrux.prototype._has can compare to string
	- UI: notification when JavaScript is disabled
	- UI: fix of incorrect error messages
	- UI: reordered tabs
	- Library: new method AntiCrux.prototype.highlightMove
	- Library: improved load from LiChess (example: 8efxLAuw)
	- Library: AntiCrux.prototype.getHistory renamed as AntiCrux.prototype.getHistoryHtml
	- Library: new method AntiCrux.prototype.getHistory
	- UI: enriched highlighted moves
	- Library: corrected spelling mistake for AntiCrux.options.board.fischer
	- Library: optimization of the AI (gameplay for weak levels and technical)
	- UI: review the game based on the history
	- Library: new method AntiCrux.prototype.getPieceByCoordinate
	- UI: easier selection of the moves
	- Library: new method AntiCrux.prototype.toConsole
	- Library: support for NodeJS
	- Library: new method AntiCrux.prototype.switchPlayer
	- Library: new method AntiCrux.prototype.predictMoves
	- UI: hint to predict the moves


### License

AntiCrux is released under the terms of the **GNU Affero General Public License version 3**.

- https://www.gnu.org/licenses/agpl-3.0.html

```javascript
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
```