import { expect, test } from '@rstest/core';
import { normalizePairingInput } from './pairing';

test('normalizePairingInput strips spaces and uppercases', () => {
  expect(normalizePairingInput(' ab 12 ')).toBe('AB12');
});
