import { AlertProvider } from "@/components/alert";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      if (data.payload.event === "signedIn") {
        navigate("/");
      }
    });
  }, [navigate]);
  return (
    <div className="">
      <TooltipProvider delayDuration={0}>
        <AlertProvider>
          <Outlet />
          <Toaster />
        </AlertProvider>
      </TooltipProvider>
    </div>
  );
}
