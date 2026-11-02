# Junction Stadium — Live Match

A full 11-a-side football match running in the browser: a floodlit stadium with a
seated crowd, 22 procedurally-built human players, a referee and two assistants,
ball physics, an agent-based match engine and a broadcast-style HUD.

Built with Three.js. No external 3D assets — every mesh, texture and sound is
generated in code at load time.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build: `npm run build` then `npm run preview`.

## Controls

| Input | Action |
| --- | --- |
| Click **KICK OFF** | Start the match |
| `1` `2` `3` `4` | Broadcast / Tactical / Behind goal / Player camera |
| `C` | Cycle camera |
| `W A S D` / arrows | Move (in *BE A PLAYER* mode) |
| `Shift` | Sprint |
| `Space` | Pass |
| `F` | Shoot |
| `X` | Slide tackle |
| `Esc` | Hand the player back to the AI |

**BE A PLAYER** puts you in control of an outfielder. Control follows the ball as
play moves on, your stamina bar drains as you sprint, and the rest of the team
keeps its shape around you.

## The match engine

Every player runs an independent *perceive → decide → execute* loop several times
a second. Nothing is scripted: the scoreline, the cards and the pattern of the
game all fall out of individual decisions.

### Attributes
Each player is generated with his own profile — pace, acceleration, stamina,
passing, vision, dribbling, shooting, tackling, marking, aerial ability,
composure, discipline, aggression, work rate, flair, strength, height and
preferred foot. Two players in the same position behave differently: a
high-vision midfielder finds passes a limited one literally cannot see.

### Utility decisions
On the ball, the carrier scores every option — shoot, pass (each teammate
individually), cross, dribble, clear — from distance and angle to goal,
interception risk in the passing lane, the space around the receiver, the
team's risk appetite and his own traits. The highest score wins, with a dose of
noise so players hesitate and occasionally try something daft. Off the ball the
same idea drives pressing, cover, marking and runs in behind.

### Execution and error
No action succeeds just because the attribute is high. Passes and shots pass
through an error model built from technique, pressure, fatigue and a random
component; passes are aimed at a solved meet point that accounts for the ball
losing speed as it rolls. Shots pick a corner away from the keeper and miss the
target when the execution degrades.

### Fatigue
Players accumulate distance and lose stamina when they sprint, recover when they
jog, and finish the match tired. Fatigue cuts top speed, widens error and slows
reactions, so pressing decays and defensive lines drop late on.

### Tactics and game state
Both sides have a tactical identity — Northgate press high and play vertically,
Rivermouth sit in a mid block and keep the ball — expressed as press intensity,
line height, width, risk and tempo. Those numbers shift with the scoreline, the
clock and how tired the squad is: a side chasing the game pushes its line up and
takes more risks, a side protecting a lead drops off. Turnovers trigger a short
counter/counter-press window.

### Duels, fouls and cards
Tackles are contests between tackling and dribbling; defenders can be beaten and
then have to recover. Miss the ball and you might take the man. The referee
judges severity — from behind, in the box, stopping a promising attack, serious
foul play — and produces a word, a yellow, a second yellow or a straight red.
Sent-off players leave the pitch and their team plays a man short. Bookings are
shown in the scoreboard and flashed on screen.

### Set pieces
Throw-ins, goal kicks, corners, free kicks and penalties all have their own
setup: corner runners and markers loading the box, a defensive wall for a direct
free kick, everyone outside the box for a penalty, and a proper dead-ball delay
while players walk into position. Crosses are contested as aerial duels that can
end in a header on goal or a clearance.

## Structure

```
index.html              HUD markup
src/style.css           HUD styling
src/main.js             renderer, lights, fixed-step loop, input
src/config.js           pitch dimensions, teams, formations, squads
src/sim/attributes.js   per-player attribute generation
src/sim/tactics.js      tactical identity, block height, game-state shifts
src/sim/match.js        the engine: perception, decisions, duels, rules, set pieces
src/entities/player.js  humanoid rig, gait and actions
src/entities/ball.js    ball physics
src/camera.js           broadcast / tactical / behind-goal / player rigs
src/world/*.js          pitch, stadium bowl, crowd, procedural textures
src/ui/hud.js           scoreboard, tactics, stats, cards, ticker
src/audio.js            synthesized crowd and match sounds
```

A match clock runs at 12×, so 90 minutes takes about seven and a half real
minutes; playback speed can be raised from the dock.

`artifacts/` holds a few reference screenshots.
