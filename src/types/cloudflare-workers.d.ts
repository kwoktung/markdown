// Cloudflare Workers extends CacheStorage with a `default` property
// that is not part of the standard DOM typings.
interface CacheStorage {
  readonly default: Cache;
}
