import path from 'path';
import { ROOT, freeCodeCampConfig } from '../env.js';

const defaultPathsToIgnore = [
  '/.logs/.script_out.log',
  '/.logs/.script_in.log',
  '/.logs/.temp.log',
  '/config/',
  'node_modules/',
  '.git/',
  'target/',
  'test-ledger/'
];

/**
 * Paths following the following convention:
 * - If path starts with `/`, it is relative to `ROOT`
 * - Else, path is anywhere in tree
 *
 * **Examples:**
 *
 * - ["/node_modules/"] - ignore only `node_modules` in ROOT
 * - ["node_modules/"] - ignore `node_modules` anywhere in the tree
 *
 * **NOTE:** Globs are NOT supported
 * @type {string[]}
 */
export const PATHS_TO_IGNORE =
  freeCodeCampConfig.hotReload?.ignore || defaultPathsToIgnore;

/**
 * Overrides `PATHS_TO_IGNORE`.
 *
 * Paths following the following convention:
 * - If path starts with `/`, it is relative to `ROOT`
 * - Else, path is anywhere in tree
 *
 * **Examples:**
 *
 * - ["/node_modules/"] - watch only `node_modules` in ROOT
 * - ["node_modules/"] - watch `node_modules` anywhere in the tree
 *
 * **NOTE:** Globs are NOT supported
 * @type {string[]}
 */
export const PATHS_TO_WATCH = [];

// TODO:
// 1. Ensure all paths start with `ROOT` so comparisions work
// 2. Allow directory paths to optionally end with `/`
// 3. If relative path does not start with `/`, do not prepend `ROOT`
//   - This indicates the path can be anywhere in the tree

// NOTES:
// - `name` is always the full path including `ROOT`
// - `PATHS_TO_IGNORE` should be relative to `ROOT`
//   - Must include the full path to the file/directory wanting to be ignored from `ROOT`

/**
 *
 * @param {string} pathRelativeToRoot
 */
export function unwatchPath(pathRelativeToRoot) {
  maybeAddRelativePath(PATHS_TO_IGNORE, pathRelativeToRoot);
}

/**
 *
 * @param {string} pathRelativeToRoot
 */
export function watchPath(pathRelativeToRoot) {
  maybeAddRelativePath(PATHS_TO_WATCH, pathRelativeToRoot);
}

/**
 * Add `pathRelativeToRoot` to `list`, if it is not already **equivalently** added
 *
 * **Examples**
 *
 * ```js
 * const PATHS_TO_IGNORE = ["node_modules/"];
 * const pathRelativeToRoot = "/node_modules/foo/bar";
 * maybeAddRelativePath(PATHS_TO_IGNORE,pathRelativeToRoot);
 * console.log(PATHS_TO_IGNORE);
 * // ["node_modules/"]
 * ```
 * `PATHS_TO_IGNORE` is still `["node_modules/"]`, because `/node_modules/foo/bar` is equivalently added.
 *
 * ---
 *
 * ```js
 * const PATHS_TO_IGNORE = ["/node_modules/"];
 * const pathRelativeToRoot = "node_modules/foo/bar";
 * maybeAddRelativePath(PATHS_TO_IGNORE,pathRelativeToRoot);
 * console.log(PATHS_TO_IGNORE);
 * // ["/node_modules/", "node_modules/foo/bar"]
 * ```
 *
 * `node_modules/foo/bar` is added, because `/node_modules/` does not encompass all equivalents.
 *
 * @param {string[]} list
 * @param {string} pathRelativeToRoot
 */
export function maybeAddRelativePath(list, pathRelativeToRoot) {
  if (!list.some(p => compareEquivalency(p, pathRelativeToRoot))) {
    // If reverse equivalency exists for any elements already in PATHS_TO_IGNORE, remove less covered path
    list.forEach(p => {
      if (compareEquivalency(pathRelativeToRoot, p)) {
        list.splice(list.indexOf(p), 1);
      }
    });

    list.push(pathRelativeToRoot);
  }
}

/**
 * Compares two paths for equivalency:
 * - If path starts with `/`, prepends `ROOT`, and compares full path equality
 * - Else, compares path as `/path/` string
 * - Allows optional trailing `/`
 * - If one path is a subset of the other, then they are equivalent
 * @param {string} covered_path Path already covered
 * @param {string} compared_path Path to be covered
 * @returns {boolean} If `covered_path` accounts for `compared_path`
 */
export function compareEquivalency(covered_path, compared_path) {
  const is_absolute_covered_path = path.isAbsolute(covered_path);
  const is_absolute_compared_path = path.isAbsolute(compared_path);

  let path_covered = is_absolute_covered_path
    ? path.join(ROOT, covered_path)
    : covered_path;
  let path_compared = is_absolute_compared_path
    ? path.join(ROOT, compared_path)
    : compared_path;

  // Append trailing `/` if not present
  if (!path_covered.endsWith('/')) {
    path_covered += '/';
  }
  if (!path_compared.endsWith('/')) {
    path_compared += '/';
  }

  return path_compared.includes(path_covered);
}

/**
 *
 * @param {string[]} list
 * @param {string} compared_path
 * @returns {boolean}
 */
export function pathIsIn(list, compared_path) {
  return list.some(p => compareEquivalency(p, compared_path));
}

/**
 *
 * @param {string} absolutePath
 * @returns {boolean}
 */
export function shouldWatch(absolutePath) {
  if (pathIsIn(PATHS_TO_WATCH, absolutePath)) {
    return true;
  }

  if (pathIsIn(PATHS_TO_IGNORE, absolutePath)) {
    return false;
  }

  return true;
}

export function resetPathLists() {
  const initial_paths_to_ignore =
    freeCodeCampConfig.hotReload?.ignore || defaultPathsToIgnore;
  PATHS_TO_IGNORE.splice(0, PATHS_TO_IGNORE.length, ...initial_paths_to_ignore);
  PATHS_TO_WATCH.splice(0, PATHS_TO_WATCH.length);
}
