# AntiCrux

> Artificial intelligence playing AntiChess and AntiChess960 with jQuery Mobile and Node.js

**Test it online at http://ecrucru.free.fr/?page=anticrux !**



## Quick summary

- [Presentation](#presentation)
- [Installation](#installation)
	- [Grab your copy](#grab-your-copy)
		- [Stable](#stable)
		- [Work in progress](#work-in-progress)
	- [Compatibility matrix](#compatibility-matrix)
	- [Web interface](#web-interface)
	- [Mobile interface](#mobile-interface)
	- [Mobile application](#mobile-application)
	- [Node.js](#nodejs)
	- [AntiCrux Server](#anticrux-server)
	- [AntiCrux Engine](#anticrux-engine)
		- [Available options](#available-options)
		- [Procedure for WinBoard](#procedure-for-winboard)
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



## Presentation

AntiCrux is a library written in JavaScript which plays a single variant of chess named "AntiChess", "Suicide chess" or also "Loosing chess". You can play against the computer with :

- a mobile web-interface for tablets, desktops and phones
- a remote server by using the same commands than the Free Internet Chess Server (FICS)
- a chess engine to connect with your UCI-compatible desktop application

For technical reasons inherited from JavaScript and its design, AntiCrux will never reach the highest and unbeatable ELO ratings. Its level is rather *[normal](#anticrux-helo-world)* and the 20 available levels implement various techniques and rules to act like a human as much as possible. It is then a good tool to increase your skills with fun !

About the variant AntiChess, the objective consists in losing all your own pieces or reaching a stalemate. For that, you will probably have to force the moves. The rules are very simple and change a lot the dynamics of the game :

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

- https://github.com/ecrucru/anticrux/releases

The NPM package "[anticrux](https://www.npmjs.com/package/anticrux)" is the latest stable release :

```bash
npm install anticrux
```

#### Work in progress

You generally have 2 branches which can be downloaded as an archive :

- Master : https://github.com/ecrucru/anticrux/archive/master.zip
- Dev (if available) : https://github.com/ecrucru/anticrux/archive/dev.zip

You can also replicate the repository if you own Git :

```bash
git clone https://github.com/ecrucru/anticrux.git
```


### Compatibility matrix

| AntiCrux                    | Windows | Linux | Macintosh | NodeJS | jsUCI | Android | iOS | Windows Phone    |
|:---------------------------:|:-------:|:-----:|:---------:|:------:|:-----:|:-------:|:---:|:----------------:|
| Web desktop UI              | Yes     | Yes   | Yes       | -      | -     | Yes     | Yes | (Not tested)     |
| Web mobile UI               | Yes     | Yes   | Yes       | -      | -     | Yes     | Yes | (Not tested)     |
| Application for smartphones | -       | -     | -         | -      | -     | Yes     | No  | Yes (Not tested) |
| NPM package                 | Yes     | Yes   | Yes       | Yes    | -     | -       | -   | -                |
| Engine UCI                  | Yes     | Yes   | Yes       | Yes    | Yes   | -       | -   | -                |
| Server                      | Yes     | Yes   | Yes       | Yes    | No    | -       | -   | -                |
| ELO                         | Yes     | Yes   | Yes       | Yes    | No    | -       | -   | -                |
| Quality                     | Yes     | Yes   | Yes       | Yes    | No    | -       | -   | -                |

Note : the symbol "-" denotes that a feature is not applicable.


### Web interface

As a chess player, you simply have to double-click on the file `index.html` to launch the web-interface in your default browser. The tested ones have different behaviours :

- Chrome : light, slow
- Firefox : memory intensive, fast

You have several tabs :

- "*Board*" : it offers the general features to move the pieces. You can't drag and drop a piece, but use 2 separate clicks.
- "*Actions*" : it handles the generation of a new game. By putting aside the buttons to start a game, you will not click unexpectedly on them while you are playing.
- "*Options*" : it is where you refine the settings of the game.
- "*About*" : it provides the legal information about AntiCrux.

Without any local installation, just check online at http://ecrucru.free.fr/?page=anticrux and you will get the same enjoyment.


### Mobile interface

The mobile version is a light-weighted version of the [web-interface](#web-interface) which fits with tiny screens.


### Mobile application

By using the technologies behind Adobe PhoneGap and Apache Cordova, it is possible to create a standalone, multi-platform and authorization-free application for your smartphone.

The application is periodically compiled online by Adobe PhoneGap Build from the freshest code of the master branch hosted on Github :

- https://build.phonegap.com/apps/2597052/share

For **Android 4+**, follow these steps :

- Go to the menu "Settings" of your phone, category "Security", and activate the "Unsafe sources" to allow the installation
- Download the APK file from the link above
- Click on the downloaded file
- Validate the installation
- Go back to the settings to deactivate the unsafe sources
- Run the application

For **Windows Phone**, the application is made available from a technical perspective. It has not been tested with a real device.

For **iOS**, you will not get any copy because the project team has no development key for that platform.


### Node.js

To use the different modules of AntiCrux out of a web-browser, you must install [Node.js](https://nodejs.org). With a packet manager under Linux, you can type :

```bash
apt-get install nodejs nodejs-legacy
```

If you are a software developer, few additional tools may be added globally :

```bash
npm install -g uglify-js jshint yuidocjs
```

To test if your installation is working, you can run the following test :

```bash
node --expose-gc anticrux-demo.js
```

As a convenient alternative, you may use jsUCI to run the [compatible modules](#compatibility-matrix). This tool is not recommended because it offers fewer capabilities compared to NodeJS. In practice, just replace any occurrence of `node.exe --expose-gc` by `jsuci_1_2.exe` (adapt the name to fit with the relevant version).


### AntiCrux Server

You need first to install [Node.js](#nodejs).

To access the engine remotely over a network, you can execute AntiCrux as a chess server. By default, it listens to local connections on the port 5000 and you can't create more than one instance on the same port.

Start the server by double-clicking on the script `run_server.bat` (Windows) or `run_server.sh` (Linux). To change the default level of the server, follow the indications written on the home screen when you connect.

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

AntiCrux Engine acts like an UCI-compatible engine which can be connected to any modern desktop application. You will keep your habits and you will be able to create computer matches ! The played variants are `suicide`, `giveaway` and `antichess`. They all refer to the same gameplay.

Some restrictions apply :

- AntiCrux Engine is a script (not an executable file) : the procedure is detailed below.
- You can't stop the engine while it is thinking.
- There is no time control.

#### Verification

To verify that AntiCrux Engine reacts correctly, open a terminal and run :

```bash
node --expose-gc anticrux-engine.js
```

Then type UCI commands from scratch :

```
uci
setoption name UCI_Variant value suicide
setoption name Skill Level value 12
isready
ucinewgame
position startpos moves a3
go infinite
```

#### Available options

- `Debug` : this option is reserved for the developers to track all the issues that may arise during the use of the engine.
- `Precise Score` : if the move is forced, a deep analysis doesn't occur unless you activate this option. It slows down the engine but you get a better evaluation of the score.
- `Skill Level` : the level is the difficulty of the game. The higher, the bigger the memory footprint.
- `UCI_Variant` : it defines the chess variants supported by the engine.

#### Procedure for WinBoard

You need to use at least WinBoard 4.9 else you will be told that the variant `suicide` is not supported.

In WinBoard, add a new engine and set the following options :

- Nickname : `AntiCrux`
- Engine : `"C:\full-path-to-nodejs\node.exe"`
- Command-line parameters : `--expose-gc "C:\fullpath-to-anticrux\anticrux-engine.js"`
- Special WinBoard options : `/variant=suicide`
- Directory : `C:\fullpath-to-anticrux\`
- [X] UCI
- [X] Add this engine to the list

This settings will end up with an equivalent line added to the list of engines :

```
"AntiCrux" -fcp 'C:\fullpath-to-nodejs\node.exe --expose-gc "C:\fullpath-to-anticrux\anticrux-engine.js"' -fd "C:\fullpath-to-anticrux\anticrux\" -fn "AntiCrux" -fUCI /variant=suicide
```

Restart WinBoard. On the main dialog "WinBoard Startup", select AntiCrux from the drop-down lists to start a new game against it.

During the game, if you do an incorrect move under certain conditions, the engine will probably leave the game because WinBoard doesn't send a correct position to analyze.

To start an AntiChess960 game, go to "File > New shuffle game..." and pick a number random. This will not launch a game with the classical rules.

To activate the logo in WinBoard, copy the picture located at `images/anticrux.bmp` to the same folder as the file `anticrux-engine.js`, then rename the copied picture as `logo.bmp`.

#### Procedure for pyChess

The following procedure applies from pyChess 0.99 released on September 2017.

Run pyChess. In the menu "Edit > Engines", add a new engine by selecting `anticrux-engine.js`.

Then set `--expose-gc` for the parameters of the environment.

The working directory is the one where the engine is stored.

To start a new game, you should always use the menu "File > New game" because the home screen is unable (at the current time) to start a variant game. From the dialog of the new game, you must select the variant called "Suicide" or "Giveaway" and then select the engine.


## AntiCrux hELO world

This tool generates a [PGN file](https://en.wikipedia.org/wiki/Portable_Game_Notation) to estimate the level of AntiCrux in regard of other UCI-compatible chess engines. For now, only AntiCrux and the special Stockfish-based engine developed by @ddugovic and compiled by @niklasf are considered because they are related to JavaScript.

To get reliable games, the processing will take hours (or days !). To accelerate the generation, you may launch in parallel with the scripts `run_elo.bat` (Windows) or `run_elo.sh` (Linux) as many processes as your computer has CPU.

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
The ratings for the engine "AC" are :
   - AC Level 8 is rated 1605 (initially 1640) after 72 games (+30/=0/-42).
   - AC Level 9 is rated 1705 (initially 1742) after 80 games (+47/=1/-32).
   - AC Level 10 is rated 1759 (initially 1736) after 84 games (+42/=2/-40).

The ratings for the engine "SF" are :
   - SF Level 3 is rated 1514 (initially 1350) after 372 games (+122/=11/-239).
   - SF Level 4 is rated 1476 (initially 1500) after 345 games (+134/=13/-198).
   - SF Level 5 is rated 2017 (initially 1850) after 362 games (+264/=14/-84).
   - SF Level 6 is rated 2501 (initially 2150) after 346 games (+293/=1/-52).
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

The ELO is shown here relatively to an offset equal to 0. But if the offset is equal to 1500, then you add that offset to the displayed ELO to get the final estimation. After many games played automatically and some adjustments done in the configuration, the ELO rating of AntiCrux approximately follows a logarithmic rule.


## Information


### Change log

- **November 11th 2016 - Creation of the project**
- **December 25th 2016 - Version 0.1.0**
	- Initial set of features
- **February 3rd 2017 - Version 0.2.0**
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
	- Library: bug fix in the processing of the option AntiCrux.options.board.noStatOnForcedMove
	- Library: new method AntiCrux.prototype.getOppositePlayer
	- UI: improved layout for the history of the moves
	- Library: improvement of the deep analysis
	- Library: new parameter for AntiCrux.prototype.isEndGame
	- Library: the minimal search depth is now 1 (previously 3)
	- UI: blind and random modes
- **October 8th 2017 - Version 0.3.0** *[no backwards compatibility]*
	- Server: new server based on Node.js
	- Readme: update
	- UI: button "Rematch"
	- Library: new method AntiCrux.prototype.isMove
	- Library: new method AntiCrux.prototype.setLevel
	- Library: new method AntiCrux.prototype.moveToUCI
	- Library: new method AntiCrux.prototype.getMainNode
	- Library: new method AntiCrux.prototype.callbackExploration(pMaxDepth, pDepth, pNodes)
	- Engine: new UCI-compatible chess engine based on Node.js
	- Library: the method AntiCrux.prototype.getMoveAI doesn't return NULL anymore but AntiCrux.constants.noMove
	- Library: scripts for Linux
	- ELO: new tool to create games between computers and to estimate ELO ratings
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
	- Library: level-dependent ELO rating
	- Library: improved export to PGN
	- Library: reworked decision tree
	- Library: removed method AntiCrux.prototype.getDecisionTreeHtml
	- Library: removed option AntiCrux.options.board.decisionTree
	- Library: removed option AntiCrux.options.board.fullDecisionTree
	- Library: new method AntiCrux.prototype.getAssistance
	- Library: option AntiCrux.options.board.analysisDepth renamed as AntiCrux.options.board.assistanceDepth
	- Library: option AntiCrux.options.ai.noStatOnForcedMove renamed as AntiCrux.options.board.noStatOnForcedMove
	- Library: deeply reworked and lighter data model using bit-based attributes
	- Library: reworked AntiCrux.constants
	- Library: changed configuration for the levels
	- Library: new returned value for AntiCrux.prototype.getScore
	- Library: removed option AntiCrux.options.ai.bestStaticScore
	- Library: improved import from FEN
	- ELO: projection of the rating ELO
	- ELO: save as CSV
	- Library: new method AntiCrux.prototype.getDateElements
	- Library: super queen
	- Engine: experimental support for jsUCI
	- Library: removed method AntiCrux.prototype.getReachedDepth
	- Library: removed method AntiCrux.prototype.getNumNodes
	- Library: new method AntiCrux.prototype.getStatsAI
	- Library: randomized start positions
	- Library: removed option AntiCrux.options.ai.acceleratedEndGame
	- Library: the nodes are pure objects with no prototype
	- Library: renamed option AntiCrux.options.board.debugCellId to AntiCrux.options.board.debug
	- Library: renamed option AntiCrux.options.ai.pessimisticScenario to AntiCrux.options.ai.worstCase
	- Library: new option AntiCrux.options.ai.distance
	- Library: new tactical strategy based on the distance between the pieces
	- Engine: the supported technical variant names are `suicide`, `giveaway` and `antichess`
	- Engine: new UCI option "Precise Score"
	- Library: removed method AntiCrux.prototype.startUI
- **In progress - Version 0.3.1**
	- Library: new method AntiCrux.prototype.getMaterialDifference
	- UI: display of the material difference and centipawns
	- Engine: removed UCI option UCI_Chess960
	- Engine: detailed dumps
	- Engine: new start positions (pushed pawns)
	- Engine: new parameter for AntiCrux.prototype.logMove
	- Engine: new method AntiCrux.prototype.getScoreHistory
	- UI: new graph to display the historical score
	- Engine: new parameter for AntiCrux.prototype.toPgn
	- UI: player displayed on the board
	- UI: rotated board after a FEN is loaded
	- Library: new method AntiCrux.prototype.loadOpeningBook
	- Library: new option AntiCrux.options.ai.openingBook
	- Library: opening book based on Nilatac
	- Library: new option AntiCrux.options.variant.misplacedBoard
	- Library: new method AntiCrux.prototype.toChessText
	- UI: export the board with Unicode symbols
	- Quality: tool to verify some positions


### License

AntiCrux is released under the terms of the "GNU Affero General Public License version 3".

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

Some files of the package contain derivative works subject to the following licenses :

```javascript
/*
	Copyright (C) 2002-2006 Catalin Francu <cata@francu.com>
	Some files of the package contain a derivative work based on Nilatac released under GPL v2+.

		https://github.com/CatalinFrancu/nilatac/
		http://catalin.francu.com/nilatac/
*/
```

The beautiful chess pieces made by Colin Burnett on Wikipedia are released under the terms of the "Creative Commons Attribution-ShareAlike license version 3.0" (CC BY-SA 3.0).

- https://creativecommons.org/licenses/by-sa/3.0/
- https://en.wikipedia.org/wiki/Chess_piece


## Corner for developers


### General approach

It is important to know how the options influence a move AntiCrux makes.

Schematically, AntiCrux plays all the possible moves level by level to find a better situation. Finding the possible moves becomes exponential rapidly. Exploring more than 4 half-moves can be complicated. Because AntiChess insists on the forced moves, the number of possible moves can be reduced a lot, allowing the algorithm to explore deeper with an higher efficiency.

Playing one piece is an *half-move* generating a new position called *node*. This node will lead to new nodes if there are available moves for the next player. The nodes are connected and the players take turns in the play. This game is modelled with a tree structure whose branches can be cut for its hidden treasure : the right move to play !

The positions are valuated from the bottom. Then by rules of aggregation, the upper levels are weighted based on the number of moves, the strength of the remaining pieces, etc... Once the top level is reached, AntiCrux can pick the move with the best score. It is your job to beat the AI !

The algorithm adopts some randomness to never play the same game. With high levels, the randomness is more reduced.


### Options


#### For the AI

- **AntiCrux.options.ai.version**

It is the version of the algorithm implemented for AntiCrux.

- **AntiCrux.options.ai.maxDepth**

The maximal depth is the number of half-moves which can be explored. The value is restricted to the amount of available memory on your computer. Mathematically, there are more possible positions at the beginning of the game, so it is normal to be less restricted by the depth at the end of the game.

The value can be increased drastically if you enable *minimizeLiberty*. But the game will always play the forced moves even if it is not the best move. This is especially true at the beginning of the game.

If you don't want that, you should reach the maximal depth dynamically at any moment. So you can set the maximal depth to 99, define a maximal number of nodes relevant with the size of your memory (*maxNodes*).

- **AntiCrux.options.ai.maxNodes**

The number of positions to be analyzed impacts the consumption of memory. When there is not enough memory, the browser will crash and your game will be lost.

If you put the value to zero, the maximal number of nodes is defined by the depth to be reached. The risk of crash is then very high. So this option is more relevant at the end of the game where the possibilities are reduced.

The number of nodes is a known restriction to allow AntiCrux to finish a game properly. If a node is not evaluated because of this limit, AntiCrux may play inaccurately and it will rely on your own arbitration. Make a challenge "Rook vs. King" to see how undeterministic the situation is despite the fact that the rook can win if it has the right initial position.

- **AntiCrux.options.ai.minimizeLiberty**

The simplification consists in playing the forced moves all the time even if is not the best move from a general point of view. It also contributes to reduce the number of nodes and the variety of the game.

- **AntiCrux.options.ai.maxReply**

The minimization of the liberty of your opponent doesn't necessarily pick the right move. Sometimes it is better to leave more than 1 opportunity of reply to be able to enlarge the strategy. This is very noticeable in the position "4k1nr/7Q/8/8/8/3P4/6PP/6rR b - -" :

- Rxh7 leaves 1 move in Rxg1 but you lose
- Rxh1 leaves 2 moves in Qxg8 and Qxh8 but you don't lose immediately

This option is relevant when AntiCrux.options.ai.minimizeLiberty is activated. The higher the figure, the higher the nodes and the lower the depth. The recommended values are 1 (forced moves where possible) or 2 (tolerable liberty without forced moves).

- **AntiCrux.options.ai.randomizedSearch**

When you scan the nodes at the deepest level, the processing order is always the same. To bring some randomness in the game, the randomization of the moves at each level is a good option.

- **AntiCrux.options.ai.worstCase**

When it is not up to you to play, you can expect your opponent to play his best move. This makes the situation very pessimistic for you. If your opponent is weak, you can turn off this option and you will be able to make higher damages if the chance is on your side.

- **AntiCrux.options.ai.opportunistic**

This option weakens the AI because it relies on the systematic mistake of the opponent to take an advantage if there is an opportunity to win or lose.

It is often used in coordination with the option AntiCrux.options.ai.worstCase.

- **AntiCrux.options.ai.distance**

This option favors the proximity between the pieces independently from their color. It ensures that the pieces meet each other to get trapped. Consequently, it reduces the diversity of the moves and it increases the ability of the AI to win.

The first analysis takes the smallest average distance between every pieces. The second analysis keeps the shortest move in order that the piece doesn't travel too much all over the board. The third analysis is a random pick (if needed).

- **AntiCrux.options.ai.handicap**

This option weakens the algorithm by removing randomly some possible moves above a minimal number of moves.

The number is expressed as a percentage between 0 and 100.

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

- **AntiCrux.options.board.noStatOnForcedMove**

To play faster when the moves are forced, you can choose to not perform a deep analysis to evaluate the position of the artificial intelligence.

The statistics will be updated the next time several moves are possible. So this option accelerates the game play.

- **AntiCrux.options.board.noStatOnOwnMove**

To not interfere with your thinking, the statistics are not generated when you play. You can use a hint on demand from the general user interface.

- **AntiCrux.options.board.assistance**

The option allows the discovery of the expected next moves. Because of the complexity of the rules, the output is for informational purposes only.

- **AntiCrux.options.board.assistanceDepth**

An higher depth for the assistant implies the anticipation of more moves and an higher reliability of the suggested moves at low depth.

- **AntiCrux.options.board.debug**

This option is used for debugging purposes in the process of developing AntiCrux.


#### For the gameplay

- **AntiCrux.options.variant.enPassant**

Some engines don't accept the rule "[en passant](https://en.wikipedia.org/wiki/En_passant)". So to comply with this restriction, you can (de)activate this chess rule.

- **AntiCrux.options.variant.promoteQueen**

With this option, you immediately promote paws as queen. You cannot choose for another piece.

- **AntiCrux.options.variant.superQueen**

The queen can move also like the knight. It doesn't affect the weight used for the valuation of this piece.

- **AntiCrux.options.variant.misplacedBoard**

This option rotates the board by 90° to simulate an error in the preparation of the game. Every cell of the board has then the wrong color.

- **AntiCrux.options.variant.pieces**

This human-related option renders the board differently. It may be used to reduce the readability of the game but the players must still follow the basic rules. The possible modes are :

- 0 : Normal
- 1 : Only white pieces
- 2 : Only black pieces
- 3 : Blind
- 4 : Random

The export to FEN and PGN is not impacted.

- **AntiCrux.options.variant.randomizedPosition**

This option randomizes the start positions of the pieces across the board. On contrary to AntiChess960, the pieces are really mixed up and your attack must be carefully planned in advance to take advantage of the obvious disorder.

- 0 : Normal / AntiChess960
- 1 : Main pieces
- 2 : One's side
- 3 : Half board
- 4 : Full board


#### Levels

The options above are combined into predefined levels in a range from 1 to 20. They serve for AntiCrux Server and AntiCrux Engine.

Please note that the web-interface offers all the options individually and fewer predefined levels.

| Level            | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12   | 13   | 14   | 15   | 16   | 17   | 18   | 19   | 20 |
|------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:--:|
| maxDepth         | 3   | 8   | 6   | 5   | 4   | 5   | 6   | 6   | 6   | 6   | 8   | 8    | 8    | 10   | 10   | 20   | 99   | 99   | 99   | 99 |
| maxNodes         | 100 | 50k | 40k | 30k | 30k | 40k | 50k | 60k | 70k | 80k | 90k | 100k | 200k | 300k | 400k | 500k | 600k | 700k | 850k | 1M |
| minimizeLiberty  | -   | -   | -   | -   | -   | -   | -   | X   | X   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X    | X  |
| maxReply         | 1   | 99  | 4   | 3   | 3   | 3   | 2   | 2   | 2   | 2   | 2   | 2    | 2    | 2    | 1    | 1    | 1    | 1    | 1    | 1  |
| randomizedSearch | X   | X   | X   | X   | X   | X   | X   | X   | X   | X   | X   | X    | X    | X    | -    | -    | -    | -    | -    | -  |
| worstCase        | -   | -   | -   | -   | -   | -   | -   | -   | -   | X   | X   | X    | X    | X    | X    | X    | X    | X    | X    | X  |
| opportunistic    | -   | -   | -   | X   | X   | X   | X   | X   | X   | X   | X   | X    | -    | -    | -    | -    | -    | -    | -    | -  |
| distance         | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | X    | X    | X    | X    | X    | X    | X    | X    | X  |
| openingBook      | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 2   | 2   | 4    | 4    | 6    | 6    | 8    | 10   | 12   | 12   | 12 |
| handicap         | 0   | 80  | 60  | 40  | 20  | 10  | 5   | 0   | 0   | 0   | 0   | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 0  |
| oyster           | X   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -   | -    | -    | -    | -    | -    | -    | -    | -    | -  |


### Notations

The board is a mono-dimensional 8x8 array of 64 cells. Black is at the top and White is at the bottom, whatever the rotation of the board.

The pieces are represented with an arbitrary internal identifier :

- AntiCrux.constants.piece.none
- AntiCrux.constants.piece.pawn
- AntiCrux.constants.piece.rook
- AntiCrux.constants.piece.knight
- AntiCrux.constants.piece.bishop
- AntiCrux.constants.piece.queen
- AntiCrux.constants.piece.king

The pieces are owned by a player :

- AntiCrux.constants.player.black (negative values)
- AntiCrux.constants.player.none
- AntiCrux.constants.player.white (positive values)

The moves are identified by different notation systems :

- Algebraic notation : `e3`, `Ra6`, `Nfxe5`, `h8=Q`... This classical notation for the moves is practical for the human players but it necessitates a complex processing to convert it into 2 couples of X/Y coordinates. It is used when the moves have to be publicly displayed or exported.

- Index-based notation : every cell is assigned to a sequential counter. It starts with `0` (A8) and ends with `63` (H1). This notation is internally used to highlight the moves because it requires no conversion when AntiCrux loops on a mono-dimensional array.

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

- XY notation : this is the standard notation for all the internal processings because it is readable by the development team even if it may not have the best performances. To describe a cell, the format concatenates Y and X, both ranging from 0 to 7. To describe a move, the source and target cells are concatened. To describe a promotion, there is a leading figure matching with a piece. For example, `51201` (5+12+01) is equal to `cxb8=Q`.

|     | A  | B  | C  | D  | E  | F  | G  | H  |
|:---:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
|**8**| 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|**7**| 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
|**6**| 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 |
|**5**| 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 |
|**4**| 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 |
|**3**| 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 |
|**2**| 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 |
|**1**| 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 |

- Character-based notation : for the reasons of being compact and parseable by JSON, the opening book is heavily compressed. Each cell matches with a character compatible with JavaScript. The current mapping is arbitrary and may evolve at any moment for the purpose of providing the most compact JSON-like structure for the opening book. A move is described by the concatenation of 2 of these characters.

|     | A  | B  | C  | D  | E  | F  | G  | H  |
|:---:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
|**8**| A  | B  | C  | D  | E  | F  | G  | H  |
|**7**| I  | J  | K  | L  | M  | N  | O  | P  |
|**6**| Q  | R  | S  | T  | U  | V  | W  | X  |
|**5**| X  | Z  | _  | µ  | 0  | 1  | 2  | 3  |
|**4**| 4  | 5  | 6  | 7  | 8  | 9  | a  | b  |
|**3**| c  | d  | e  | f  | g  | h  | i  | j  |
|**2**| k  | l  | m  | n  | o  | p  | q  | r  |
|**1**| s  | t  | u  | v  | w  | x  | y  | z  |


### API

Any field or method beginning with an underscore is a private member which is not expected to be called directly by a third-party application, unless you know exactly what you are doing.

- AntiCrux.callbackExploration(pStats)
- AntiCrux.clearBoard()
- AntiCrux.copyOptions(pObject)
- AntiCrux.defaultBoard(pFischer)
- AntiCrux.freeMemory()
- AntiCrux.getAssistance(pSymbols, pUCI)
- AntiCrux.getDateElements()
- AntiCrux.getDrawReason()
- AntiCrux.getHalfMoveClock()
- AntiCrux.getHistory()
- AntiCrux.getHistoryHtml()
- AntiCrux.getInitialPosition()
- AntiCrux.getLevel()
- AntiCrux.getMainNode()
- AntiCrux.getMaterialDifference(pNode)
- AntiCrux.getMoveAI(pPlayer, pNode)
- AntiCrux.getMovesHtml(pPlayer, pNode)
- AntiCrux.getNewFischerId()
- AntiCrux.getOppositePlayer(pNode)
- AntiCrux.getPieceByCoordinate(pCoordinate, pNode)
- AntiCrux.getPieceSymbol(pPiece, pPlayer, pSymbols)
- AntiCrux.getPlayer(pNode)
- AntiCrux.getScore(pNode)
- AntiCrux.getScoreHistory()
- AntiCrux.getStatsAI ()
- AntiCrux.getVariants()
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
- AntiCrux.loadOpeningBook()
- AntiCrux.logMove(pMove, pScore)
- AntiCrux.movePiece(pMove, pCheckLegit, pPlayerIndication, pNode)
- AntiCrux.moveToString(pMove, pNode)
- AntiCrux.moveToUCI(pMove)
- AntiCrux.predictMoves(pNode)
- AntiCrux.promote(pPiece, pNode)
- AntiCrux.resetStats()
- AntiCrux.setLevel(pLevel)
- AntiCrux.setPlayer(pPlayer, pNode)
- AntiCrux.setVariant(pVariant)
- AntiCrux.switchPlayer(pNode)
- AntiCrux.toChessText(pNode)
- AntiCrux.toConsole(pBorder, pNode)
- AntiCrux.toFen(pNode)
- AntiCrux.toHtml(pNode)
- AntiCrux.toPgn(pHeader, pScore)
- AntiCrux.toText(pNode)
- AntiCrux.undoMove()
- AntiCrux.updateHalfMoveClock()

A node is an object which represents a state of the board with additional information. It is linked with other nodes to describe the possible target positions through a network of moves. The principal node is the "*root node*" (a private attribute), so by using the public methods of the library, you should not have to handle the nodes on your own. That's why the parameter *pNode* is generally optional.

**Note :** to get an extended help about the API, you can refer to the comments written in the library itself. Or they can be read from a web-browser by using YuiDoc. Run the script `run_yuidoc_server.bat` (Windows) or `run_yuidoc_server.sh` (Linux), then access to http://localhost:3000
