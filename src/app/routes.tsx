import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Trigger } from "./pages/Trigger";
import { History } from "./pages/History";
import { CalendarLog } from "./pages/CalendarLog";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "calendar", Component: CalendarLog },
      { path: "trigger", Component: Trigger },
      { path: "history", Component: History },
    ],
  },
]);
