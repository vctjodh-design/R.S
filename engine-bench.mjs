// Headless goal-rate bench for the 3D engine: plays N matches at the fixed
// 60Hz step with no renderer, so the scoreline distribution can be measured.
const noop = () => {};
const stubContext = new Proxy(
  { canvas: { width: 256, height: 256 }, measureText: () => ({ width: 8 }) },
  { get: (t, k) => (k in t ? t[k] : noop) },
);
globalThis.document = {
  createElement: () => ({ width: 256, height: 256, getContext: () => stubContext, style: {} }),
  createElementNS: () => ({ style: {}, setAttribute: noop, appendChild: noop }),
  addEventListener: noop,
  body: { appendChild: noop },
};
globalThis.window = { addEventListener: noop, devicePixelRatio: 1, innerWidth: 1024, innerHeight: 768 };
globalThis.self = globalThis.window;
globalThis.HTMLCanvasElement = class {};
globalThis.ImageData = class {};

const THREE = await import('three');
const { Match } = await import('./src/sim/match.js');
const { MatchBall } = await import('./src/entities/ball.js');

const N = Number(process.argv[2] || 20);
const goals = [];
const scores = {};
const shots = [];
const sot = [];
const homeGoals = [];
const awayGoals = [];
const homeShots = [];
const awayShots = [];
for (let i = 0; i < N; i++) {
  const match = new Match(new THREE.Scene(), new MatchBall(), {});
  match.startMatch();
  let steps = 0;
  while (match.state !== 'fulltime' && steps < 60 * 60 * 130) {
    match.update(1 / 60);
    steps++;
  }
  const h = match.score[0];
  const a = match.score[1];
  goals.push(h + a);
  homeGoals.push(h);
  awayGoals.push(a);
  homeShots.push(match.stats[0].shots || 0);
  awayShots.push(match.stats[1].shots || 0);
  scores[`${h}-${a}`] = (scores[`${h}-${a}`] || 0) + 1;
  shots.push((match.stats[0].shots || 0) + (match.stats[1].shots || 0));
  sot.push((match.stats[0].onTarget || 0) + (match.stats[1].onTarget || 0));
  process.stdout.write(`${h}-${a} `);
}
const avg = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const share = (pred) => Object.entries(scores).filter(([k]) => pred(k)).reduce((s, [, v]) => s + v, 0) / N;
console.log(`\nhome ${avg(homeGoals).toFixed(2)} goals from ${avg(homeShots).toFixed(1)} shots · away ${avg(awayGoals).toFixed(2)} from ${avg(awayShots).toFixed(1)}`);
console.log(
  `\nmatches ${N} · avg goals ${avg(goals).toFixed(2)} · shots ${avg(shots).toFixed(1)} · on target ${avg(sot).toFixed(1)} · conversion ${((avg(goals) / avg(shots)) * 100).toFixed(1)}%`,
);
console.log(
  `0-0 ${(share((k) => k === '0-0') * 100).toFixed(0)}% · 1-0/0-1 ${(share((k) => k === '1-0' || k === '0-1') * 100).toFixed(0)}% · 2-0/0-2 ${(share((k) => k === '2-0' || k === '0-2') * 100).toFixed(0)}% · 1-1 ${(share((k) => k === '1-1') * 100).toFixed(0)}% · 4+ goals ${(share((k) => k.split('-').map(Number).reduce((x, y) => x + y, 0) >= 4) * 100).toFixed(0)}%`,
);
console.log(
  'distribution',
  JSON.stringify(Object.entries(scores).sort((x, y) => y[1] - x[1]).slice(0, 10)),
);
