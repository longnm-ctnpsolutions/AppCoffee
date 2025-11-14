export const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty is valid
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidClientName = (name: string): boolean => {
  if (!name.trim()) return false;
  const validPattern = /^[a-zA-Z0-9 ]*$/;
  return validPattern.test(name);
};