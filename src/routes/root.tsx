import { AlertProvider } from "@/components/alert";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div className="">
        <AlertProvider>
          <Outlet />
          <Toaster />
        </AlertProvider>
      </div>
    </>
  );
}
