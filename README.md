# Shell Command Status README

Have a shell command that you'd like to see the output from all the time? This extension displays the output of any shell command in a tree view, refreshing continuously.

## Features

Specify the shell, working directory, and shell command.

For example if there is an image subfolder under your extension project workspace:

![find example](https://raw.githubusercontent.com/ColinYergin/vscode-shell-command-status/master/src/images/find_example.gif)

## Extension Settings

This extension contributes the following settings:
* `shell-command-status.shell`: Defaults to "bash"
* `shell-command-status.cwd`: The working directory where the command should be run.
* `shell-command-status.listCommand`: The command to run. Each line of this command's output will be shown as an item in a tree view.

## Known Issues

* Specifying escape sequences in the command can only be done from the json settings view.
* Only one command can be specified.
* The frequency with which the command runs is not configurable. (The command is always started 0.5 seconds after the last run ends.)

## Release Notes

### 1.0.0

Initial release of shell-command-status
