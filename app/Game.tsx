import { useQuery, useZero } from '@rocicorp/zero/react';
import type { Player, Schema } from '~/db/schema';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { randomAnswer } from '~/utils';
import clsx from 'clsx';
import Confetti from 'react-confetti';

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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (canvasRef.current) {
        const canDraw =
          window.localStorage.getItem('player') === round?.artist_id;

        const ctx = canvasRef.current.getContext('2d')!;

        let drawing = false;
        let prevX = undefined;
        let prevY = undefined;
        let currX = 0;
        let currY = 0;

        let offsetX = 0;
        let offsetY = 0;

        const mouseDown = () => {
          drawing = true;

          offsetX = canvasRef.current?.getBoundingClientRect().left || 0;
          offsetY = canvasRef.current?.getBoundingClientRect().top || 0;
        };

        const mouseUp = () => {
          drawing = false;
          prevX = undefined;
          prevY = undefined;
          currX = 0;
          currY = 0;
        };

        function draw(event: MouseEvent) {
          if (!drawing) return;

          prevX = currX;
          prevY = currY;

          currX = event.clientX - offsetX;
          currY = event.clientY - offsetY;

          ctx.beginPath();
          ctx.moveTo(prevX || currX, prevY || currY);
          ctx.lineTo(currX, currY);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.closePath();

          if (canDraw && round) {
            z.mutate.round.update({
              id: round.id,
              drawing: canvasRef.current?.toDataURL() || '',
            });
          }
        }

        canvasRef.current.addEventListener('mousedown', mouseDown);
        canvasRef.current.addEventListener('mouseup', mouseUp);
        canvasRef.current.addEventListener('mousemove', draw);
      }
    }, 500);

    return () => {
      if (canvasRef.current) {
      }
    };
  }, [round?.artist_id]);

  const [s, setS] = useState('');
  const state = useMemo(() => {
    if (!game) return 'loading';

    if (game.status === 'drafting') return 'choosing';

    if (
      game.rounds.filter((r) => r.status === 'complete').length ===
      game.players.length
    )
      return 'complete';

    if (!round) return 'choosing';

    return 'in progress';
  }, [game?.status, round?.status, game?.rounds, game?.players.length]);
  useEffect(() => {
    t(() => setS(state));
  }, [state]);

  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const aps = useMemo(() => {
    if (!game) return '';

    return players
      .filter((p) => !game.players.find((g) => g.id === p.id))
      .map((p) => p.id)
      .join(';');
  }, [players, game]);
  useEffect(() => {
    t(() => setAvailablePlayers(aps.split(';')));
  }, [aps]);

  return (
    <div className='relative'>
      <header
        style={{ viewTransitionName: 'header' }}
        className={clsx(
          'flex flex-col gap-10 justify-center items-center absolute left-1/2  -translate-x-1/2 py-10',
          {
            'top-1/2 -translate-y-1/2 animate-pulse': s === 'loading',
            'top-0 translate-y-0': s !== 'loading',
          }
        )}
      >
        <h1 className={clsx('text-6xl -skew-y-3')}>appictionary</h1>
        {s === 'loading' && (
          <p className='text-gray'>...waiting for game to start</p>
        )}
      </header>

      {s === 'in progress' &&
        window.localStorage.getItem('player') === round?.artist_id &&
        !round?.winner_id && (
          <div className='fixed top-0 left-0 right-0 text-center bg-magenta p-5'>
            It's your turn to draw! Your word is{' '}
            <span className='font-bold'>{round.answer}</span>
          </div>
        )}

      {s === 'in progress' && round?.winner_id && (
        <div className='fixed top-0 left-0 right-0 text-center bg-magenta p-5'>
          {round?.winner?.name} got it! The word was{' '}
          <span className='font-bold'>{round.answer}</span>
        </div>
      )}

      {s === 'complete' && (
        <>
          <div className='top-1/2 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl'>
            finished! 🎉
          </div>
          <Confetti
            style={{ zIndex: 9999, position: 'fixed', inset: 0 }}
            //   colors={[
            // 	  theme.colorBlue,
            // 	  theme.colorYellow,
            // 	  theme.colorGreen,
            // 	  theme.colorMagenta,
            // 	  theme.colorGray,
            //   ]}
            numberOfPieces={500}
            initialVelocityY={-30}
            recycle={false}
          />
        </>
      )}

      {s === 'in progress' &&
        (localStorage.getItem('player') === round?.artist_id ? (
          <canvas
            key={round?.id}
            ref={canvasRef}
            id='canvas'
            className='bg-white top-50 absolute left-1/2 -translate-x-1/2 z-50'
            width='300'
            height='300'
          ></canvas>
        ) : (
          <div className='top-40 absolute left-1/2 -translate-x-1/2 z-50 flex flex-col gap-10 items-center'>
            <img
              width='300'
              height='300'
              src={round?.drawing}
              className='bg-white '
            />

            {!round?.winner_id && (
              <form
                className='flex gap-5 flex-wrap items-center justify-center'
                onSubmit={(e) => {
                  e.preventDefault();

                  if (
                    round &&
                    guess.toLocaleLowerCase() ===
                      round.answer.toLocaleLowerCase()
                  ) {
                    z.mutate.round.update({
                      id: round.id,
                      winner_id: localStorage.getItem('player'),
                    });
                  }

                  setGuess('');
                }}
              >
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  className='border-1 rounded p-4'
                  placeholder='Type your guess here'
                />
                <button
                  type='submit'
                  disabled={!guess}
                  className='p-4 border rounded'
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        ))}

      <div
        className={clsx('p-40 flex flex-col gap-10', {
          'opacity-0 pointer-events-none translate-y-full h-0':
            s !== 'choosing',
          'opacity-100': s === 'choosing',
        })}
        style={{ viewTransitionName: 'choose-player' }}
      >
        <h2 className='text-2xl text-center'>Choose your player</h2>
        <ul className='flex gap-4 flex-wrap items-center justify-center'>
          {players
            // .filter((p) => !game?.players.find((g) => g.id === p.id))
            .reverse()
            .map((player) => (
              <li
                key={player.id}
                className={clsx(
                  'transition-all hover:scale-110 cursor-pointer',
                  {
                    'sr-only opacity-0': !availablePlayers.find(
                      (g) => g === player.id
                    ),
                  }
                )}
                style={{ viewTransitionName: `choose-player-${player.id}` }}
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
                {/* {player.name} */}
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
      </div>

      <div
        className={clsx(
          ' flex flex-col gap-10 absolute bottom-0 left-1/2 -translate-x-1/2 width-full',
          {
            'opacity-0 pointer-events-none translate-y-full h-0':
              s === 'loading',
            'opacity-100': s !== 'choosing',
          }
        )}
        style={{ viewTransitionName: 'game-players' }}
      >
        <ul className='flex gap-4 flex-wrap items-end justify-center'>
          {players
            // .filter((p) => !game?.players.find((g) => g.id === p.id))
            .reverse()
            .map((player) => (
              <li
                key={player.id}
                className={clsx('relative', {
                  'sr-only opacity-0': availablePlayers.find(
                    (g) => g === player.id
                  ),
                })}
                style={{ viewTransitionName: `game-player-${player.id}` }}
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
                <span className='absolute bottom-0 right-0 py-1 px-3 font-bold bg-blue text-lg'>
                  {game?.rounds.filter((r) => r.winner_id === player.id).length}
                </span>
                {player.image && (
                  <img
                    src={player.image}
                    alt={player.name}
                    className={clsx('block size-20', {
                      'size-30': round?.artist_id === player.id,
                    })}
                  />
                )}
              </li>
            ))}
        </ul>
      </div>

      {/* {game?.status === 'draftingx' && (
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
      )} */}

      {/* {game &&
        round &&
        game.status === 'in progress' &&
        round.status === 'in progress' &&
        !game.winner_id && (
          <div key={round.id} className='hidden'>
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

                    {window.localStorage.getItem('player') === player.id &&
                      round.artist_id !== player.id &&
                      !round.winner_id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();

                            if (
                              guess.toLocaleLowerCase() ===
                              round.answer.toLocaleLowerCase()
                            ) {
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


          </div>
        )} */}

      {/* {game && game.status === 'in progress' && game.winner_id && (
        <div>
          <h1>Complete</h1>
          <h2>Winner: {game.winner?.name}</h2>
        </div>
      )} */}

      {window.localStorage.getItem('admin') === 'yup' && (
        <div className='fixed bottom-0 right-0 p-4 bg-white text-black flex flex-col gap-2'>
          <h2>Admin</h2>
          {!game && (
            <button
              onClick={async () => {
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
          )}
          <button
            onClick={() => {
              if (game) {
                z.mutate.game.update({ status: 'in progress', id: game.id });

                z.mutate.round.insert({
                  id: nanoid(),
                  artist_id: game.players[game.rounds.length].id,
                  game_id: game.id,
                  status: 'in progress',
                  answer: randomAnswer(),
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
                  answer: randomAnswer(),
                  drawing: '',
                });
              }
            }}
          >
            Complete round
          </button>

          {game && (
            <>
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
                    winner_id: winner || null,
                  });
                }}
              >
                Complete game
              </button>
              <button
                onClick={() => {
                  if (game) {
                    z.mutate.game.update({
                      id: game.id,
                      status: 'complete',
                    });
                  }
                }}
              >
                End game
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const t = (cb: () => unknown) => {
  //   console.log('t called');
  //   return cb();
  if (!document.startViewTransition) {
    cb();
  }

  document.startViewTransition(cb);
};
