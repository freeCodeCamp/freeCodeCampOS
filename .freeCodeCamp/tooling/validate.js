import { join } from 'path';
import { readdir, access, constants, readFile } from 'fs/promises';
import { freeCodeCampConfig, getProjectConfig, ROOT } from './env.js';
import { logover } from './logger.js';
import { pluginEvents } from '../plugin/index.js';

const CURRICULUM_PATH = join(
  ROOT,
  freeCodeCampConfig.curriculum.locales.english
);
const CONFIG_PATH = join(ROOT, freeCodeCampConfig.config['projects.json']);

/**
 * # Validate Curriculum
 *
 * The validation throws when it encounters something that could break the functionality of the server,
 * and logs a warning for anti-patterns that do not cause panics.
 *
 * ## Errors
 *
 * ### Projects
 *
 * - Each project has an H1 heading
 * - Each project has a project description
 * - Each project is associated with a boilerplate
 * - Each project has congruent lesson numbers
 *   - First lesson is 0
 * - Each project ends in `--fcc-end--`
 *
 * ### Configs
 *
 * - All configs have `dashedName` and `id` fields
 * - All configs have a matching project by the `dashedName` field
 * - Any `currentLesson` field is >= 0
 * - Any `currentLesson` field is < the number of lessons in the project
 * - Any `isIntegrated` field is a boolean
 * - Any `isPublic` field is a boolean
 * - Any `runTestsOnWatch` field is a boolean
 * - Any `isResetEnabled` field is a boolean
 * - Any `seedEveryLesson` field is a boolean
 * - Any `blockingTests` field is a boolean
 * - Any `breakOnFailure` filed is a boolean
 *
 * ### Seeds
 *
 * - All seed lesson numbers are >= 0
 *
 * ## Warnings
 *
 * ### Projects
 *
 * - Each project lesson has a `--description--` heading
 *   - Each description is not empty
 * - Each project lesson has a `--tests--` heading
 *   - Each project lesson tests section is not empty
 *
 * ### Configs
 *
 * - Each config has a `description` field
 * - Each config has a `title` field
 * - If `breakOnFailure` is true, `blockingTests` is also true
 *
 * ### Seeds
 *
 * - Seed already exists in lesson
 * - No seed lesson number is greater than the number of lessons in the project - 1
 * - Lesson numbers are ordered
 */
