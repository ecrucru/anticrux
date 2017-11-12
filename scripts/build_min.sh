#!/bin/sh

cd ..
uglifyjs anticrux.js -c -m --comments -o anticrux.min.js
uglifyjs anticrux-ui.js -c -m --comments -o anticrux-ui.min.js
