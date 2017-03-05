#!/bin/sh

mkdir -p node_modules/anticrux/images

cp package.json node_modules/anticrux

cp LICENSE      node_modules/anticrux
cp README.md    node_modules/anticrux
cp *.css        node_modules/anticrux
cp *.js         node_modules/anticrux
cp *.html       node_modules/anticrux
cp images/*.gif node_modules/anticrux/images
cp images/*.png node_modules/anticrux/images

npm install opn

