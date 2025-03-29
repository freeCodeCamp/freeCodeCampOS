import sys

def handle_error(e, id):
    print('{{ "error": "{}", "id": {} }}'.format(e, id), file=sys.stderr)

try:
    # --runner-start-before_all--
    # --runner-end-before_all--
    #
    # --runner-start-test_functions--
    # --runner-end-test_functions--
    #
    # --runner-start-tests--
    # --runner-end-tests--
    #
    # --runner-start-tests-break_on_failure--
    # --runner-end-tests-break_on_failure--
    #
    # --runner-start-after_all--
    # --runner-end-after_all--
except:
    handle_error('Error in Python script', "")
