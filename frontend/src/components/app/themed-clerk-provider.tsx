import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";
import { clerkPublishableKey } from "@/lib/clerk-config";
import { useTheme } from "@/lib/use-theme";

// Clerk's own widgets (UserButton, OrganizationSwitcher, CreateOrganization) don't read our CSS
// tokens, so in dark mode they need Clerk's dark baseTheme or they render light and unreadable.
export function ThemedClerkProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  // Clerk is optional for the public buyer experience and the self-hosted demo.
  // Avoid mounting Clerk components without a key; authenticated console routes
  // remain protected whenever a key is configured.
  if (!clerkPublishableKey) return children;

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      appearance={theme === "dark" ? { baseTheme: dark } : undefined}
    >
      {children}
    </ClerkProvider>
  );
}
