import { createContext, useContext } from "react";

interface WorkspaceOrganization {
  id: string;
  name: string;
  membersCount?: number | null;
}

export interface WorkspaceContextValue {
  organization: WorkspaceOrganization | null;
  firstName: string | null;
  isLoaded: boolean;
  isDemo: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  organization: { id: "demo", name: "wondering demo", membersCount: 1 },
  firstName: null,
  isLoaded: true,
  isDemo: true,
});

export function useWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}
