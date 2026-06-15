import { RouterProvider } from 'react-router';
import { router } from './app/routes/routes';
import { EventProvider } from './app/context/EventContext';

export default function App() {
  return (
    <EventProvider>
      <RouterProvider router={router} />
    </EventProvider>
  );
}
