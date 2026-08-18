import { type ReactNode } from "react";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { clerkEnabled } from "@/lib/clerk-config";
import { WorkspaceContext, type WorkspaceContextValue } from "@/lib/workspace";

const DEMO_WORKSPACE: WorkspaceContextValue = {
  organization: { id: "demo", name: "wondering demo", membersCount: 1 },
  firstName: null,
  isLoaded: true,
  isDemo: true,
};

function ClerkWorkspaceProvider({ children }: { children: ReactNode }) {
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  return (
    <WorkspaceContext.Provider
      value={{
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
              membersCount: organization.membersCount,
            }
          : null,
        firstName: user?.firstName ?? null,
        isLoaded: organizationLoaded && userLoaded,
        isDemo: false,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    return (
      <WorkspaceContext.Provider value={DEMO_WORKSPACE}>
        {children}
      </WorkspaceContext.Provider>
    );
  }
  return <ClerkWorkspaceProvider>{children}</ClerkWorkspaceProvider>;
}
