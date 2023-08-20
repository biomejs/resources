#!/bin/sh
set -eu

for f in *.svg; do
    gm convert -background none "$f" "${f%.*}.png"
    pngquant -o out.png --strip --speed 1 "${f%.*}.png"
    mv --force out.png "${f%.*}.png"
done

