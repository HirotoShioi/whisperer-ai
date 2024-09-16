import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";
import { vector } from "@electric-sql/pglite/vector";

worker({
  async init(options) {
    return new PGlite({
      dataDir: options.dataDir,
      extensions: {
        vector,
      },
    });
  },
});
