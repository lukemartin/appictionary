import { Zero } from '@rocicorp/zero';
import type { Route } from './+types/home';
import { schema } from '../db/schema';
import { ZeroProvider } from '@rocicorp/zero/react';
import { Game } from '~/Game';

export function meta({}: Route.MetaArgs) {
  return [{ title: '✏️ appicationary' }];
}

export default function Home() {
  const z = new Zero({
    userID: 'anon',
    auth: () => '',
    server: import.meta.env.VITE_PUBLIC_SERVER,
    schema,
    // This is often easier to develop with if you're frequently changing
    // the schema. Switch to 'idb' for local-persistence.
    kvStore: import.meta.env.PROD ? 'idb' : 'mem',
  });

  return (
    <ZeroProvider zero={z}>
      <Game />
    </ZeroProvider>
  );
}
