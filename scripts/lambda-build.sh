#!/bin/sh
mkdir -p build
rm -r build/*
cp index.js package.json yarn.lock .yarnclean build
(
    export NODE_ENV=production
    cd build;
    yarn install;
)
zip -qrmX build.zip build
