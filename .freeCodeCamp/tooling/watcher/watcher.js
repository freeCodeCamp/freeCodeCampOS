import path from 'path';
import { PATHS_TO_IGNORE } from '../hot-reload.js';
import { ROOT } from '../env.js';

// TODO:
// 1. Ensure all paths start with `ROOT` so comparisions work
// 2. Allow directory paths to optionally end with `/`
// 3. If relative path does not start with `/`, do not prepend `ROOT`
//   - This indicates the path can be anywhere in the tree

// NOTES:
// - `name` is always the full path including `ROOT`
// - `PATHS_TO_IGNORE` should be relative to `ROOT`
//   - Must include the full path to the file/directory wanting to be ignored from `ROOT`

export function unwatchPath(pathRelativeToRoot) {}

export function watchPath(pathRelativeToRoot) {}

/**
 * Add `pathRelativeToRoot` to `PATHS_TO_IGNORE`, if it is not already **equivalently** added
 *
 * **Examples**
 *
 * ```js
 * const PATHS_TO_IGNORE = ["node_modules/"];
 * const pathRelativeToRoot = "/node_modules/foo/bar";
 * maybeAddRelativePathToPTI(pathRelativeToRoot);
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
 * maybeAddRelativePathToPTI(pathRelativeToRoot);
 * console.log(PATHS_TO_IGNORE);
 * // ["/node_modules/", "node_modules/foo/bar"]
 * ```
 *
 * `node_modules/foo/bar` is added, because `/node_modules/` does not encompass all equivalents.
 *
 * @param {string} pathRelativeToRoot
 */
export function maybeAddRelativePathToPTI(pathRelativeToRoot) {
  if (!PATHS_TO_IGNORE.some(p => compareEquivalency(p, pathRelativeToRoot))) {
    // If reverse equivalency exists for any elements already in PATHS_TO_IGNORE, remove less covered path
    PATHS_TO_IGNORE.forEach(p => {
      if (compareEquivalency(pathRelativeToRoot, p)) {
        PATHS_TO_IGNORE.splice(PATHS_TO_IGNORE.indexOf(p), 1);
      }
    });

    PATHS_TO_IGNORE.push(pathRelativeToRoot);
  }
}

/**
 * Compares two paths for equivalency:
 * - If path starts with `/`, prepends `ROOT`, and compares full path equality
 * - Else, compares path as `/path/` string
 * - Allows optional trailing `/`
 * - If one path is a subset of the other, then they are equivalent
 * @param {string} covered_path Path already covered
 * @param {string} compated_path Path to be covered
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
