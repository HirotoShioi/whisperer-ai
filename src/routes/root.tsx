import { AlertProvider } from "@/components/alert";
import { Toaster } from "@/components/ui/toaster";
import { Hub } from "aws-amplify/utils";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Root() {
  const navigate = useNavigate();
  useEffect(() => {
    Hub.listen("auth", (data) => {
      if (data.payload.event === "signedOut") {
        navigate("/");
      }
    });
  }, [navigate]);
  return (
    <div className="">
      <AlertProvider>
        <Outlet />
        <Toaster />
      </AlertProvider>
    </div>
  );
}
