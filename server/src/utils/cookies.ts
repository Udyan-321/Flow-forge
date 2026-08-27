export function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [key, ...value] = cookie.trim().split("=");
      return [key, decodeURIComponent(value.join("="))];
    })
  );
}
