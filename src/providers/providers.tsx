import { AuthProvider } from "./auth";
import { PgliteProvider } from "./pglite";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PgliteProvider>{children}</PgliteProvider>
    </AuthProvider>
  );
}
