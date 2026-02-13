import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useState } from "react";

// Placeholder - implementation coming in issue #2
export default function FindDuplicates() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        title="No Duplicates Found"
        description="Select a folder to scan for duplicate files"
        actions={
          <ActionPanel>
            <Action.OpenTarget title="Select Folder" target="file://~" />
          </ActionPanel>
        }
      />
    </List>
  );
}
