export type F<A, R> = (arg: A) => R;

export type Sock = { event: WSSEvents | WSCEvents; data: any };

export enum WSCEvents {}

export enum WSSEvents {
  CONNECT = "CONNECT",
  UPDATE_TESTS_STATE = "UPDATE_TESTS_STATE",
  UPDATE_TEST_STATE = "UPDATE_TEST_STATE",
  UPDATE_STATE = "UPDATE_STATE",
  UPDATE_CONSOLE = "UPDATE_CONSOLE",
  RESPONSE = "RESPONSE",
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
  currentProject: number | null;
  locale: string;
  lastSeed: LastSeed;
  lastWatchChange: number;
  projects: Record<ProjectConfig["id"], ProjectState>;
}

export interface LastSeed {
  projectId: number | null;
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
