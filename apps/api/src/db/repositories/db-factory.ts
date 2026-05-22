import { dbEnv } from "../config";

import { OrmVaultRepository } from "./orm-vault.repository";
import { RawVaultRepository } from "./raw-vault.repository";
import type { IVaultBackendRepository } from "./vault-backend.types";

export const createVaultBackendRepository = (): IVaultBackendRepository => {
  switch (dbEnv.strategy) {
    case "RAW":
      return new RawVaultRepository();
    case "ORM":
    default:
      return new OrmVaultRepository();
  }
};

export const vaultBackendRepository = createVaultBackendRepository();
