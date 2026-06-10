import { describe, it, expect } from 'vitest';
import en from '../../messages/en.json';
import ru from '../../messages/ru.json';

function keysOf(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? keysOf(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('message catalogs', () => {
  it('en and ru have identical key sets', () => {
    expect(keysOf(ru).sort()).toEqual(keysOf(en).sort());
  });
});
