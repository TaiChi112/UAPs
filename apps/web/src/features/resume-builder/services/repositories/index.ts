import type { VaultRepository } from "@uaps/shared/resume-builder";

import { HybridVaultRepository } from "./hybrid-vault.repository";

let repository: VaultRepository | null = null;

export const getResumeBuilderRepository = (): VaultRepository => {
  if (!repository) {
    repository = new HybridVaultRepository();
  }

  return repository;
};
