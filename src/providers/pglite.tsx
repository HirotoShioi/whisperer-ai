import { FullPageLoader } from "@/components/fulll-page-loader";
import { getDB } from "@/lib/database/client";
import React, { useEffect, useState } from "react";

export const PgliteProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDBReady, setIsDBReady] = useState(false);
  const init = async () => {
    await getDB();
    setIsDBReady(true);
  };
  useEffect(() => {
    init();
  }, []);
  if (!isDBReady) {
    return <FullPageLoader label="Loading database..." />;
  }
  return <>{children}</>;
};
