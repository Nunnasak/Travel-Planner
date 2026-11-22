export interface UrlResolver {
  follow(url: string, isAllowed: (url: URL) => boolean): Promise<string>;
}
