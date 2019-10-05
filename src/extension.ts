import * as vscode from 'vscode';

interface Config {
	shell: string;
	cwd: string;
	listCommand: string;
}

const readNewSettings = (): Config => {
	const config = vscode.workspace.getConfiguration();
	console.log(`Updated Settings`);

	return {
		shell: config.get<string>('shell-command-status.shell', "bash"),
		listCommand: config.get<string>('shell-command-status.listCommand', ""),
		cwd: config.get<string>('shell-command-status.cwd', ''),
	};
};

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "shell-command-status" is now active!');

	let disposable = vscode.commands.registerCommand('shell-command-status.printSettings', () => {
		const config = readNewSettings();
		vscode.window.showInformationMessage(`Settings are cwd:${config.cwd}, listcmd:${config.listCommand}, shell:${config.shell}`);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
