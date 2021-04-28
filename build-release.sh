#!/bin/bash

mkdir -p uvic-captions-player-plugin/uvic-captions-player-block

cp *.php uvic-captions-player-plugin/
cp README.md uvic-captions-player-plugin/
cp -r uvic-captions-player-block/build uvic-captions-player-plugin/uvic-captions-player-block/

zip -r uvic-captions-player-plugin.zip uvic-captions-player-plugin/
