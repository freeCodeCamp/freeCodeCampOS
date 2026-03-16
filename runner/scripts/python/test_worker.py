import json
import os
import sys
import subprocess
import importlib.util
from pathlib import Path

TEST_PATH = os.environ['TEST_PATH']
BEFORE_EACH = os.environ.get('BEFORE_EACH', '')
AFTER_EACH = os.environ.get('AFTER_EACH', '')
HELPERS_PATH = os.environ.get('HELPERS_PATH', '')

ROOT = os.getcwd()

PATH_TERMINAL_OUT = os.path.join(ROOT, '.logs/.terminal_out.log')
PATH_BASH_HISTORY = os.path.join(ROOT, '.logs/.bash_history.log')
PATH_CWD = os.path.join(ROOT, '.logs/.cwd.log')
PATH_TEMP = os.path.join(ROOT, '.logs/.temp.log')


def _read_log(path):
    try:
        return Path(path).read_text()
    except FileNotFoundError:
        return ''


def get_bash_history():
    return _read_log(PATH_BASH_HISTORY)


def get_command_output(command, path=''):
    result = subprocess.run(
        command, shell=True, capture_output=True, text=True,
        cwd=os.path.join(ROOT, path)
    )
    return result.stdout, result.stderr


def get_cwd():
    return _read_log(PATH_CWD)


def get_last_command(how_many_back=0):
    logs = [l for l in get_bash_history().split('\n') if l]
    return logs[-(how_many_back + 1)] if logs else ''


def get_last_cwd(how_many_back=0):
    logs = [l for l in get_cwd().split('\n') if l]
    return logs[-(how_many_back + 1)] if logs else ''


def get_temp():
    return _read_log(PATH_TEMP)


def get_terminal_output():
    return _read_log(PATH_TERMINAL_OUT)


# camelCase aliases for consistency with the Node runner
getBashHistory = get_bash_history
getCommandOutput = get_command_output
getCWD = get_cwd
getLastCommand = get_last_command
getLastCWD = get_last_cwd
getTemp = get_temp
getTerminalOutput = get_terminal_output

# Load helpers module if provided
__helpers = None
if HELPERS_PATH:
    try:
        spec = importlib.util.spec_from_file_location('helpers', HELPERS_PATH)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        __helpers = mod
    except Exception as e:
        print(f'Failed to load helpers from {HELPERS_PATH}: {e}', file=sys.stderr)

_globals = {
    '__builtins__': __builtins__,
    'ROOT': ROOT,
    '__helpers': __helpers,
    'get_bash_history': get_bash_history,
    'getBashHistory': getBashHistory,
    'get_command_output': get_command_output,
    'getCommandOutput': getCommandOutput,
    'get_cwd': get_cwd,
    'getCWD': getCWD,
    'get_last_command': get_last_command,
    'getLastCommand': getLastCommand,
    'get_last_cwd': get_last_cwd,
    'getLastCWD': getLastCWD,
    'get_temp': get_temp,
    'getTemp': getTemp,
    'get_terminal_output': get_terminal_output,
    'getTerminalOutput': getTerminalOutput,
}

test = json.loads(Path(TEST_PATH).read_text())
passed = False
error = None

try:
    full_code = f"{BEFORE_EACH}\n{test['code']}"
    exec(full_code, _globals)
    passed = True
except AssertionError as e:
    error = {
        'message': str(e) if str(e) else 'Assertion failed',
        'type': 'AssertionError',
    }
except Exception as e:
    error = {
        'message': str(e),
        'type': type(e).__name__,
    }

test['state'] = 'PASSED' if passed else 'FAILED'
if error:
    test['error'] = error

if AFTER_EACH:
    try:
        exec(AFTER_EACH, _globals)
    except Exception as e:
        print(f'--after-each-- hook failed: {e}', file=sys.stderr)

Path(TEST_PATH).write_text(json.dumps(test))
