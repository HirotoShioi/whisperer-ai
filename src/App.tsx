import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "@/pages/error-page";
import Root from "@/routes/root";
import Providers from "@/providers/providers";
import NotFoundPage from "./pages/not-found-page";
import ChatPage, {
  loader as chatLoader,
  action as chatAction,
} from "./pages/chat/page";
import SettingsPage from "./pages/settings-page";
import IndexPage, { loader as indexLoader } from "./pages/index/Page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/",
            index: true,
            element: <IndexPage />,
            loader: indexLoader,
          },
          {
            path: "/chat/:threadId",
            action: chatAction,
            loader: (req) => chatLoader(req),
            element: <ChatPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
