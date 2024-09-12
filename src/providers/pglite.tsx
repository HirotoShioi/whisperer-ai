import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { drizzle } from "drizzle-orm/pglite";
import React, { createContext, useContext } from "react";

// Contextの作成
const PgliteContext = createContext<PGlite>({} as PGlite);

export const pglite = new PGlite("idb://playground", {
  extensions: {
    vector,
  },
});
export const db = drizzle(pglite);
// Providerコンポーネントの作成
export const PgliteProvider = ({ children }: { children: React.ReactNode }) => {
  return <PgliteContext.Provider value={pglite}>{children}</PgliteContext.Provider>;
};

// カスタムフックでコンテキストを使用
export const usePglite = () => {
  return useContext(PgliteContext);
};
