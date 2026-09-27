// Famous games for the games page. Titles, places and stories are in the
// translations (games.classics.<id>); classics.test.ts replays every game
// with chess.js to catch typos.

export type ClassicGame = {
  id: string
  white: string
  black: string
  year: number
  result: '1-0' | '0-1' | '1/2-1/2'
  pgn: string
}

export const CLASSICS: readonly ClassicGame[] = [
  {
    id: 'samarkand',
    white: 'Nodirbek Abdusattorov',
    black: 'Fabiano Caruana',
    year: 2026,
    result: '1-0',
    pgn: `
    1. e4 {[%clk 1:30:38]} e5 {[%clk 1:30:55]} 2. Bc4 {[%clk 1:30:45]} Nf6 {[%clk 1:30:58]}
    3. Nc3 {[%clk 1:31:09]} Nc6 {[%clk 1:29:56]} 4. d3 {[%clk 1:31:24]} Bb4 {[%clk 1:29:23]}
    5. Bg5 {[%clk 1:31:44]} h6 {[%clk 1:18:35]}
    6. Bxf6 {[%clk 1:31:57]} Bxc3+ {[%clk 1:14:12]}
    7. bxc3 {[%clk 1:32:19]} Qxf6 {[%clk 1:14:40]}
    8. Ne2 {[%clk 1:32:39]} Na5 {[%clk 1:14:16]}
    9. Bb3 {[%clk 1:32:10]} O-O {[%clk 1:14:29]}
    10. O-O {[%clk 1:32:13]} d6 {[%clk 1:14:01]}
    11. Qd2 {[%clk 1:30:28]} Qe7 {[%clk 0:51:16]}
    12. f4 {[%clk 1:28:37]} Nxb3 {[%clk 0:51:43]}
    13. axb3 {[%clk 1:28:55]} Bd7 {[%clk 0:44:33]}
    14. c4 {[%clk 1:14:54]} f5 {[%clk 0:37:08]}
    15. Qe3 {[%clk 0:40:03]} fxe4 {[%clk 0:35:18]}
    16. Qxe4 {[%clk 0:40:28]} Bc6 {[%clk 0:35:45]}
    17. Qe3 {[%clk 0:40:53]} Rae8 {[%clk 0:14:25]}
    18. f5 {[%clk 0:27:37]} a6 {[%clk 0:14:48]}
    19. Ng3 {[%clk 0:26:35]} Bd7 {[%clk 0:11:13]}
    20. Rf2 {[%clk 0:26:12]} Rf7 {[%clk 0:09:54]}
    21. Raf1 {[%clk 0:24:44]} Ref8 {[%clk 0:10:20]}
    22. Qe4 {[%clk 0:23:10]} c6 {[%clk 0:10:40]}
    23. Qe3 {[%clk 0:21:31]} d5 {[%clk 0:09:16]}
    24. cxd5 {[%clk 0:16:53]} cxd5 {[%clk 0:09:43]}
    25. d4 {[%clk 0:16:48]} e4 {[%clk 0:07:44]} 26. c4 {[%clk 0:17:12]} Qg5 {[%clk 0:05:24]}
    27. Qxg5 {[%clk 0:15:37]} hxg5 {[%clk 0:05:52]}
    28. cxd5 {[%clk 0:12:46]} e3 {[%clk 0:05:50]}
    29. Rf3 {[%clk 0:13:09]} Bb5 {[%clk 0:05:44]}
    30. Re1 {[%clk 0:13:27]} e2 {[%clk 0:06:11]}
    31. Kf2 {[%clk 0:13:15]} Rd7 {[%clk 0:03:59]}
    32. Nxe2 {[%clk 0:12:19]} Rxd5 {[%clk 0:04:27]}
    33. g4 {[%clk 0:05:28]} Bxe2 {[%clk 0:04:54]}
    34. Rxe2 {[%clk 0:05:49]} Rxd4 {[%clk 0:05:21]}
    35. Kg3 {[%clk 0:05:44]} Rfd8 {[%clk 0:03:22]}
    36. h4 {[%clk 0:04:49]} gxh4+ {[%clk 0:03:50]}
    37. Kxh4 {[%clk 0:05:15]} Rd3 {[%clk 0:01:33]}
    38. Rfe3 {[%clk 0:03:58]} Kf8 {[%clk 0:01:03]}
    39. Kh5 {[%clk 0:03:23]} a5 {[%clk 0:00:52]}
    40. Re7 {[%clk 0:02:30]} Rxb3 {[%clk 0:00:40]}
    41. g5 {[%clk 0:30:51]} Rb6 {[%clk 0:13:44]}
    42. g6 {[%clk 0:30:50]} Rf6 {[%clk 0:14:06]}
    43. Kg5 {[%clk 0:30:04]} Kg8 {[%clk 0:13:51]}
    44. Rxg7+ {[%clk 0:28:41]} Kxg7 {[%clk 0:14:18]}
    45. Re7+ {[%clk 0:29:06]} Kg8 {[%clk 0:14:42]}
    46. Kxf6 {[%clk 0:29:32]} a4 {[%clk 0:15:07]}
    47. Rg7+ {[%clk 0:28:22]} Kh8 {[%clk 0:14:39]}
    48. Rxb7 {[%clk 0:28:34]} Ra8 {[%clk 0:15:07]} 49. Kg5 {[%clk 0:28:30]} 1-0`,
  },
  {
    id: 'opera',
    white: 'Paul Morphy',
    black: 'Duke Karl & Count Isouard',
    year: 1858,
    result: '1-0',
    pgn: `
    1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6
    9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6
    15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    id: 'immortal',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    year: 1851,
    result: '1-0',
    pgn: `
    1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5
    9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6
    16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8
    22. Qf6+ Nxf6 23. Be7# 1-0`,
  },
  {
    id: 'evergreen',
    white: 'Adolf Anderssen',
    black: 'Jean Dufresne',
    year: 1852,
    result: '1-0',
    pgn: `
    1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O d3 8. Qb3 Qf6
    9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5
    16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7
    22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0`,
  },
  {
    id: 'century',
    white: 'Donald Byrne',
    black: 'Bobby Fischer',
    year: 1956,
    result: '0-1',
    pgn: `
    1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7
    9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3
    16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+
    22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2
    28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7
    35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+
    41. Kc1 Rc2# 0-1`,
  },
  {
    id: 'kasparovTopalov',
    white: 'Garry Kasparov',
    black: 'Veselin Topalov',
    year: 1999,
    result: '1-0',
    pgn: `
    1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6
    9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5
    16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5
    23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5
    29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2
    35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1
    42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0`,
  },
  {
    id: 'deepBlue',
    white: 'Deep Blue',
    black: 'Garry Kasparov',
    year: 1997,
    result: '1-0',
    pgn: `
    1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6 8. Nxe6 Qe7
    9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5 14. Bg3 Kc8 15. axb5 cxb5
    16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0`,
  },
  {
    id: 'reti',
    white: 'Richard Réti',
    black: 'Savielly Tartakower',
    year: 1910,
    result: '1-0',
    pgn: `
    1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nf6 5. Qd3 e5 6. dxe5 Qa5+ 7. Bd2 Qxe5
    8. O-O-O Nxe4 9. Qd8+ Kxd8 10. Bg5+ Kc7 11. Bd8# 1-0`,
  },
]

export function findClassic(id: string): ClassicGame | undefined {
  return CLASSICS.find((game) => game.id === id)
}
