import { RouterProvider } from 'react-router';
import { router } from './routes';
import { EventProvider } from './context/EventContext';

export default function App() {
  return (
    <EventProvider>
      <RouterProvider router={router} />
    </EventProvider>
  );
}
