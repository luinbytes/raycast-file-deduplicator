import {
  Action,
  ActionPanel,
  List,
  showToast,
  Toast,
  getPreferenceValues,
  showInFinder,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { scanForDuplicates, formatFileSize, getFilename } from "./lib/cli";
import type { DuplicateGroup, FileInfo, Preferences } from "./lib/types";

export default function FindDuplicates() {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");

  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    // Auto-scan default location on mount
    if (preferences.defaultScanLocation) {
      handleScan(preferences.defaultScanLocation);
    }
  }, []);

  async function handleScan(directory: string) {
    setIsLoading(true);
    setSelectedDirectory(directory);

    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Scanning for duplicates",
        message: `Checking ${directory}...`,
      });

      const result = await scanForDuplicates(directory, {
        algorithm: preferences.algorithm,
      });

      setDuplicates(result.duplicates);

      if (result.duplicate_count === 0) {
        showToast({
          style: Toast.Style.Success,
          title: "No duplicates found",
          message: "Your files are unique!",
        });
      } else {
        const spaceSaved = formatFileSize(result.total_space);
        showToast({
          style: Toast.Style.Success,
          title: `Found ${result.duplicate_count} duplicate groups`,
          message: `${spaceSaved} can be recovered`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan for duplicates";
      showToast({
        style: Toast.Style.Failure,
        title: "Scan failed",
        message: message,
      });
      setDuplicates([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteFile(file: FileInfo) {
    try {
      const { trash } = await import("@raycast/api");
      await trash([file.Path]);
      showToast({
        style: Toast.Style.Success,
        title: "Moved to trash",
        message: getFilename(file.Path),
      });
      // Refresh the list
      if (selectedDirectory) {
        handleScan(selectedDirectory);
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to delete",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search duplicates...">
      {duplicates.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No Duplicates Found"
          description={
            selectedDirectory
              ? "All files are unique!"
              : "Select a folder to scan for duplicate files"
          }
          actions={
            <ActionPanel>
              <Action.Open
                title="Select Folder"
                target={preferences.defaultScanLocation || "~"}
              />
            </ActionPanel>
          }
        />
      ) : (
        duplicates.map((group, groupIndex) => (
          <List.Section
            key={group.Hash}
            title={`Group ${groupIndex + 1} - ${formatFileSize(group.Size)} each`}
            subtitle={`${group.Files.length} files`}
          >
            {group.Files.map((file, fileIndex) => (
              <List.Item
                key={`${group.Hash}-${fileIndex}`}
                title={getFilename(file.Path)}
                subtitle={file.Path}
                accessories={[
                  { text: formatFileSize(file.Size) },
                  { text: new Date(file.ModTime).toLocaleDateString() },
                ]}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section title="File Actions">
                      <Action.ShowInFinder path={file.Path} />
                      <Action.CopyToClipboard
                        title="Copy Path"
                        content={file.Path}
                        shortcut={{ modifiers: ["cmd"], key: "c" }}
                      />
                      <Action
                        title="Move to Trash"
                        icon="🗑"
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                        onAction={() => handleDeleteFile(file)}
                      />
                    </ActionPanel.Section>
                    <ActionPanel.Section title="Scan">
                      <Action.Open
                        title="Scan Different Folder"
                        target="~"
                        shortcut={{ modifiers: ["cmd"], key: "o" }}
                      />
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        ))
      )}
    </List>
  );
}
