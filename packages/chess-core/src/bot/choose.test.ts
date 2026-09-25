import {
  chooseCandidate,
  chooseRandomMove,
  mateToCp,
  seededRandom,
} from './choose.js';

function frequencies(pickMove: () => string, runs = 5000) {
  const counts = new Map<string, number>();
  for (let i = 0; i < runs; i += 1) {
    const move = pickMove();
    counts.set(move, (counts.get(move) ?? 0) + 1);
  }
  return counts;
}

describe('mateToCp', () => {
  it('orders mates above material and faster mates first', () => {
    expect(mateToCp(1)).toBeGreaterThan(mateToCp(3));
    expect(mateToCp(3)).toBeGreaterThan(5000);
    expect(mateToCp(-1)).toBeLessThan(mateToCp(-3));
    expect(mateToCp(-3)).toBeLessThan(-5000);
  });
});

describe('chooseCandidate', () => {
  const candidates = [
    { move: 'e2e4', scoreCp: 50 },
    { move: 'd2d4', scoreCp: 40 },
    { move: 'g2g4', scoreCp: -300 },
  ];

  it('prefers better moves', () => {
    const random = seededRandom(1);
    const counts = frequencies(() =>
      chooseCandidate(
        candidates,
        { temperatureCp: 100, blunderChance: 0 },
        random,
      ),
    );
    expect(counts.get('e2e4')!).toBeGreaterThan(counts.get('d2d4')!);
    expect(counts.get('g2g4') ?? 0).toBeLessThan(200);
  });

  it('picks bad moves at about the blunder rate', () => {
    const random = seededRandom(2);
    const counts = frequencies(() =>
      chooseCandidate(
        candidates,
        { temperatureCp: 1, blunderChance: 0.3 },
        random,
      ),
    );
    // A blunder picks any of the 3 candidates, so g2g4 gets about 30% / 3.
    const share = (counts.get('g2g4') ?? 0) / 5000;
    expect(share).toBeGreaterThan(0.07);
    expect(share).toBeLessThan(0.13);
  });

  it('rejects an empty list', () => {
    expect(() =>
      chooseCandidate([], { temperatureCp: 100, blunderChance: 0 }),
    ).toThrow();
  });
});

describe('chooseRandomMove', () => {
  it('prefers captures at the given rate', () => {
    const random = seededRandom(3);
    const moves = [
      { move: 'a2a3', isCapture: false },
      { move: 'b2b3', isCapture: false },
      { move: 'c4d5', isCapture: true },
    ];
    const counts = frequencies(() => chooseRandomMove(moves, 0.5, random));
    // 50% capture preference plus 1/3 of the other half.
    const share = counts.get('c4d5')! / 5000;
    expect(share).toBeGreaterThan(0.62);
    expect(share).toBeLessThan(0.72);
  });
});
