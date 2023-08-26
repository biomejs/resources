#!/bin/sh
set -eu

svg_to_png() {
    gm convert -background none "$1" "${1%.*}.png"
    pngquant -o out.png --strip --speed 1 "${1%.*}.png"
    mv --force out.png "${1%.*}.png"
}

svg_to_resized_png() {
    gm convert -background none -resize "$2" "$1" "${1%.*}-$2.png"
    pngquant -o out.png --strip --speed 1 "${1%.*}.png"
    mv --force out.png "${1%.*}.png"
}

for f in ./*/*.svg; do
    printf "Generate %s\n" "${f%.*}.png"
    svg_to_png "$f"
done

f=./icon/biome-icon.svg
for size in 16x16 32x32 180x180 192x192 512x512; do
    printf "Generate %s\n" "${f%.*}-$size.png"
    svg_to_png "$f" "$size"
done
