import { useQuery, useZero } from '@rocicorp/zero/react';
import type { Schema, User, Medium, Message } from '~/db/schema';
import { randBetween, randID, randInt } from '~/rand';

export function Welcome() {
  const z = useZero<Schema>();
  const all = z.query.message;
  const [allMessages] = useQuery(all);

  const [users] = useQuery(z.query.user);
  const [mediums] = useQuery(z.query.medium);

  const addRandomMessage = () => {
    z.mutate.message.insert(randomMessage(users, mediums));
    return true;
  };

  const handleAddAction = () => {
    addRandomMessage();
  };

  return (
    <main className=' items-center justify-center pt-16 pb-4'>
      <button onClick={handleAddAction}>Add</button>
      <hr />
      <pre>{JSON.stringify(allMessages, null, 2)}</pre>
    </main>
  );
}

const requests = [
  'Hey guys, is the zero package ready yet?',
  "I tried installing the package, but it's not there.",
  'The package does not install...',
  'Hey, can you ask Aaron when the npm package will be ready?',
  'npm npm npm npm npm',
  'n --- p --- m',
  'npm wen',
  'npm package?',
];

const replies = [
  'It will be ready next week',
  "We'll let you know",
  "It's not ready - next week",
  'next week i think',
  "Didn't we say next week",
  "I could send you a tarball, but it won't work",
];

function randomMessage(
  users: readonly User[],
  mediums: readonly Medium[]
): Message {
  const id = randID();
  const mediumID = mediums[randInt(mediums.length)].id;
  const timestamp = randBetween(1727395200000, new Date().getTime());
  const isRequest = randInt(10) <= 6;
  const messages = isRequest ? requests : replies;
  const senders = users.filter((u) => u.partner === !isRequest);
  const senderID = senders[randInt(senders.length)].id;
  return {
    id,
    senderID,
    mediumID,
    body: messages[randInt(messages.length)],
    timestamp,
  };
}
