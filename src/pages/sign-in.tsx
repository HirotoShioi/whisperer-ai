import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import Header from "@/components/header";
export default function SignInPage() {
  const { user } = useAuthenticator((c) => [c.user]);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);
  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Authenticator />
      </div>
    </div>
  );
}
