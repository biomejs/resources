#!/bin/sh
set -eu

svg_to_png() {
    outfile="${1%.*}.png"
    printf "Generate %s\n" "$outfile"
    gm convert -background none "$1" "$outfile"
    pngquant -o out.png --strip --speed 1 "$outfile"
    mv --force out.png "$outfile"
}

svg_to_resized_png() {
    outfile="${1%.*}-$2.png"
    printf "Generate %s\n" "$outfile"
    gm convert -background none -resize "$2" "$1" "$outfile"
    pngquant -o out.png --strip --speed 1 "$outfile"
    mv --force out.png "$outfile"
}

rm ./*/*.png

for f in ./*/*.svg; do
    svg_to_png "$f"
done

f=./icon/biome-icon.svg
for size in 16x16 32x32 180x180 192x192 512x512; do
    svg_to_resized_png "$f" "$size"
done
