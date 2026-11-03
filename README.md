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

### Real squads and form (optional)
The engine runs its own clubs by default. A host page can instead hand it a
profile of two real teams — `src/sim/form-profile.js` reads recent results, team
statistics and per-player ratings, then supplies the formation, the predicted XI
(names, numbers, ratings) and bloom signals per player. Player attributes start
from the role baseline and shift by what the player actually did (shot and pass
value, duel win rates, discipline, minutes); team tactics blend the club's own
press/line/tempo profile with the engine's baseline. The inputs are descriptive
only — they change *how* the two sides play, not who wins.

The profile also carries two more descriptive inputs. A club's **league-table**
row travels with it: distance from the league's average points per game nudges
squad quality inside a ±1.2% band and shifts press, line height and risk by a few
hundredths, so a leader carries itself a little higher and a struggler sits a
little deeper without either being handed the result. Every player also gets an
**intelligence** signal — pass volume and accuracy, key passes and discipline —
which moves vision, composure, marking and discipline, so composed, tidy players
pick better passes and panic less.

### Batch runs
A host page can ask for the same fixture N times: the panel above the pitch takes
a match count (1–50), a speed of 1–20×, and shows each round's scoreline when the
batch is done. Rounds replay the identical squads, ratings and tactics through
`Match.restartMatch()`; only the match itself differs, so a run of ten is ten
real simulations rather than ten re-rolls of player quality. The engine drives
the loop and reports progress over `postMessage`; above 4× it stops drawing
frames so the match clock, not the GPU, sets the pace.

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
minutes; playback speed can be raised from the dock. When a batch runs above 4×
the engine skips drawing frames and steps the match inside a per-frame time
budget instead, which is what makes 20× reachable.

`artifacts/` holds a few reference screenshots.
