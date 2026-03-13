import json
import os
import sys
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

MANIFEST_PATH = os.environ['MANIFEST_PATH']
TEST_WORKER_PATH = os.environ['TEST_WORKER_PATH']

ROOT = os.getcwd()


def run_test(test_path, hooks, helpers_path):
    env = {**os.environ, 'TEST_PATH': test_path}
    if hooks.get('before_each'):
        env['BEFORE_EACH'] = hooks['before_each']
    if hooks.get('after_each'):
        env['AFTER_EACH'] = hooks['after_each']
    if helpers_path:
        env['HELPERS_PATH'] = helpers_path
    proc = subprocess.run(['python3', TEST_WORKER_PATH], env=env)
    return proc.returncode


def main():
    manifest = json.loads(Path(MANIFEST_PATH).read_text())
    project = json.loads(Path(manifest['project_path']).read_text())
    hooks = json.loads(Path(manifest['hooks_path']).read_text())
    helpers_path = manifest.get('helpers_path')

    if hooks.get('before_all'):
        try:
            exec(hooks['before_all'], {'ROOT': ROOT})
        except Exception as e:
            print(f'--before-all-- hook failed: {e}', file=sys.stderr)

    for test_path in manifest['test_paths']:
        test = json.loads(Path(test_path).read_text())
        test['path'] = test_path
        Path(test_path).write_text(json.dumps(test))

    if project.get('blocking_tests'):
        for test_path in manifest['test_paths']:
            run_test(test_path, hooks, helpers_path)
    else:
        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(run_test, tp, hooks, helpers_path)
                for tp in manifest['test_paths']
            ]
            for f in as_completed(futures):
                f.result()

    if hooks.get('after_all'):
        try:
            exec(hooks['after_all'], {'ROOT': ROOT})
        except Exception as e:
            print(f'--after-all-- hook failed: {e}', file=sys.stderr)

    print('Runner finished successfully')


main()