export async function validateCurriculum() {
  const { version, config, curriculum } = freeCodeCampConfig;
  if (!isSemver(version)) {
    panic(
      'Invalid `version` field in `freecodecamp.conf.json`',
      version,
      '`version` should be a semver string`'
    );
  }
  if (!config?.['projects.json']) {
    panic(
      'Invalid `config["projects.json"]` field in `freecodecamp.conf.json`',
      config['projects.json'],
      '`projects.json` should be a string'
    );
  }
  if (!config?.['state.json']) {
    panic(
      'Invalid `config["state.json"]` field in `freecodecamp.conf.json`',
      config['state.json'],
      '`state.json` should be a string'
    );
  }
  if (!curriculum?.['locales']) {
    panic(
      'Invalid `curriculum["locales"]` field in `freecodecamp.conf.json`',
      curriculum['locales'],
      '`locales` should be an object'
    );
  }
  if (!curriculum?.['locales']?.english) {
    panic(
      'Invalid `curriculum["locales"]["english"]` field in `freecodecamp.conf.json`',
      curriculum['locales']['english'],
      '`english` is required, and should be a string'
    );
  }

  const { port, client, hotReload, tooling } = freeCodeCampConfig;
  // `port` must be a u16
  if (
    port &&
    (typeof port !== 'number' || port < 0 || port > 65535 || port % 1 !== 0)
  ) {
    panic(
      'Invalid `port` field in `freecodecamp.conf.json`',
      port,
      '`port` should be a u16'
    );
  }
  if (client) {
    const { assets, landing, static: stat } = client;
    if (assets) {
      const { header, favicon } = assets;
      if (header && typeof header !== 'string') {
        panic(
          'Invalid `client.assets.header` field in `freecodecamp.conf.json`',
          header,
          '`header` should be a string'
        );
      }
      if (favicon && typeof favicon !== 'string') {
        panic(
          'Invalid `client.assets.favicon` field in `freecodecamp.conf.json`',
          favicon,
          '`favicon` should be a string'
        );
      }
    }
    if (landing) {
      for (const [key, value] of Object.entries(landing)) {
        const { title, description, 'faq-link': link, 'faq-text': faq } = value;
        if (title && typeof title !== 'string') {
          panic(
            `Invalid \`client.landing.${key}.title\` field in \`freecodecamp.conf.json\``,
            title,
            `\`title\` should be a string`
          );
        }
        if (description && typeof description !== 'string') {
          panic(
            `Invalid \`client.landing.${key}.description\` field in \`freecodecamp.conf.json\``,
            description,
            `\`description\` should be a string`
          );
        }
        if (link && typeof link !== 'string') {
          panic(
            `Invalid \`client.landing.${key}['faq-link']\` field in \`freecodecamp.conf.json\``,
            link,
            `\`faq-link\` should be a string`
          );
        }
        if (faq && typeof faq !== 'string') {
          panic(
            `Invalid \`client.landing.${key}['faq-text']\` field in \`freecodecamp.conf.json\``,
            faq,
            `\`faq-text\` should be a string`
          );
        }
      }
    }
    if (stat) {
      if (typeof stat === 'string') {
        if (typeof stat !== 'string') {
          panic(
            'Invalid `client.static` field in `freecodecamp.conf.json`',
            stat,
            '`static` should be a string or object'
          );
        }
      } else if (typeof stat === 'object') {
        for (const [route, dir] of Object.entries(stat)) {
          if (typeof dir !== 'string') {
            panic(
              `Invalid \`client.static[${route}]\` field in \`freecodecamp.conf.json\``,
              dir,
              `static directory should be a string`
            );
          }
        }
      }
    }
  }

  if (hotReload) {
    const { ignore } = hotReload;
    if (ignore) {
      if (Array.isArray(hotReload.ignore)) {
        for (const ignore of hotReload.ignore) {
          if (typeof ignore !== 'string') {
            panic(
              'Invalid `hotReload.ignore` field in `freecodecamp.conf.json`',
              ignore,
              '`ignore` should be an array of strings'
            );
          }
        }
      } else {
        panic(
          'Invalid `hotReload.ignore` field in `freecodecamp.conf.json`',
          hotReload.ignore,
          '`ignore` should be an array of strings'
        );
      }
    }
  }

  if (tooling) {
    const { helpers, plugins } = tooling;
    if (helpers && typeof helpers !== 'string') {
      panic(
        'Invalid `tooling.helpers` field in `freecodecamp.conf.json`',
        helpers,
        '`helpers` should be a string'
      );
    }
    if (plugins && typeof plugins !== 'string') {
      panic(
        'Invalid `tooling.plugins` field in `freecodecamp.conf.json`',
        plugins,
        '`plugins` should be a string'
      );
    }
  }

  const projects = JSON.parse(
    await readFile(
      join(ROOT, freeCodeCampConfig.config['projects.json']),
      'utf-8'
    )
  );
  for (const projectConfig of projects) {
    const { dashedName, id } = projectConfig;
    if (!dashedName) {
      panic(
        'Invalid `dashedName` field in `projects.json`',
        dashedName,
        '`dashedName` is required'
      );
    }
    if (
      typeof port !== 'number' ||
      port < 0 ||
      port > 65535 ||
      port % 1 !== 0
    ) {
      panic('Invalid `id` field in `projects.json`', id, '`id` is required');
    }
    const projectPath = join(ROOT, dashedName);
    try {
      await access(projectPath, constants.F_OK);
    } catch (e) {
      panic(
        `Project ${dashedName} does not have a directory in the workspace root`,
        projectPath,
        `Project should have a matching directory in the workspace root`
      );
    }

    const {
      isIntegrated,
      isPublic,
      runTestsOnWatch,
      isResetEnabled,
      seedEveryLesson,
      blockingTests,
      breakOnFailure
    } = projectConfig;
    if (!undeBoolNull(isIntegrated)) {
      panic(
        'Invalid `isIntegrated` field in `projects.json`',
        isIntegrated,
        '`isIntegrated` should be a boolean'
      );
    }
    if (!undeBoolNull(isPublic)) {
      panic(
        'Invalid `isPublic` field in `projects.json`',
        isPublic,
        '`isPublic` should be a boolean'
      );
    }
    if (!undeBoolNull(runTestsOnWatch)) {
      panic(
        'Invalid `runTestsOnWatch` field in `projects.json`',
        runTestsOnWatch,
        '`runTestsOnWatch` should be a boolean'
      );
    }
    if (!undeBoolNull(isResetEnabled)) {
      panic(
        'Invalid `isResetEnabled` field in `projects.json`',
        isResetEnabled,
        '`isResetEnabled` should be a boolean'
      );
    }
    if (!undeBoolNull(seedEveryLesson)) {
      panic(
        'Invalid `seedEveryLesson` field in `projects.json`',
        seedEveryLesson,
        '`seedEveryLesson` should be a boolean'
      );
    }
    if (!undeBoolNull(blockingTests)) {
      panic(
        'Invalid `blockingTests` field in `projects.json`',
        blockingTests,
        '`blockingTests` should be a boolean'
      );
    }
    if (!undeBoolNull(breakOnFailure)) {
      panic(
        'Invalid `breakOnFailure` field in `projects.json`',
        breakOnFailure,
        '`breakOnFailure` should be a boolean'
      );
    }

    const projectMeta = await pluginEvents.getProjectMeta(dashedName);
    const { title, description, tags = [], numberOfLessons } = projectMeta;
    if (!title || typeof title !== 'string') {
      panic(
        'Invalid `title` field in `projects.json`',
        title,
        '`title` is required'
      );
    }
    if (!description || typeof description !== 'string') {
      panic(
        'Invalid `description` field in `projects.json`',
        description,
        '`description` is required'
      );
    }
    if (tags.length) {
      for (const tag of tags) {
        if (typeof tag !== 'string') {
          panic(
            'Invalid `tags` field in `projects.json`',
            tag,
            '`tags` should be an array of strings'
          );
        }
      }
    }
    if (numberOfLessons < 1) {
      panic(
        'Invalid `numberOfLessons` field in `projects.json`',
        numberOfLessons,
        '`numberOfLessons` should be a positive integer'
      );
    }

    for (let i = 0; i < numberOfLessons; i++) {
      const lesson = await pluginEvents.getLesson(dashedName, i);
      const {
        description,
        tests,
        hints,
        seed,
        beforeAll,
        afterAll,
        beforeEach,
        afterEach,
        isForce,
        meta
      } = lesson;
      if (!description) {
        warn(
          `Missing \`--description--\` heading in lesson ${i} of ${dashedName}`,
          description,
          'Lesson description should not be empty'
        );
      }
      if (!tests.length) {
        warn(
          `Missing \`--tests--\` heading in lesson ${i} of ${dashedName}`,
          tests,
          'Lesson tests should not be empty'
        );
      } else {
        for (const test of tests) {
          const { text, code, runner } = test;

          if (typeof text !== 'string') {
            panic(
              `Invalid test text in lesson ${i} of ${dashedName}`,
              text,
              'Test text should be a string'
            );
          }
          if (typeof code !== 'string') {
            panic(
              `Invalid test in lesson ${i} of ${dashedName}`,
              code,
              'Test should be a string'
            );
          }

          if (runner && typeof runner !== 'string') {
            panic(
              `Invalid runner in lesson ${i} of ${dashedName}`,
              runner,
              'Runner should be a string'
            );
          }
        }
      }
      if (seed) {
        if (Array.isArray(seed)) {
          for (const s of seed) {
            if (
              typeof s !== 'string' &&
              typeof s.filePath !== 'string' &&
              typeof s.fileSeed !== 'string'
            ) {
              panic(
                `Invalid seed in lesson ${i} of ${dashedName}`,
                s,
                'Seed should be a string or an object with `filePath` and `fileSeed`'
              );
            }
          }
        } else {
          panic(
            `Invalid seed in lesson ${i} of ${dashedName}`,
            seed,
            'Seed should be a an array of strings'
          );
        }
      }
      if (!undeBoolNull(isForce)) {
        panic(
          `Invalid isForce in lesson ${i} of ${dashedName}`,
          isForce,
          'isForce should be a boolean'
        );
      }
      if (hints) {
        if (Array.isArray(hints)) {
          for (const hint of hints) {
            if (typeof hint !== 'string') {
              panic(
                `Invalid hint in lesson ${i} of ${dashedName}`,
                hint,
                'Hint should be a string'
              );
            }
          }
        } else {
          panic(
            `Invalid hints in lesson ${i} of ${dashedName}`,
            hints,
            'Hints should be an array of strings'
          );
        }
      }
      if (beforeAll) {
        const { runner, code } = beforeAll;
        if (typeof runner !== 'string') {
          panic(
            `Invalid beforeAll in lesson ${i} of ${dashedName}`,
            runner,
            'Runner should be a string'
          );
        }
        if (typeof code !== 'string') {
          panic(
            `Invalid beforeAll in lesson ${i} of ${dashedName}`,
            code,
            'Code should be a string'
          );
        }
      }
      if (afterAll) {
        const { runner, code } = afterAll;
        if (typeof runner !== 'string') {
          panic(
            `Invalid afterAll in lesson ${i} of ${dashedName}`,
            runner,
            'Runner should be a string'
          );
        }
        if (typeof code !== 'string') {
          panic(
            `Invalid afterAll in lesson ${i} of ${dashedName}`,
            code,
            'Code should be a string'
          );
        }
      }
      if (beforeEach) {
        const { runner, code } = beforeEach;
        if (typeof runner !== 'string') {
          panic(
            `Invalid beforeEach in lesson ${i} of ${dashedName}`,
            runner,
            'Runner should be a string'
          );
        }
        if (typeof code !== 'string') {
          panic(
            `Invalid beforeEach in lesson ${i} of ${dashedName}`,
            code,
            'Code should be a string'
          );
        }
      }
      if (afterEach) {
        const { runner, code } = afterEach;
        if (typeof runner !== 'string') {
          panic(
            `Invalid afterEach in lesson ${i} of ${dashedName}`,
            runner,
            'Runner should be a string'
          );
        }
        if (typeof code !== 'string') {
          panic(
            `Invalid afterEach in lesson ${i} of ${dashedName}`,
            code,
            'Code should be a string'
          );
        }
      }
      if (meta?.watch && meta?.ignore) {
        panic(
          `Invalid meta in lesson ${i} of ${dashedName}`,
          meta,
          'Lesson should not have both `watch` and `ignore`'
        );
      }
    }
  }

  logover.info('All curriculum files are valid');
}

function undeBoolNull(val) {
  return val === undefined || val === null || typeof val === 'boolean';
}

function isSemver(val) {
  return /^\d+\.\d+\.\d+$/.test(val);
}

function panic(message, value, expectation) {
  logover.error(message);
  console.log('Expected:', expectation);
  console.log('Received:', value);
  throw new Error(message);
}

function warn(message, value, expectation) {
  logover.warn(message);
  console.log('Expected:', expectation);
  console.log('Received:', value);
}
