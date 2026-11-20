# Sunset City Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Rtmd20/sunset-city-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Rtmd20/sunset-city-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A GTA-style cover art maker for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

Upload a photo and a caption and it makes a complete fake-movie-poster cover: a hero close-up with a headroom guard, four side panels in varied shapes with role labels, a big original gradient title with a script subtitle, a press-quote strip, a VOL. badge, a gold seal, a barcode and a billing block — in a warm sunset grade. One click fills the whole poster from a single photo, and you can crop and position every panel, pick from six colour grades, switch the title layout, and export PNGs in 1080×1080, 1080×1350 and 1920×1080.

Everything runs offline in the browser: open `app/index.html` (or run `node serve.ts` and open http://localhost:8080). No network requests, no Rockstar logo, artwork, character or font — all lettering is original, drawn with system fonts.

## Run it

```
node serve.ts
# open http://localhost:8080
```

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
