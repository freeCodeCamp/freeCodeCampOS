export type F<A, R> = (arg: A) => R;

export enum Events {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  TOGGLE_LOADER_ANIMATION = "toggle-loader-animation",
  UPDATE_TESTS = "update-tests",
  UPDATE_TEST = "update-test",
  UPDATE_DESCRIPTION = "update-description",
  UPDATE_PROJECT_HEADING = "update-project-heading",
  UPDATE_PROJECTS = "update-projects",
  UPDATE_STATE = "update-state",
  RESET_TESTS = "reset-tests",
  RUN_TESTS = "run-tests",
  RESET_PROJECT = "reset-project",
  REQUEST_DATA = "request-data",
  GO_TO_NEXT_LESSON = "go-to-next-lesson",
  GO_TO_PREVIOUS_LESSON = "go-to-previous-lesson",
  SELECT_PROJECT = "select-project",
  CANCEL_TESTS = "cancel-tests",
  CHANGE_LANGUAGE = "change-language",
}

export type TestState = {
  testText: string;
  passed: boolean;
  isLoading: boolean;
  testId: number;
};

export type LoaderT = {
  isLoading: boolean;
  progress: {
    total: number;
    count: number;
  };
};

export type Project = {
  lessons: Lesson[];
} & ProjectConfig;

export type Lesson = {
  afterAll?: string;
  afterEach?: string;
  beforeAll?: string;
  beforeEach?: string;
  description: string;
  hints: string[];
  tests: Test[];
  seed: Seed[];
  meta?: LessonMeta;
};

export type Seed =
  | {
      filePath: string;
      fileSeed: string;
    }
  | string;

export type LessonMeta = {
  watch?: string[];
  ignore?: string[];
  force?: boolean;
};

export type Test = [string, string];

export interface ProjectConfig {
  id: number;
  title: string;
  description: string;
  dashedName: string;
  isIntegrated: boolean;
  isPublic: boolean;
  numberOfLessons: number;
  isResetEnabled?: boolean;
  tags: string[];
  runTestsOnWatch: boolean;
  seedEveryLesson: boolean;
  blockingTests: boolean;
  breakOnFailure: boolean;
  lastKnownLessonWithHash: number;
  testPollingRate: number;
  useGitBuildOnProduction: boolean; // TODO: Necessary?
}

export interface State {
  currentProject: number;
  locale: string;
  lastSeed: LastSeed;
  lastWatchChange: number;
  projects: Record<ProjectConfig["dashedName"], ProjectState>;
}

export interface LastSeed {
  projectDashedName: string | null;
  lessonNumber: number;
}

export interface ProjectState {
  currentLesson: number;
  completedDate: number | null;
}

export type ConsoleError = {
  error: string;
} & TestState;

export type FreeCodeCampConfig = {
  version: string;
  port: number;
  client: Client;
  config: Config;
  curriculum: Curriculum;
  hotReload: HotReload;
  tooling: Tooling;
};

export type Client = {
  assets: Assets;
  landing: Landing;
  static?: Static;
};

export type Assets = {
  header: string;
  favicon: string;
};

export type Static = Record<string, string>;

export type Landing = Record<string, LandingMeta>;

export type LandingMeta = {
  title: string;
  description: string;
  "faq-link": string;
  "faq-text": string;
};

export type Config = {
  "state.json": string;
};

export type Curriculum = {
  locales: Record<string, string>;
  assertions: Record<string, string>;
};

export type HotReload = {
  ignore: string[];
};

export type Tooling = {
  helpers: string;
  plugins: string;
};
