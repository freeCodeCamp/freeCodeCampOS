export type F<A, R> = (arg: A) => R;

export enum Events {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  TOGGLE_LOADER_ANIMATION = 'toggle-loader-animation',
  UPDATE_TESTS = 'update-tests',
  UPDATE_TEST = 'update-test',
  UPDATE_DESCRIPTION = 'update-description',
  UPDATE_PROJECT_HEADING = 'update-project-heading',
  UPDATE_PROJECTS = 'update-projects',
  UPDATE_STATE = 'update-state',
  RESET_TESTS = 'reset-tests',
  RUN_TESTS = 'run-tests',
  RESET_PROJECT = 'reset-project',
  REQUEST_DATA = 'request-data',
  GO_TO_NEXT_LESSON = 'go-to-next-lesson',
  GO_TO_PREVIOUS_LESSON = 'go-to-previous-lesson',
  SELECT_PROJECT = 'select-project',
  CANCEL_TESTS = 'cancel-tests',
  CHANGE_LANGUAGE = 'change-language'
}

export type TestType = {
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

export interface ProjectI {
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
  projects: Record<ProjectI['dashedName'], ProjectState>;
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
} & TestType;

export type FreeCodeCampConfigI = {
  [key: string]: any;
};
