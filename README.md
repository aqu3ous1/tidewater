# TIDEWATER

*A Bellwood Aquarium Adventure* — (C) 2001 Soft Harbor Educational Software

> You move to Bellwood, a quiet river town a few hours from the city. The man who
> rented you the house runs the aquarium. He gives you a job. He's very kind.

TIDEWATER is a slow-burn psychological horror / mystery exploration game presented
as an obscure, unfinished PlayStation-era children's game. It starts as a mundane,
slightly odd life-sim about feeding penguins and fetching milk, and ends somewhere
else entirely.

It is a complete, playable game that runs in a web browser with no install, no
build step and no dependencies.

## How to play

Open `index.html` in a modern desktop browser (Chrome, Edge, Firefox, Safari).
Double-clicking the file works. If your browser blocks local files, serve the folder:

```sh
npx serve .        # or: python3 -m http.server
```

WebGL is required. Sound starts after your first key press. Headphones help.

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Walk | Arrow keys / WASD | D-pad / left stick |
| Run (hold) | X / Shift | B / X |
| Talk, look, confirm | Z / Space / Enter | A |
| Back | X / Backspace | B |
| Items, collection, goals, map | Tab / C / I | Select / Y |
| Pause, options | Esc / P | Start |

- The **map** (Tab, then → to MAP) is a folded visitor's map of Bellwood. ↑/↓ picks
  a place and shows its sign, whether it's open, and a short note about it. A star
  marks where your current goal is.
- Every night you **dream**: a small place of its own to wander around, from a maze of
  moving boxes to a pink sea under a yellow sky. Find the way to wake up, or choose
  WAKE UP from the pause menu.
- Save by using your **bed**, or when asked after sleeping. The game also saves
  automatically at the start of every day.
- **Options** (from the title screen or the pause menu) include a SOFT/SHARP
  screen toggle and music and sound volume.
- A full playthrough takes roughly 1–2 hours. There are four endings, and one of
  them is the true ending. The shells on the title screen show which endings you've seen.

<details>
<summary>Spoiler-light hints</summary>

- Read things. Look at things twice on different days. Doors you can't open yet
  will open eventually.
- Keep what you find. At the very end, the game asks you to prove what really
  happened, and it only accepts evidence.
- Some of the objectives are not written by the game.
</details>

## What's in it

- **8 in-game days** in Bellwood, August 8–15. The slow burn goes from "weird old
  game" → "something happened here" → "Walter killed his son" → "Walter is inside
  the game" → "Walter knows I'm playing".
- **A whole small town**: your house (the old Vane house), the Bellwood Aquarium,
  Hal's Diner, the market, Gus's gas station and garage, the laundromat, the
  church, the school, the park and playground, the pier and beach, the abandoned
  Kessler house, and the Underneath.
- **Houses with more to them**: Mrs. Miller's kitchen and sewing room, the Kessler
  house's kitchen and cellar, and the attic of your own house (from day 5).
- **Hidden places** off the streets: the storm drain under the whole town (the
  manhole opens on day 3), the Tide Club treehouse in the park (it wants a
  password), under the pier, the church bell tower, and the back of Rosa's.
- **Places that shouldn't exist**, awake and in daylight: a warm living room
  in the storm drain, a café where it is always nearly two o'clock, a bedroom
  inside a dead tree, the pink backwards park under the duck pond (your
  reflection walks when you walk), and a hallway inside the hall mirror that
  keeps starting over.
- **Past the edge of town**: the woods trail off Oak Street (the chain comes down
  on day 4) winds past a creek, an abandoned search camp, a hunting stand and a
  ring of stones. Keep going north and you end up back at the stones, until day 6,
  when the path reaches the old Bellwood Canning Co.: the yard and smokestack,
  the canning floor, the cold room, the foreman's office, the boiler room, and
  somebody's model of the town.
- **The aquarium is a building to get lost in**, with more of it opening as the
  days go on:
  - *Ground floor*: the lobby, gift shop, main hall with six tanks, Penguin Point,
    the kitchen, the OWNER ONLY office, storage, the staff room, the basement pump
    room and the maintenance tunnel.
  - *Upper level*: the theater (find the film and thread the projector), the
    learning room, the jellies, the kelp tunnel, and a balcony over the main hall.
    The staff side has the tank tops, the projection booth and Walter's cot room,
    plus a ladder up to the glass dome over the town. One night only, there is a
    door that shouldn't be there.
  - *B1, Maintenance* (from day 3): filtration, the boiler, a chalk-marked passage,
    old exhibits, the fish kitchen and its walk-in freezer, quarantine, Walter's
    workshop, and the freight elevator.
  - *B2, The Deep* (from day 5, if you find the freight key): the viewing gallery
    under Tank 6, the planning office, records, life support, a crawlspace to
    somebody's hideout, and a bricked-up room.
