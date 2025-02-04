import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';
import Cookies from 'js-cookie';
import { decodeJwt } from 'jose';
import { Zero } from '@rocicorp/zero';
import { schema } from '../db/schema';
import { ZeroProvider } from '@rocicorp/zero/react';

const encodedJWT = Cookies.get('jwt');
const decodedJWT = encodedJWT && decodeJwt(encodedJWT);
const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : 'anon';

const z = new Zero({
  userID,
  auth: () => encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  // This is often easier to develop with if you're frequently changing
  // the schema. Switch to 'idb' for local-persistence.
  kvStore: 'mem',
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  return (
    <ZeroProvider zero={z}>
      <Welcome />
    </ZeroProvider>
  );
}
