import { Link } from 'react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  return (
    <div>
      <h1>Hi</h1>

      <ul>
        <li>
          <Link to='/messages'>Messages</Link>
          <Link to='/game'>Game</Link>
        </li>
      </ul>
    </div>
  );
}