- **14 townspeople** with daily routines. Their accounts of the past contradict each other.
- **Collectibles**: aquarium and neighborhood collections, 12 fish cards and 3 blue
  shells. There are also unmarked "secret" items that are never called collectibles.
- **Locked places that open hours later**: the locked bedroom in your own house,
  the basement door that's "stuck", the OWNER ONLY office, Tank 6, the pump room,
  the tunnel, the school records room.
- **Narrative puzzles**: a combination lock, a choice of photographs where only one
  is real, and a final REMEMBER sequence. In it you reconstruct the night of August
  14, 1991 by presenting evidence against each of Walter's versions.
- **Fourth-wall behavior**: save files that change, a save slot that shouldn't
  exist, other players' files, a title screen that remembers what happened, and a
  Walter who knows your real clock time and how long you've been playing.
- **Four endings**: LOW TIDE (escape), HIS VERSION, THE GUIDE (trapped), and the true ending.

## How it's made

Everything is generated in code at boot: textures, sprites, photographs,
children's drawings, the bitmap font, music and sound effects. There are no image
or audio files.

- **Renderer** (`src/core/renderer.js`): a small WebGL1 renderer that imitates late
  90s console hardware. It renders into a 320×240 framebuffer upscaled with nearest
  filtering, snaps vertices to a coarse grid (wobbly polygons), uses affine
  (non-perspective-correct) texture mapping, 15-bit color with ordered dithering, and
  screen-door transparency. Lighting is baked per vertex (Gouraud) at load time, and
  a SOFT mode adds a light composite-cable blur. Corruption later in the game raises
  vertex jitter and makes geometry swim.
- **2D sprites in low-poly 3D**: characters are hand-painted pixel sprites (4
  directions, 2-frame walks) on camera-facing billboards in crude box-and-plane
  environments. The player is a small kid in a brass diving helmet.
- **Cameras**: follow cameras locked to a fixed heading, fixed and tracking
  cameras placed in corners, and per-room camera zones. Some of them feel like
  someone is watching.
- **Audio** (`src/core/audio.js`): a WebAudio synthesizer and step sequencer. Music
  is written as note data and can be "damaged" at runtime (tempo drag, detuning,
  dropped notes, pitch drift), which the ending uses to let the aquarium theme fall
  apart. Ambience beds (pump hum, electrical buzz, wind, crickets, drips) and all
  sound effects are synthesized.
- **Scripting**: cutscenes and interactions are plain `async` functions using a
  small API (`S.say`, `S.ask`, `S.obj`, `S.walk`, `S.give`, …).

```
index.html            entry point (classic scripts, works from file://)
src/core/             math, bitmap font, renderer, input, audio
src/gfx/              pixel painter + atlas, textures, sprites, decals/photos/icons
src/world/            map builder, props, runtime (collision, camera, NPCs, doors)
src/game/             state/saves, script API, UI, menus, town map, title, story, endings
src/data/             items, documents, NPC routines and dialogue
src/maps/             town, house, aquarium, basement, shops, school, the Underneath
tools/                viewer + automated playthrough harness (Playwright)
```

## Development tools

`tools/playthrough.js` drives the real game through a scripted route with
Playwright. It auto-answers dialogue, prints the full transcript, and reports
errors and failed checks. Routes live in `tools/scripts/`.

```sh
npm i -D playwright        # or use a global install
node tools/playthrough.js days out/        # days 1-4 from a new game
node tools/playthrough.js day56 out/       # days 5-6
node tools/playthrough.js day7 out/        # day 7 and the ghost
node tools/playthrough.js day8 out/        # the last day and the true ending
node tools/playthrough.js end_escape out/  # other endings
```

The playthroughs jump between doors, so two more checks cover walking:

```sh
node tools/reach.js    # every map, every day: can each door and object be reached on foot?
node tools/walk.js     # walks key routes with real arrow-key presses (front door -> aquarium, ...)
node tools/follow.js   # plays the day-1 aquarium tour by keyboard: follow Walter, take the job
node tools/office.js   # day 6: leaving Walter's office never shuts you in
node tools/loadday.js  # loading a start-of-day save replays the morning
node tools/aqx.js      # the upper floor and both basement levels: stairs, keys, elevator, crawlspace
node tools/hidden.js   # storm drain, treehouse, pier, bell tower, Rosa's, attic, the pond, the hall mirror
node tools/outer.js    # the woods trail (day 4), the loop north of the stones, the cannery (day 6)
node tools/playthrough.js dreams out/   # sleeps through all seven nights and finishes each dream
```

Jump anywhere with the debug launcher, e.g.
`index.html?debug&day=6&map=aquarium&spawn=front&run=1`.
It also accepts `tod`, `flags=a,b`, `items=x,y` and `speed=2`.

To reset everything the disc remembers, clear the site's local storage (keys
starting with `tidewater.`).
