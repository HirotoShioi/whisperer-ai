import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from "@/pages/error-page";
import Root from "@/routes/root";
import Providers from "@/providers/providers";
import NotFoundPage from "./pages/not-found-page";
import ChatPage, { loader as chatLoader } from "./pages/chat/page";
import SettingsPage from "./pages/settings-page";
import IndexPage from "./pages/index/page";
import Callback, { loader as callbackLoader } from "./pages/callback";
import SignInPage from "./pages/sign-in";
import { fetchAuthSession } from "aws-amplify/auth";

async function redirectIfAuthenticated() {
  const session = await fetchAuthSession();
  if (session.credentials) {
    return redirect("/");
  }
  return null;
}

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
          },
          {
            path: "/chat/:threadId",
            element: <ChatPage />,
            loader: (arg) => chatLoader(arg),
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/sign-in",
            element: <SignInPage />,
            loader: redirectIfAuthenticated,
          },
          {
            path: "/callback",
            element: <Callback />,
            loader: (arg) => callbackLoader(arg),
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
