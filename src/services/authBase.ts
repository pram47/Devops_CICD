const trimTrailingSlash = (input: string): string => input.replace(/\/+$/, "");

export const resolveAuthBaseURL = (): string => {
  const explicitAuthBase = (import.meta.env.VITE_AUTH_BASE_URL ?? "").trim();
  if (explicitAuthBase) {
    return trimTrailingSlash(explicitAuthBase);
  }

  const appBase = (import.meta.env.VITE_APP_BASE_URL ?? "").trim();
  if (appBase) {
    return trimTrailingSlash(appBase);
  }

  return window.location.origin;
};
