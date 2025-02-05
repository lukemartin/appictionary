import { useQuery, useZero } from '@rocicorp/zero/react';
import type { Schema } from '~/db/schema';
import { nanoid } from 'nanoid';
import { useState } from 'react';

export const Game = () => {
  const z = useZero<Schema>();

  const [players] = useQuery(z.query.player);
  const [game] = useQuery(
    z.query.game
      .related('players')
      .related('winner')
      .related('rounds')
      .where('status', '!=', 'complete')
      .one()
  );

  const [round] = useQuery(
    z.query.round
      .related('game')
      .related('winner')
      .related('artist')
      .where('status', '!=', 'complete')
      .one()
  );

  const [guess, setGuess] = useState('');

  console.log({ game, round });
  return (
    <div>
      <h1>Game</h1>
      {game?.status === 'drafting' && (
        <>
          <h2>Available Players</h2>
          <ul className='flex gap-5 flex-wrap'>
            {players
              .filter((p) => !game?.players.find((g) => g.id === p.id))
              .map((player) => (
                <li
                  key={player.id}
                  onClick={() => {
                    if (game) {
                      window.localStorage.setItem('player', player.id);

                      z.mutate.game_player.insert({
                        game_id: game.id,
                        player_id: player.id,
                      });
                    }
                  }}
                >
                  {player.name}
                  {player.image && (
                    <img
                      src={player.image}
                      alt={player.name}
                      className='block size-20'
                    />
                  )}
                </li>
              ))}
          </ul>

          <h2>In game</h2>
          <ul className='flex gap-5'>
            {game &&
              game.players.map((player) => (
                <li key={player.id}>
                  {player.name}
                  {player.image && (
                    <img
                      src={player.image}
                      alt={player.name}
                      className='block size-20'
                    />
                  )}
                </li>
              ))}
          </ul>
        </>
      )}

      {game &&
        round &&
        game.status === 'in progress' &&
        round.status === 'in progress' &&
        !game.winner_id && (
          <>
            <h2>New round. Word = {round.answer}</h2>

            {round.artist && <h3>Artist: {round.artist.name}</h3>}
            {round.winner && <h3>Winner: {round.winner.name}</h3>}

            <ul className='flex flex-col flex-wrap gap-5'>
              {game &&
                game.players.map((player) => (
                  <li key={player.id} className='flex gap-4 items-center'>
                    {player.image && (
                      <img
                        src={player.image}
                        alt={player.name}
                        className='block size-20'
                      />
                    )}
                    <span>
                      points:{' '}
                      {
                        game.rounds.filter((r) => r.winner_id === player.id)
                          .length
                      }
                    </span>
                    {window.localStorage.getItem('player') === player.id &&
                      round.artist_id !== player.id &&
                      !round.winner_id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();

                            if (guess === round.answer) {
                              z.mutate.round.update({
                                id: round.id,
                                winner_id: player.id,
                              });
                            }

                            setGuess('');
                          }}
                        >
                          <input
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                          />
                          <button type='submit' disabled={!guess}>
                            Go
                          </button>
                        </form>
                      )}
                  </li>
                ))}
            </ul>
          </>
        )}

      {game && game.status === 'in progress' && game.winner_id && (
        <div>
          <h1>Complete</h1>
          <h2>Winner: {game.winner?.name}</h2>
        </div>
      )}
      {window.localStorage.getItem('admin') === 'yup' && (
        <div className='fixed bottom-0 right-0 p-4 bg-white text-black flex flex-col gap-2'>
          <h2>Admin</h2>
          <button
            onClick={async () => {
              if (game) {
                z.mutate.game.update({ status: 'complete', id: game.id });
              }

              if (round) {
                z.mutate.round.update({ status: 'complete', id: round.id });
              }

              z.mutate.game.insert({
                id: nanoid(),
                status: 'drafting',
                date_started: Date.now(),
              });
            }}
          >
            New Game
          </button>
          <button
            onClick={() => {
              if (game) {
                z.mutate.game.update({ status: 'in progress', id: game.id });

                z.mutate.round.insert({
                  id: nanoid(),
                  artist_id: game.players[game.rounds.length].id,
                  game_id: game.id,
                  status: 'in progress',
                  answer: 'cake',
                  drawing: '',
                });
              }
            }}
          >
            Start current game
          </button>

          <button
            className='disabled:opacity-20'
            disabled={!round?.winner_id}
            onClick={() => {
              if (round) {
                z.mutate.round.update({
                  id: round.id,
                  status: 'complete',
                });
              }

              if (game && game.rounds.length < game.players.length) {
                z.mutate.round.insert({
                  id: nanoid(),
                  artist_id: game.players[game.rounds.length].id,
                  game_id: game.id,
                  status: 'in progress',
                  answer: 'dogs',
                  drawing: '',
                });
              }
            }}
          >
            Complete round
          </button>

          {game && game.rounds.length === game.players.length && (
            <button
              onClick={() => {
                const winners = game.rounds.reduce((acc, r) => {
                  if (r.winner_id) {
                    acc[r.winner_id] = acc[r.winner_id]
                      ? acc[r.winner_id] + 1
                      : 1;
                  }

                  return acc;
                }, {} as Record<string, number>);

                const winner = Object.entries(winners).reduce(
                  (acc, cur) => {
                    if (cur[1] > acc[1]) {
                      return cur;
                    }

                    return acc;
                  },
                  ['', 0] as [string, number]
                )[0];

                z.mutate.game.update({
                  id: game.id,
                  winner_id: winner,
                });
              }}
            >
              Complete game
            </button>
          )}
        </div>
      )}
    </div>
  );
};
