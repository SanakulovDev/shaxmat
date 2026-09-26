import {
  findTimeControl,
  TIME_CONTROLS,
  timeControlCategory,
  timeControlLabel,
} from './timeControl.js';

describe('time controls', () => {
  it('sorts each preset into a rating category', () => {
    expect(TIME_CONTROLS.map((tc) => timeControlCategory(tc))).toEqual([
      'bullet',
      'blitz',
      'blitz',
      'rapid',
      'rapid',
      'classical',
    ]);
  });

  it('labels and finds presets by id', () => {
    for (const tc of TIME_CONTROLS) expect(timeControlLabel(tc)).toBe(tc.id);
    expect(findTimeControl('3+2')).toMatchObject({ initial: 180, increment: 2 });
    expect(findTimeControl('2+1')).toBeUndefined();
  });
});
