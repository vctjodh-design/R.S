const noop = () => {};
const stubContext = new Proxy({ canvas: { width: 256, height: 256 }, measureText: () => ({ width: 8 }) }, { get: (t, k) => (k in t ? t[k] : noop) });
globalThis.document = { createElement: () => ({ width: 256, height: 256, getContext: () => stubContext, style: {} }), createElementNS: () => ({ style: {}, setAttribute: noop, appendChild: noop }), addEventListener: noop, body: { appendChild: noop } };
globalThis.window = { addEventListener: noop, devicePixelRatio: 1, innerWidth: 1024, innerHeight: 768 };
globalThis.self = globalThis.window;
globalThis.HTMLCanvasElement = class {};
globalThis.ImageData = class {};
const THREE = await import('three');
const { Match } = await import('./src/sim/match.js');
const { MatchBall } = await import('./src/entities/ball.js');

const N = Number(process.env.N ?? 8);
const buckets = [0, 0, 0, 0, 0, 0]; // <6, <12, <18, <24, <30, 30+
const labels = ['0-6m', '6-12m', '12-18m', '18-24m', '24-30m', '30m+'];
let inBox = 0, outBox = 0, goals = 0, htZero = 0, htGoals = 0;
const minutes = new Array(6).fill(0); // 0-15,15-30,30-45,45-60,60-75,75-90
const halves = [0, 0];
for (let i = 0; i < N; i++) {
  const m = new Match(new THREE.Scene(), new MatchBall(), {});
  m.onGoal = (g) => {
    goals++;
    const bucket = Math.min(5, Math.floor(g.minute / 15));
    minutes[bucket]++;
    halves[g.minute < 45 ? 0 : 1]++;
  };
  const orig = m.executeShot.bind(m);
  m.executeShot = (a, ctx) => {
    const goal = m.oppGoal(m.teams[a.teamIdx]);
    const d = Math.hypot(goal.x - a.pos.x, goal.z - a.pos.z);
    buckets[Math.min(5, Math.floor(d / 6))]++;
    if (m.inOppBox(a.pos.x, a.pos.z, m.teams[a.teamIdx])) inBox++; else outBox++;
    return orig(a, ctx);
  };
  m.startMatch();
  let steps = 0;
  while (m.state !== 'fulltime' && steps < 60 * 60 * 130) { m.update(1 / 60); steps++; }
  if (m.halfTimeScore[0] + m.halfTimeScore[1] === 0) htZero++;
  htGoals += m.halfTimeScore[0] + m.halfTimeScore[1];
}
const shots = buckets.reduce((a, b) => a + b, 0);
console.log('matches', N, '· goals/match', (goals / N).toFixed(2), '· shots/match', (shots / N).toFixed(1));
console.log('first half goals', halves[0], '· second half', halves[1]);
console.log('goalless at half time', ((htZero / N) * 100).toFixed(0) + '%');
console.log('goal minutes 15-min blocks', minutes.map((v, i) => `${i * 15}-${i * 15 + 15}:${v}`).join(' '));
console.log('inside box', ((inBox / shots) * 100).toFixed(0) + '%', '· outside', ((outBox / shots) * 100).toFixed(0) + '%');
console.log(buckets.map((v, i) => `${labels[i]} ${((v / shots) * 100).toFixed(0)}%`).join(' · '));
