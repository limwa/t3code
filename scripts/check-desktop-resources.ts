#!/usr/bin/env node

// Verifies a Linux resources directory assembled without electron-builder,
// such as a distribution package that points T3CODE_DESKTOP_RESOURCES_PATH at
// its own copy. Fails when the build would have shipped something it lacks.

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import { Argument, Command } from "effect/unstable/cli";

import { LINUX_EXTRA_RESOURCES } from "./lib/desktop-resources.ts";

export class DesktopResourcesMissingError extends Schema.TaggedError<DesktopResourcesMissingError>()(
  "DesktopResourcesMissingError",
  {
    resourcesDir: Schema.String,
    missing: Schema.Array(Schema.String),
  },
) {
  override get message(): string {
    return `${this.resourcesDir} is missing desktop resources: ${this.missing.join(", ")}`;
  }
}

/** Lists the expected resources that are absent, or are empty directories. */
export const findMissingLinuxDesktopResources = Effect.fn("findMissingLinuxDesktopResources")(
  function* (resourcesDir: string) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const missing: string[] = [];
    for (const resource of LINUX_EXTRA_RESOURCES) {
      if ("filter" in resource) {
        for (const file of resource.filter) {
          const entry = path.join(resource.to, file);
          const exists = yield* fileSystem
            .exists(path.join(resourcesDir, entry))
            .pipe(Effect.orElseSucceed(() => false));
          if (!exists) missing.push(entry);
        }
        continue;
      }
      const contents = yield* fileSystem
        .readDirectory(path.join(resourcesDir, resource.to))
        .pipe(Effect.orElseSucceed(() => []));
      if (contents.length === 0) missing.push(resource.to);
    }
    return missing;
  },
);

const checkDesktopResourcesCommand = Command.make(
  "check-desktop-resources",
  {
    resourcesDir: Argument.String("resources-dir").pipe(
      Argument.withDescription("Linux resources directory to verify."),
    ),
  },
  Effect.fn(function* ({ resourcesDir }) {
    const missing = yield* findMissingLinuxDesktopResources(resourcesDir);
    if (missing.length > 0) {
      return yield* new DesktopResourcesMissingError({ resourcesDir, missing });
    }
    yield* Console.log(`${resourcesDir} has every Linux desktop resource.`);
  }),
).pipe(Command.withDescription("Verify a Linux desktop resources directory."));

if (import.meta.main) {
  Command.run(checkDesktopResourcesCommand, { version: "0.0.0" }).pipe(
    Effect.provide(NodeServices.layer),
    NodeRuntime.runMain,
  );
}
