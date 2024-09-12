import { PgliteProvider } from "./pglite";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PgliteProvider>{children}</PgliteProvider>;
}
