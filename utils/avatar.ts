const URI_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

export const normalizeAvatarUri = (
  uri: string | null | undefined,
): string | undefined => {
  const trimmed = uri?.trim();
  if (!trimmed) {
    return undefined;
  }

  // Keep already-schemed URIs unchanged (https, file, content, ph, data, etc.).
  if (URI_SCHEME_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Expo Contacts on iOS may provide absolute file paths without "file://".
  if (trimmed.startsWith("/")) {
    return `file://${trimmed}`;
  }

  return trimmed;
};
