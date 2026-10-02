import { NodeServices } from "@effect/platform-node";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

import { findMissingLinuxDesktopResources } from "./check-desktop-resources.ts";
import { LINUX_EXTRA_RESOURCES } from "./lib/desktop-resources.ts";

it.layer(NodeServices.layer)("check-desktop-resources", (it) => {
  it.effect("reports resources a hand-assembled directory lacks", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const resourcesDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "t3-desktop-resources-",
      });
      for (const resource of LINUX_EXTRA_RESOURCES) {
        const dir = path.join(resourcesDir, resource.to);
        yield* fileSystem.makeDirectory(dir, { recursive: true });
        for (const file of "filter" in resource ? resource.filter : ["helper"]) {
          yield* fileSystem.writeFileString(path.join(dir, file), "");
        }
      }

      assert.deepStrictEqual(yield* findMissingLinuxDesktopResources(resourcesDir), []);

      yield* fileSystem.remove(path.join(resourcesDir, "gnome-extension", "extension.js"));
      yield* fileSystem.remove(path.join(resourcesDir, "kde-capture", "helper"));
      yield* fileSystem.remove(path.join(resourcesDir, "browser-secret"), { recursive: true });

      assert.deepStrictEqual(yield* findMissingLinuxDesktopResources(resourcesDir), [
        "kde-capture",
        path.join("gnome-extension", "extension.js"),
        "browser-secret",
      ]);
    }),
  );
});
