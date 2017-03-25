#!/bin/sh

uglifyjs anticrux.js -c -m -o anticrux.min.js
uglifyjs anticrux-ui.js -c -m -o anticrux-ui.min.js
echo Add the header in the generated file
