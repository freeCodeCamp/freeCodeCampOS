export type F<A, R> = (arg: A) => R;

export enum Events {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  TOGGLE_LOADER_ANIMATION = 'toggle_loader_animation',
  UPDATE_TESTS = 'update_tests',
  UPDATE_TEST = 'update_test',
  UPDATE_DESCRIPTION = 'update_description',
  UPDATE_PROJECT_HEADING = 'update_project_heading',
  UPDATE_PROJECTS = 'update_projects',
  RESET_TESTS = 'reset_tests',
  RUN_TESTS = 'run_tests',
  RESET_PROJECT = 'reset_project',
  REQUEST_DATA = 'request_data',
  GO_TO_NEXT_LESSON = 'go_to_next_lesson',
  GO_TO_PREVIOUS_LESSON = 'go_to_previous_lesson',
  SELECT_PROJECT = 'select_project',
  CANCEL_TESTS = 'cancel_tests',
  CHANGE_LANGUAGE = 'change_language'
}

export type TestType = {
  test_text: string;
  passed: boolean;
  is_loading: boolean;
  test_id: string;
  feedback?: string;
};

export type LoaderT = {
  is_loading: boolean;
  progress: {
    total: number;
    count: number;
  };
};

export interface ProjectI {
  id: string;
  order: number;
  title: string;
  description: string;
  is_integrated: boolean;
  is_public: boolean;
  current_lesson: number;
  number_of_lessons: number;
  is_reset_enabled?: boolean;
  completed_date: null | number;
  tags: string[];
}

export type ConsoleError = {
  error: string;
} & TestType;

export type FreeCodeCampConfigI = {
  [key: string]: any;
};
