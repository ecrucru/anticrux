# AntiCrux

> Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile and Node.js

**Test it online at http://ecrucru.free.fr/?page=anticrux !**



## Quick summary

- [Presentation](#presentation)
- [Installation](#installation)
	- [Grab your copy](#grab-your-copy)
		- [Stable](#stable)
		- [Work in progress](#work-in-progress)
	- [Web interface](#web-interface)
	- [Mobile interface](#mobile-interface)
	- [Mobile application](#mobile-application)
	- [Node.js](#nodejs)
	- [AntiCrux Server](#anticrux-server)
	- [AntiCrux Engine](#anticrux-engine)
		- [Procedure for pyChess](#procedure-for-pychess)
	- [AntiCrux hELO world](#anticrux-helo-world)
- [Information](#information)
	- [Change log](#change-log)
	- [License](#license)
- [Corner for developers](#corner-for-developers)
	- [General approach](#general-approach)
	- [Options](#options)
		- [For the AI](#for-the-ai)
		- [For the board](#for-the-board)
		- [For the gameplay](#for-the-gameplay)
		- [Levels](#levels)
	- [Notations](#notations)
	- [API](#api)
	- [Valuation](#valuation)



## Presentation

AntiCrux is a library written in JavaScript which plays a single variant of chess named "AntiChess", "Suicide chess" or also "Loosing chess". You can play against the computer with :

- a mobile web-interface for tablets, desktops and phones
- a remote server by using the same commands than the Free Internet Chess Server (FICS)
- a chess engine to connect with your UCI-compatible desktop application

For technical reasons inherited from JavaScript and its design, AntiCrux will never reach the highest and unbeatable ELO ratings. Its level is rather *[normal](#anticrux-helo-world)* and the 20 available levels implement various techniques and rules to act like a human as much as possible. It is then a good tool to increase your skills with fun.

About the variant AntiChess, the objective consists in losing all your own pieces or reaching a stalemate. For that, you will probably have to force the moves. The rules are very simple :

- there are no check, no mate and no castling
- the winner has no more piece on the board or cannot move
- when you can take an opponent's piece, you **must** take it
- when you can take several opponent's pieces, you may choose which one to take
- you can promote a king

AntiChess960 is another variant for which the pieces of the first line are shuffled in a precise order. It offers 959 new start positions, the 519th one being the classical position. The other rules are not changed.

The logic of loosing all one's pieces leads to a really different way of thinking. When you start to lose, you can still expect to win at the end. The number of materials counts but the way you play at any moment as well.



## Installation

AntiCrux is delivered via [Github](https://github.com/ecrucru/anticrux/) and [NPM](https://www.npmjs.com/package/anticrux).


### Grab your copy

#### Stable

The stable releases are displayed on Github :

- [https://github.com/ecrucru/anticrux/releases](https://github.com/ecrucru/anticrux/releases)

The NPM package "[anticrux](https://www.npmjs.com/package/anticrux)" is equivalent :

```bash
npm install anticrux
```

#### Work in progress

You generally have 2 branches which can be downloaded as an archive :

- Master : [https://github.com/ecrucru/anticrux/archive/master.zip](https://github.com/ecrucru/anticrux/archive/master.zip)
- Dev (if available) : [https://github.com/ecrucru/anticrux/archive/dev.zip](https://github.com/ecrucru/anticrux/archive/dev.zip)

You can also replicate the repository if you own Git :

```bash
git clone https://github.com/ecrucru/anticrux.git
```


### Web interface

As a chess player, you simply have to double-click on the file "index.html" to launch the web-interface in your default browser.

The tab "Board" offers the general features to move the pieces. You can't drag and drop a piece, but use 2 separate clicks.

The tab "Actions" handles the generation of a new game. By putting aside the buttons to start a game, you will not click unexpectedly on them while you are playing.

The tab "Options" is where you refine the settings of the game. Each level is assigned some changeable features and you have to know that a higher level is not necessarily stronger. You can refer to the [dedicated paragraph](#anticrux-helo-world) to understand why.

The tab "Tree" is a way to view the decision tree used by the library. The activation requires more memory, so it is disabled by default.

The tab "About" provides the legal information about AntiCrux.


### Mobile interface

The mobile version is a light-weighted version of the [web-interface](#web-interface). It is suitable for a smartphone which screen is often reduced and which performances are sometimes reduced.

The options are set to the minimum and the board fits to the screen.


### Mobile application

By using the technologies behind Adobe PhoneGap and Apache Cordova, it is possible to create a standalone, multi-platform and authorization-free application for your smartphone.

The application is periodically compiled online by Adobe PhoneGap Build from the freshest code of the master branch hosted on Github :

- [https://build.phonegap.com/apps/2597052/share](https://build.phonegap.com/apps/2597052/share)

For **Android 4+**, follow these steps :

- Go to the menu "Settings" of your phone, category "Security", and activate the "Unsafe sources" to allow the installation
- Download the APK file from the link above
- Click on the downloaded file
- Validate the installation
- Go back to the settings to deativate the unsafe sources
- Run the application

For **Windows Phone**, the application is made available from a technical perspective. It has not been tested with a real device.

For **iOS**, you will not get any copy because the project team has no development key for that platform.


### Node.js

To use the different modules of AntiCrux out of a web-browser, you must install [Node.js](https://nodejs.org). With a packet manager under Linux, you can type :

```bash
apt-get install nodejs nodejs-legacy
```

Additional tools may be added globally :

```bash
npm install -g uglify-js jshint yuidocjs
```

AntiCrux can be built locally with two scripts :

- "build_min.bat" (Windows) or "build_min.sh" (Linux) creates the minimized version of the library (if needed by the HTML user interface)
- "build_nodejs.bat" (Windows) or "build_nodejs.sh" (Linux) copies the right files into the sub-directory "node_modules"

To test if your installation is working, you can run the following test :

```bash
node --expose-gc anticrux-demo.js
```

Remark : if you don't install the package "nodejs-legacy", replace the command "node" by "nodejs".


### AntiCrux Server

You need first to install [Node.js](#nodejs).

To access the engine remotely over a network, you can execute AntiCrux as a chess server. By default, it listens to local connections on the port 5000 and you can't create more than one instance on the same port.

Start the server by double-clicking on the script "run_server.bat" (Windows) or "run_server.sh" (Linux).

Because it mimics the commands of the Free Internet Chess Server (FICS), AntiCrux Server is compatible with any ICS client not supporting timeseal.

- Telnet (text-mode, console) is supported. Type "help" to view the implemented commands.

```
telnet localhost 5000
```

- WinBoard is supported and offers the highest compatibility because it natively supports the variants of chess.

```
"AntiCrux Server" /icshost=localhost /icsport=5000
```

- Arena is not really supported because it applies the rules of chess on the variant. It can be mitigated with the following settings :
	- Log as a guest without timeseal
	- In the menu "Options > Appearence > Chessboard > Move input", you should disallow the one-click move
	- In the menu "Options > Appearence > Other settings", you must disable the check of the legality of the moves
	- To promote a king, you must type the move in the command-line (example: b2b1=K)
	- You may have to disconnect between two games

- pyChess is not supported.


### AntiCrux Engine

You need first to install [Node.js](#nodejs).

AntiCrux Engine acts like an UCI-compatible engine which can be connected to any modern desktop application. You will keep your habits and you will be able to create computer matches !

Some restrictions apply :

- AntiCrux Engine is a script (not an executable file) : the procedure is detailed below
- You can't stop the engine while it is thinking
- There is no time control
- No suggestion is displayed during the analysis

#### Verification

To verify that AntiCrux Engine reacts correctly, you can create the following file "uci_test.txt" **with an empty line at its end** :

```
uci
isready
ucinewgame
position startpos moves a3
go depth 5
```

Then run the command :

```
node --expose-gc anticrux-engine.js < uci_test.txt
```

#### Procedure for pyChess

Open the file "%USERPROFILE%\\.config\\pychess\\engines.json" with a text editor.

Append the following content (paths to be adapted) before the last "]" :

```json
, {
  "args": [
    "--expose-gc",
    "C:\\fullpath\\anticrux-engine.js"
  ],
  "command": "C:\\fullpath\\nodejs\\node.exe",
  "country": "fr",
  "name": "AntiCrux",
  "protocol": "uci",
  "variants": [
    "suicide"
  ],
  "workingDirectory": "C:\\fullpath\\anticrux\\"
}
```

Run pyChess : it will update this new entry with other custom fields provided by the latest release of AntiCrux.

You can now play from the menu "Game > New game > Suicide chess". If the engine doesn't appear in the drop-down list, then you can try to restore the following section in the configuration file :

```json
"variants": [
    "suicide"
  ],
```

This procedure is expected to change with the upcoming release of pyChess 0.12.5.


## AntiCrux hELO world

This tool generates a [PGN file](https://en.wikipedia.org/wiki/Portable_Game_Notation) to estimate the level of AntiCrux in regard of other UCI-compatible chess engines. For now, only AntiCrux and the special Stockfish-based engine developed by @ddugovic and compiled by @niklasf are considered because they are related to JavaScript.

To get reliable games, the processing will take hours (or days !). To accelerate the generation, you may launch in parallel with the scripts "run_elo.bat" (Windows) or "run_elo.sh" (Linux) as many processes as your computer has CPU.

The script has 3 main changeable parameters :

- job.genGames : should the script play games and append the result to the PGN file ?
- job.numGames : how many games should be generated per CPU ?
- job.genStats : should the script estimate AntiCrux's rating based on the rules provided by the chess federation FIDE ?

The following rules apply to make the determination possible :

- The player is identified by its name : 2 different levels are 2 separate players even if the engine is the same
- The level of Stockfish AntiChess is assumed to be known : the taken reference is lichess.org
	- Please note that lichess.org uses [Glicko](https://en.wikipedia.org/wiki/Glicko_rating_system) which is assumed not being the same than ELO
- A player must compete with at least 3 different players having known ratings
- AntiCrux doesn't compete with itself
- Stockfish AntiChess can compete with itself
- A player should play at least 9 times
- A player must win at least one time

You will read such an output at the end :

```
>> Based on the declared rankings of Stockfish 8 with multi-variants support on lichess.org :
   - AntiCrux Level 14 is ranked 1727 after 124 games (+50/=4/-70).
```

If you don't have enough data, you can rely on another statistical method with the tool named "[BayesElo](https://www.remi-coulom.fr/Bayesian-Elo/)". Download it and type the following commands :

```
> bayeselo.exe
ResultSet>readpgn anticrux-elo.pgn
639 game(s) loaded, 0 game(s) with unknown result ignored.
ResultSet>elo
ResultSet-EloRating>mm 1 1
ResultSet-EloRating>exactdist
ResultSet-EloRating>ratings
Rank Name                Elo    +    - games score oppo. draws
   1 Stockfish Level 8  1052  232  152   125  100%   -13    0%
   4 Stockfish Level 5   322   92   87   128   66%   110    0%
   5 AntiCrux Level 9    155  281  274    10   50%   184    0%
  11 AntiCrux Level 15     0  262  317    14   18%   431    7%
  12 Stockfish Level 4   -28   87   86   103   44%   105    3%
  14 AntiCrux Level 4    -52  251  271    13   31%   218    0%
  21 Stockfish Level 1  -593  106  125   137    6%   222    0%
  23 AntiCrux Level 1   -783  313  491    13    0%   363    0%
ResultSet-EloRating>x
ResultSet>x
```

The ELO is shown relatively to an offset equal to 0 by default. If the offset is equal to 1500, you add that offset to the displayed ELO to get the estimation. However, if we assume that the lowest level is 900 ELO, the offset becomes 1683. So depending on the considered offset, the rank of AntiCrux may vary from 1650 to 1850.

It is also interesting to point out that the ELO rating of AntiCrux is not "proportional" to the chosen level. This is due to the implemented tactical rules which don't rely on the depth and the time to get a competitive advantage.


## Information


### Change log

- November 11th 2016 - Creation of the project
- December 25th 2016 - Version 0.1.0
	- Initial set of features
- February 3rd 2017 - Version 0.2.0
	- Library: AntiCrux.prototype.getMoves renamed as AntiCrux.prototype.getMovesHtml
	- Library: new mandatory parameter for AntiCrux.prototype.highlightMoves
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
	- Library: support for Node.js
	- Library: new method AntiCrux.prototype.switchPlayer
	- Library: new method AntiCrux.prototype.predictMoves
	- UI: hint to predict the moves
	- Library: new method AntiCrux.prototype.startUI (restricted to Node.js)
	- Library: new method AntiCrux.prototype.getNewFischerId
	- UI: integration around the Fischer's identifier of a game
	- Library: deep technical remodelling of the library for speed and lower impact on the memory
	- Library: new method AntiCrux.prototype.copyOptions
	- Library: new method AntiCrux.prototype.resetStats
	- Library: bug fix in the processing of the option AntiCrux.options.ai.noStatOnForcedMove
	- Library: new method AntiCrux.prototype.getOppositePlayer
	- UI: improved layout for the history of the moves
	- Library: improvement of the deep analysis
	- Library: new parameter for AntiCrux.prototype.isEndGame
	- Library: the minimal search depth is now 1 (previously 3)
	- UI: blind and random modes
- In progress - Version 0.3.0
	- Server: new server based on Node.js
	- Readme: update
	- UI: button "Rematch"
	- Library: new method AntiCrux.prototype.isMove
	- Library: new method AntiCrux.prototype.setLevel
	- Library: new method AntiCrux.prototype.moveToUCI
	- Library: new method AntiCrux.prototype.getMainNode
	- Library: new method AntiCrux.prototype.callbackExploration(pMaxDepth, pDepth, pNodes)
	- Engine: new UCI-compatible chess engine based on Node.js
	- Library: the method AntiCrux.prototype.getMoveAI doesn't return NULL anymore but AntiCrux.constants.move.none
	- Library: scripts for Linux
	- ELO: new tool to create games between computers
	- Library: deactivable move "en passant"
	- Library: support for the halfmove clock
	- Library: new method AntiCrux.prototype.updateHalfMoveClock
	- Library: new method AntiCrux.prototype.getHalfMoveClock
	- Library: new method AntiCrux.prototype.isPossibleDraw
	- Library: new parameter for AntiCrux.prototype.isDraw
	- Library: new method AntiCrux.prototype.getDrawReason
	- Library: new method AntiCrux.prototype.getLevel
	- Mobile: new UI for phones
	- Library: new weights for the valuation
	- UI: favicon
	- UI/Mobile: switch view depending on the connected device
	- App: mobile application for Android and WinPhones
	- UI: use of the embedded levels


### License

AntiCrux is released under the terms of the **GNU Affero General Public License version 3**.

- https://www.gnu.org/licenses/agpl-3.0.html

```javascript
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
```



## Corner for developers


### General approach

It is important to know how the options influence a move AntiCrux makes.

Schematically, AntiCrux plays all the possible moves to find a better situation. Finding the possible moves becomes exponential rapidly. Exploring more than 4 half-moves can be complicated. Because AntiChess insists on the forced moves, the number of possible moves can be reduced a lot, allowing the algorithm to explore deeper with higher efficiency.

Playing one piece is an *half-move* generating a new position called *node*. This node will lead to new nodes if there are available moves for the next player. The nodes are connected and the players take turns in the play. This game is modelled with a tree structure whose branches can be cut for its hidden treasure : the right move to play !

The positions are valuated from the bottom. Then by rules of aggregation, the upper levels are weighted based on the number of moves, the strength of the remaining pieces, etc... Once the top level is reached, AntiCrux can pick the move with the best score. It is your job to beat the AI !

The algorithm adopts some randomness to never play the same game. With high levels, the randomness is rather reduced.


### Options


#### For the AI

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

- **AntiCrux.options.ai.maxReply**

The minimization of the liberty of your opponent doesn't necessarily pick the right move. Sometimes it is better to leave more than 1 opportunity of reply to be able to enlarge the strategy. This is very noticeable in the position "4k1nr/7Q/8/8/8/3P4/6PP/6rR b - -" :

- Rxh7 leaves 1 move in Rxg1 but you lose
- Rxh1 leaves 2 moves in Qxg8 and Qxh8 but you don't lose immediately

This option is relevant when AntiCrux.options.ai.minimizeLiberty is activated. The higher the figure, the higher the nodes and the lower the depth. The recommended values are 1 (forced moves where possible) or 2 (tolerable liberty without forced moves).

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


#### For the board

- **AntiCrux.options.board.darkTheme**

The pieces in Unicode are color-dependent and must be rendered independently from the theme used for the user interface. If your interface is dark, the black pieces are normally rendered in white. So this option cancels this effect.

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

- **AntiCrux.options.board.decisionTree**

The decision tree is the basic structure of nodes helping to find the best move. When this option is activated, some memory is allocated to represent the moves in a human-readable way.

- **AntiCrux.options.board.fullDecisionTree**

In practice, the player needs to read the deepest level, not every level.

For debugging purposes, you can ask to show all the levels within a certain limit. The memory is then impacted.

- **AntiCrux.options.board.analysisDepth**

This depth applies on the analysis of the moves. The deeper, the more anticipation you can expect.

This information consumes the memory and is less relevant at deep levels.

- **AntiCrux.options.board.debugCellId**

This option is used for debugging purposes in the process of developing AntiCrux.


#### For the gameplay

- **AntiCrux.options.variant.enPassant**

Some engines don't accept the rule "[en passant](https://en.wikipedia.org/wiki/En_passant)". So to comply with this restriction, you can (de)activate this chess rule.

- **AntiCrux.options.variant.promoteQueen**

With this option, you immediately promote paws as queen. You cannot choose for another piece.

- **AntiCrux.options.variant.pieces**

This human-related option renders the board differently. It may be used to reduce the readability of the game but the players must still follow the basic rules. The possible modes are :

- 0 : normal
- 1 : only white pieces
- 2 : only black pieces
- 3 : blind
- 4 : random

The export to FEN and PGN is not impacted.


#### Levels

The options above are combined into predefined levels in a range from 1 to 20. They serve for AntiCrux Server and AntiCrux Engine.

Please note that the web-interface offers all the options individually and fewer predefined levels.

| Level               | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12   | 13   | 14   | 15   | 16   | 17   | 18   | 19 | 20 |
|---------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:--:|:--:|
| maxDepth            | 3   | 8   | 8   | 8   | 3   | 5   | 6   | 7   | 8   | 9   | 10  | 15   | 20   | 30   | 30   | 30   | 40   | 40   | 45 | 50 |
| maxNodes            | 100 | 50k | 50k | 50k | 15k | 30k | 50k | 75k | 80k | 85k | 90k | 120k | 150k | 200k | 300k | 400k | 500k | 750k | 1M | 2M |
| minimizeLiberty     | -   | -   | -   | -   | -   | -   | -   | X   | X   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| maxReply            | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 3   | 2   | 1   | 1   | 1    | 1    | 2    | 2    | 2    | 2    | 2    | 2  | 2  |
| noStatOnForcedMove  | -   | -   | -   | -   | -   | X   | X   | X   | X   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| wholeNodes          | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| randomizedSearch    | X   | X   | X   | X   | X   | X   | X   | X   | X   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| pessimisticScenario | -   | -   | -   | -   | -   | -   | -   | -   | -   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| bestStaticScore     | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| opportunistic       | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -    | X    | X    | X    | X    | X    | X    | X  | X  |
| handicap            | 0   | 70  | 50  | 25  | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 0  | 0  |
| acceleratedEndGame  | -   | -   | -   | -   | X   | X   | X   | X   | X   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X  | X  |
| oyster              | X   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -    | -    | -    | -    | -    | -    | -    | -  | -  |

Remark : There is no evidence that these levels have very different ELO ratings.


### Notations

The board is a mono-dimensional array of 64 cells. Black is at the top and White is at the bottom, whatever the rotation of the board.

|     | A  | B  | C  | D  | E  | F  | G  | H  |
|:---:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
|**8**|  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |
|**7**|  8 |  9 | 10 | 11 | 12 | 13 | 14 | 15 |
|**6**| 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
|**5**| 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 |
|**4**| 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 |
|**3**| 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 |
|**2**| 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 |
|**1**| 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 |

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


### API

A node is a position defined by pieces and their owner, and a player :

```javascript
node = {
  piece  : [ /* 64 cells */ ],
  owner  : [ /* 64 cells */ ],
  player : AntiCrux.constants.owner.white
};
```

A node is enriched with attributes when you call the API below. Any field or method beginning with an underscore is a private member which is not expected to be called directly by a third-party application, unless you know exactly what you are doing.

- AntiCrux.callbackExploration(pMaxDepth, pDepth, pNodes)
- AntiCrux.clearBoard()
- AntiCrux.copyOptions(pObject)
- AntiCrux.defaultBoard(pFischer)
- AntiCrux.freeMemory()
- AntiCrux.getDecisionTreeHtml(pNode)
- AntiCrux.getDrawReason()
- AntiCrux.getHalfMoveClock()
- AntiCrux.getHistory()
- AntiCrux.getHistoryHtml()
- AntiCrux.getInitialPosition()
- AntiCrux.getLevel()
- AntiCrux.getMainNode()
- AntiCrux.getMoveAI(pPlayer, pNode)
- AntiCrux.getMovesHtml(pPlayer, pNode)
- AntiCrux.getNewFischerId()
- AntiCrux.getNumNodes()
- AntiCrux.getOppositePlayer(pNode)
- AntiCrux.getPieceByCoordinate(pCoordinate, pNode)
- AntiCrux.getPieceSymbol(pPiece, pPlayer, pSymbol)
- AntiCrux.getPlayer(pNode)
- AntiCrux.getReachedDepth()
- AntiCrux.getScore(pNode)
- AntiCrux.getWinner(pNode)
- AntiCrux.hasPendingPromotion(pNode)
- AntiCrux.hasSetUp()
- AntiCrux.highlight(pReset, pPosition)
- AntiCrux.highlightMove(pMove)
- AntiCrux.highlightMoves(pRefresh)
- AntiCrux.isDraw(pCriteria, pNode)
- AntiCrux.isEndGame(pSwitchPlayer, pNode)
- AntiCrux.isMove(pMove)
- AntiCrux.isPossibleDraw(pNode)
- AntiCrux.loadFen(pFen)
- AntiCrux.loadLichess(pKey)
- AntiCrux.logMove(pMove)
- AntiCrux.movePiece(pMove, pCheckLegit, pPlayerIndication, pNode)
- AntiCrux.moveToString(pMove, pNode)
- AntiCrux.moveToUCI(pMove)
- AntiCrux.predictMoves(pNode)
- AntiCrux.promote(pPiece, pNode)
- AntiCrux.resetStats()
- AntiCrux.setLevel(pLevel)
- AntiCrux.setPlayer(pPlayer, pNode)
- AntiCrux.startUI()
- AntiCrux.switchPlayer(pNode)
- AntiCrux.toConsole(pBorder, pNode)
- AntiCrux.toFen(pNode)
- AntiCrux.toHtml(pNode)
- AntiCrux.toPgn(pHeader)
- AntiCrux.toText(pNode)
- AntiCrux.undoMove()
- AntiCrux.updateHalfMoveClock()

The parameter *pNode* is generally optional. When you omit it, the internal root node is automatically picked.

Your instance is AntiCrux and embeds by default a "root node" representing the current board. The same instance will apply on any node provided in the argument. Consequently : a node is minimalist and an instance of AntiCrux is unique.

To get an extended help about the API, you can refer to the comments written in the library itself. They can be read from a web-browser by using YuiDoc. Run the script "run_yuidoc_server.bat" (Windows) or "run_yuidoc_server.sh" (Linux), then access to [http://localhost:3000](http://localhost:3000).


### Valuation

Once a node is evaluated, you get 2 attributes among others :

- node.valuation : the static score based on the weight of every piece
- node.valuationSolver : the deep valuation after a certain exploration of the depths and based on the settings of the instance

The valuation is based on a deep static score known as [centipawn](http://chess.wikia.com/wiki/Centipawn). A queen has a high score, not a pawn. Black and White are added and the valuation is changed to a percentage for a better understanding. This score varies between -100% (**bad** score for Black) and +100% (**bad** score for white).

&#x26a0; The score shows the strength of the player, so its ability to lose AntiChess. Your objective is then to modify the score in favor of your opponent.
