import "@/app/globals.css";
import { Toaster } from "sonner";
import { QueryProvider, AuthProvider } from "@/providers";

export const metadata = {
  title: "RacoAI Marketplace",
  description: "Connect buyers with problem solvers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
