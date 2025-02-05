import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  //   index('routes/home.tsx'),
  //   route('/messages', 'routes/messages.tsx'),
  index('routes/messages.tsx'),
  route('/api/login', 'routes/login.ts'),
] satisfies RouteConfig;
