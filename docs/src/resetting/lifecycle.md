# Lifecycle

Resetting can follow one of two lifecycles:

1. Whole project reset
2. Lesson reset

## Whole Project

A whole project reset is only invoked when the `Reset` button is clicked in the client.

This will run a `git clean` on the project directory - removing all files (tracked and untracked), but resetting them to their last committed state.

Then, the seed of each lesson will be run in order.

## Lesson

A lesson reset only happens when either `seedEveryLesson` is set to `true` in the [project config](../configuration.md#projectsjson), or the [force](../project-syntax.md#--force--) flag is set on a given lessons seed.

This will only run the seed for the current lesson.
