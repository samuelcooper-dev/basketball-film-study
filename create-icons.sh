#!/bin/bash

# Simple script to create placeholder basketball icons using ImageMagick
# Run: bash create-icons.sh

if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Please install it or create icons manually."
    echo "See public/ICONS_README.txt for instructions."
    exit 1
fi

cd public

# Create 128x128 icon
convert -size 128x128 xc:orange -fill white -draw "circle 64,64 50,14" \
        -fill black -stroke black -strokewidth 2 \
        -draw "line 64,14 64,114" \
        -draw "line 14,64 114,64" \
        icon128.png

# Resize to smaller versions
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png

echo "Icons created successfully in public/"
ls -lh icon*.png
