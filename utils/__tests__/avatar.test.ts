import { normalizeAvatarUri } from '../avatar';

describe('normalizeAvatarUri', () => {
  it('returns undefined for empty input', () => {
    expect(normalizeAvatarUri(undefined)).toBeUndefined();
    expect(normalizeAvatarUri(null)).toBeUndefined();
    expect(normalizeAvatarUri('')).toBeUndefined();
    expect(normalizeAvatarUri('   ')).toBeUndefined();
  });

  it('leaves schemed URIs unchanged', () => {
    expect(normalizeAvatarUri('https://example.com/avatar.jpg')).toBe(
      'https://example.com/avatar.jpg',
    );
    expect(normalizeAvatarUri('file:///tmp/avatar.png')).toBe(
      'file:///tmp/avatar.png',
    );
    expect(normalizeAvatarUri('content://contacts/photo/1')).toBe(
      'content://contacts/photo/1',
    );
    expect(normalizeAvatarUri('ph://abc123')).toBe('ph://abc123');
    expect(normalizeAvatarUri('data:image/png;base64,abc')).toBe(
      'data:image/png;base64,abc',
    );
  });

  it('prefixes absolute paths with file scheme', () => {
    expect(normalizeAvatarUri('/var/mobile/avatar.png')).toBe(
      'file:///var/mobile/avatar.png',
    );
  });
});
