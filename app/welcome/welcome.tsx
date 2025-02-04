import { useQuery, useZero } from '@rocicorp/zero/react';
import type { Schema } from '~/db/schema';

export function Welcome() {
  const z = useZero<Schema>();
  const all = z.query.message;
  const [allMessages] = useQuery(all);

  return (
    <main className='flex items-center justify-center pt-16 pb-4'>
      <pre>{JSON.stringify(allMessages, null, 2)}</pre>
    </main>
  );
}
