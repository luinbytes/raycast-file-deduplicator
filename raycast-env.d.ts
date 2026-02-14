/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** CLI Path - Path to the file-deduplicator binary */
  "cliPath": string,
  /** Default Scan Location - Default folder to scan for duplicates */
  "defaultScanLocation": string,
  /** Hash Algorithm - Algorithm to use for file hashing */
  "algorithm": "sha256" | "md5" | "sha1",
  /** Show Hidden Files - Include hidden files in duplicate scan */
  "showHiddenFiles": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `find-duplicates` command */
  export type FindDuplicates = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `find-duplicates` command */
  export type FindDuplicates = {}
}

