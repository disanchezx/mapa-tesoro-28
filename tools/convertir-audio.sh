#!/bin/zsh
# Convierte audios de WhatsApp (.opus/.ogg) u otros a .m4a para que suenen en iPhone/iPad.
# Uso:  ./tools/convertir-audio.sh ~/Downloads/Milton.opus milton
#       → crea audio/milton.m4a
set -e
[ $# -eq 2 ] || { echo "Uso: $0 <archivo-origen> <nombre-sin-extension>"; exit 1; }
DIR="$(cd "$(dirname "$0")/.." && pwd)"
ffmpeg -hide_banner -loglevel error -y -i "$1" -c:a aac -b:a 96k -movflags +faststart "$DIR/audio/$2.m4a"
echo "✓ audio/$2.m4a listo. En config.js:  type: 'audio', src: 'audio/$2.m4a'"
