import { defineConfig } from '@rstest/core';

/** RN UI tests use Detox/E2E later; unit tests target pure TS modules. */
export default defineConfig({
  testEnvironment: 'node',
});
