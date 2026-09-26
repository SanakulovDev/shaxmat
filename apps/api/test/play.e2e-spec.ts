import { INestApplication } from '@nestjs/common';
import type { Socket } from 'socket.io-client';
import request from 'supertest';
import { NOW } from '../src/play/play.service.js';
import type { GameView } from '../src/play/play.service.js';
import {
  ask,
  connect,
  createGuest,
  createTestApp,
  listen,
  next,
  registerUser,
  type TestSession,
} from './helpers.js';

type JoinAck = { state: GameView; chat: unknown[] | null } | { error: string };

// Needs a migrated database: `pnpm db:up && pnpm db:migrate`.
describe('games between people (e2e)', () => {
  let app: INestApplication;
  let url: string;
  // The server's clock; tests move it forward to run clocks out.
  let now = Date.now();
  const sockets: Socket[] = [];

  beforeAll(async () => {
    app = await createTestApp((builder) =>
      builder.overrideProvider(NOW).useValue(() => now),
    );
    url = await listen(app);
  });

  afterEach(() => {
    for (const socket of sockets.splice(0)) socket.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  function http(session: TestSession) {
    const server = app.getHttpServer();
    const auth = (test: request.Test) =>
      test.set('Authorization', `Bearer ${session.accessToken}`);
    return {
      get: (path: string) => auth(request(server).get(`/api${path}`)),
      post: (path: string, body?: object) =>
        auth(request(server).post(`/api${path}`)).send(body),
      delete: (path: string) => auth(request(server).delete(`/api${path}`)),
    };
  }

  async function socketFor(session: TestSession) {
    const socket = await connect(url, session.accessToken);
    sockets.push(socket);
    return socket;
  }

  // Creates a challenge as `creator` (White) and accepts it as `opponent`.
  async function startGame(
    creator: TestSession,
    opponent: TestSession,
    body: object = {},
  ) {
    const created = await http(creator)
      .post('/challenges', {
        timeControl: '5+0',
        color: 'white',
        rated: false,
        ...body,
      })
      .expect(201);
    const accepted = await http(opponent)
      .post(`/challenges/${created.body.code}/accept`)
      .expect(200);
    return { code: created.body.code as string, gameId: accepted.body.gameId as string };
  }

  async function join(socket: Socket, gameId: string) {
    const ack = await ask<JoinAck>(socket, 'game:join', { gameId });
    if ('error' in ack) throw new Error(ack.error);
    return ack;
  }

  function act(socket: Socket, gameId: string, action: object) {
    return ask<{ ok: true } | { error: string }>(socket, 'game:action', {
      gameId,
      action,
    });
  }

  async function moves(white: Socket, black: Socket, gameId: string, list: string[]) {
    for (const [index, uci] of list.entries()) {
      const socket = index % 2 === 0 ? white : black;
      expect(await act(socket, gameId, { type: 'move', uci })).toEqual({ ok: true });
    }
  }

  it('plays a casual game from an invite link to checkmate', async () => {
    const [alice, bob, carol] = await Promise.all([
      createGuest(app),
      createGuest(app),
      createGuest(app),
    ]);
    const created = await http(alice)
      .post('/challenges', { timeControl: '5+0', color: 'white', rated: false })
      .expect(201);
    expect(created.body).toMatchObject({
      status: 'open',
      destId: null,
      timeControl: { initial: 300, increment: 0 },
    });
    const { code } = created.body;

    await http(alice).post(`/challenges/${code}/accept`).expect(400);
    const accepted = await http(bob).post(`/challenges/${code}/accept`).expect(200);
    const { gameId } = accepted.body;
    // The link works once.
    await http(carol).post(`/challenges/${code}/accept`).expect(410);
    expect((await http(alice).get(`/challenges/${code}`)).body).toMatchObject({
      status: 'accepted',
      gameId,
    });

    const white = await socketFor(alice);
    const black = await socketFor(bob);
    const watcher = await socketFor(carol);
    const joined = await join(white, gameId);
    expect(joined.state).toMatchObject({
      status: 'active',
      moves: [],
      white: { id: alice.user.id },
      black: { id: bob.user.id },
    });
    // Guests are not friends, so there is no chat.
    expect(joined.chat).toBeNull();
    await join(black, gameId);
    await join(watcher, gameId);

    expect(await act(black, gameId, { type: 'move', uci: 'e7e5' })).toEqual({
      error: 'notYourTurn',
    });
    expect(await act(white, gameId, { type: 'move', uci: 'e2e5' })).toEqual({
      error: 'illegal',
    });
    expect(await act(watcher, gameId, { type: 'resign' })).toEqual({
      error: 'notPlayer',
    });
    expect(
      await ask(white, 'game:chat', { gameId, text: 'salom' }),
    ).toEqual({ error: 'notAllowed' });

    const finished = next<GameView>(watcher, 'game:state', (s) => s.status === 'finished');
    await moves(white, black, gameId, ['f2f3', 'e7e5', 'g2g4', 'd8h4']);
    expect(await finished).toMatchObject({
      result: '0-1',
      termination: 'checkmate',
      moves: ['f2f3', 'e7e5', 'g2g4', 'd8h4'],
    });

    const game = await http(carol).get(`/games/${gameId}`).expect(200);
    expect(game.body).toMatchObject({ status: 'finished', result: '0-1' });
    const recent = await http(alice).get('/games/recent').expect(200);
    expect(recent.body[0]).toMatchObject({
      id: gameId,
      black: { id: bob.user.id },
      termination: 'checkmate',
    });

    // Rematch: same opponent, colours swapped.
    const rematch = await http(bob).post('/challenges', { rematchOf: gameId }).expect(201);
    expect(rematch.body).toMatchObject({ destId: alice.user.id, color: 'white' });
    await http(carol).post(`/challenges/${rematch.body.code}/accept`).expect(403);
    const second = await http(alice)
      .post(`/challenges/${rematch.body.code}/accept`)
      .expect(200);
    const view = await http(alice).get(`/games/${second.body.gameId}`).expect(200);
    expect(view.body).toMatchObject({
      white: { id: bob.user.id },
      black: { id: alice.user.id },
    });
  });

  it('rates games between registered players only', async () => {
    const guest = await createGuest(app);
    await http(guest)
      .post('/challenges', { timeControl: '3+2', color: 'white', rated: true })
      .expect(403);

    const [dilnoza, jasur] = await Promise.all([
      registerUser(app, 'Dilnoza'),
      registerUser(app, 'Jasur'),
    ]);
    const created = await http(dilnoza)
      .post('/challenges', { timeControl: '3+2', color: 'white', rated: true })
      .expect(201);
    await http(guest).post(`/challenges/${created.body.code}/accept`).expect(403);
    const { gameId } = (
      await http(jasur).post(`/challenges/${created.body.code}/accept`).expect(200)
    ).body;

    const white = await socketFor(dilnoza);
    const black = await socketFor(jasur);
    await join(white, gameId);
    await join(black, gameId);
    // Before both sides have moved, a player may abort but not resign.
    expect(await act(white, gameId, { type: 'resign' })).toEqual({
      error: 'notAllowed',
    });
    await moves(white, black, gameId, ['e2e4', 'e7e5']);
    const finished = next<GameView>(black, 'game:state', (s) => s.status === 'finished');
    expect(await act(white, gameId, { type: 'resign' })).toEqual({ ok: true });
    expect(await finished).toMatchObject({
      result: '0-1',
      termination: 'resign',
      rated: true,
      category: 'blitz',
      white: { rating: 1000 },
    });

    const game = (await http(jasur).get(`/games/${gameId}`).expect(200)).body as GameView;
    expect(game.white?.ratingDiff).toBeLessThan(0);
    expect(game.black?.ratingDiff).toBeGreaterThan(0);
    const progress = await http(jasur).get('/progress').expect(200);
    expect(progress.body.gameRatings).toEqual([
      expect.objectContaining({ category: 'blitz', count: 1 }),
    ]);
    expect(progress.body.gameRatings[0].rating).toBeGreaterThan(1000);
  });

  it('aborts a game without first moves and flags a slow player', async () => {
    const [alice, bob] = await Promise.all([createGuest(app), createGuest(app)]);
    const white = await socketFor(alice);
    const black = await socketFor(bob);

    const first = await startGame(alice, bob, { timeControl: '1+0' });
    await join(white, first.gameId);
    now += 31_000;
    const aborted = next<GameView>(white, 'game:state', (s) => s.status === 'aborted');
    expect(await ask(white, 'game:flag', { gameId: first.gameId })).toEqual({ ok: true });
    expect(await aborted).toMatchObject({ termination: 'aborted', result: '*' });

    const second = await startGame(alice, bob, { timeControl: '1+0' });
    await join(white, second.gameId);
    await join(black, second.gameId);
    await moves(white, black, second.gameId, ['e2e4', 'e7e5']);
    now += 61_000;
    const flagged = next<GameView>(black, 'game:state', (s) => s.status === 'finished');
    // A move after the flag fell is not played.
    expect(await act(white, second.gameId, { type: 'move', uci: 'g1f3' })).toEqual({
      ok: true,
    });
    expect(await flagged).toMatchObject({
      result: '0-1',
      termination: 'timeout',
      moves: ['e2e4', 'e7e5'],
      clock: { white: 0 },
    });
  });

  it('takes a move back and agrees a draw', async () => {
    const [alice, bob] = await Promise.all([createGuest(app), createGuest(app)]);
    const { gameId } = await startGame(alice, bob);
    const white = await socketFor(alice);
    const black = await socketFor(bob);
    await join(white, gameId);
    await join(black, gameId);
    await moves(white, black, gameId, ['e2e4', 'e7e5', 'g1f3']);

    expect(await act(white, gameId, { type: 'takebackOffer' })).toEqual({ ok: true });
    const takenBack = next<GameView>(white, 'game:state', (s) => s.moves.length === 2);
    expect(await act(black, gameId, { type: 'takebackAccept' })).toEqual({ ok: true });
    expect((await takenBack).takebackOffer).toBeNull();

    expect(await act(white, gameId, { type: 'drawOffer' })).toEqual({ ok: true });
    const drawn = next<GameView>(white, 'game:state', (s) => s.status === 'finished');
    expect(await act(black, gameId, { type: 'drawAccept' })).toEqual({ ok: true });
    expect(await drawn).toMatchObject({ result: '1/2-1/2', termination: 'agreement' });
  });

  it('keeps friends, shows who is online and sends challenges to them', async () => {
    const [aziz, malika] = await Promise.all([
      registerUser(app, 'Aziz'),
      registerUser(app, 'Malika'),
    ]);
    const guest = await createGuest(app);
    await http(guest).post(`/friends/${aziz.user.id}`).expect(403);
    await http(aziz).post(`/friends/${guest.user.id}`).expect(400);
    await http(aziz)
      .post('/challenges', {
        timeControl: '5+0',
        color: 'white',
        rated: false,
        friendId: malika.user.id,
      })
      .expect(403);

    const malikaSocket = await socketFor(malika);
    const requested = next(malikaSocket, 'friends:changed');
    await http(aziz).post(`/friends/${malika.user.id}`).expect(204);
    await requested;
    expect((await http(malika).get('/friends')).body).toMatchObject({
      friends: [],
      incoming: [{ id: aziz.user.id, name: 'Aziz' }],
    });
    expect((await http(aziz).get('/friends')).body.outgoing).toEqual([
      expect.objectContaining({ id: malika.user.id }),
    ]);

    await http(malika).post(`/friends/${aziz.user.id}/accept`).expect(204);
    expect((await http(aziz).get('/friends')).body.friends).toEqual([
      expect.objectContaining({ id: malika.user.id, online: true }),
    ]);

    // Aziz coming online reaches Malika.
    const online = next(malikaSocket, 'friends:changed');
    const azizSocket = await socketFor(aziz);
    await online;
    expect((await http(malika).get('/friends')).body.friends).toEqual([
      expect.objectContaining({ id: aziz.user.id, online: true }),
    ]);

    // A declined challenge.
    const invited = next(malikaSocket, 'challenges:changed');
    const declined = await http(aziz)
      .post('/challenges', {
        timeControl: '10+0',
        color: 'random',
        rated: true,
        friendId: malika.user.id,
      })
      .expect(201);
    await invited;
    expect((await http(malika).get('/challenges')).body.incoming).toEqual([
      expect.objectContaining({ code: declined.body.code, rated: true }),
    ]);
    await http(guest).post(`/challenges/${declined.body.code}/decline`).expect(403);
    await http(malika).post(`/challenges/${declined.body.code}/decline`).expect(204);
    expect((await http(aziz).get(`/challenges/${declined.body.code}`)).body.status).toBe(
      'declined',
    );

    // Friends can chat during their game.
    const { gameId } = await startGame(aziz, malika, { friendId: malika.user.id });
    expect((await join(azizSocket, gameId)).chat).toEqual([]);
    await join(malikaSocket, gameId);
    const message = next<{ gameId: string; line: { text: string } }>(
      malikaSocket,
      'game:chat',
    );
    expect(await ask(azizSocket, 'game:chat', { gameId, text: 'Omad!' })).toEqual({
      ok: true,
    });
    expect((await message).line.text).toBe('Omad!');
    expect(await ask(azizSocket, 'game:chat', { gameId, text: 'Yana' })).toEqual({
      error: 'tooFast',
    });

    await http(malika).delete(`/friends/${aziz.user.id}`).expect(204);
    expect((await http(aziz).get('/friends')).body.friends).toEqual([]);
  });

  it('rejects sockets without a valid token', async () => {
    await expect(connect(url, 'not-a-token')).rejects.toThrow('unauthorized');
  });
});
