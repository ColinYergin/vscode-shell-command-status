import * as vscode from 'vscode';
import * as child_process from 'child_process';

interface Config {
	shell: string;
	cwd: string;
	listCommand: string;
}

const readNewSettings = (): Config => {
	const config = vscode.workspace.getConfiguration();

	return {
		shell: config.get<string>('shell-command-status.shell', "bash"),
		listCommand: config.get<string>('shell-command-status.listCommand', ""),
		cwd: config.get<string>('shell-command-status.cwd', ''),
	};
};

interface CommandConfig {
	shell: string;
	command: string;
	cwd: string;
}
interface SingleChildProcess extends vscode.Disposable {
	startIfNotRunning: (
		config: CommandConfig,
		onDone: (error: Error | null, stdout: string, stderr: string) => void
	) => boolean;
}
const singleChildProcessRunner = (): SingleChildProcess => {
	let runningProc: child_process.ChildProcess | undefined;
	return {
		dispose: () => runningProc && runningProc.kill(),
		startIfNotRunning: (config: CommandConfig, onDone: (error: Error | null, stdout: string, stderr: string) => void) => {
			if (runningProc) {
				return false;
			}
			runningProc = child_process.execFile(config.shell, ['-c', `${config.command}`], { encoding: 'utf8', cwd: config.cwd }, (...results) => {
				onDone(...results);
				runningProc = undefined;
			});
			return true;
		}
	};
};

const updateLoop = (updateFn: () => void, delayMs: number): vscode.Disposable => {
	let t: NodeJS.Timeout;
	const runUpdateLoop = () => {
		updateFn();
		t = setTimeout(runUpdateLoop, delayMs);
	};
	t = setTimeout(runUpdateLoop, 0);
	return { dispose: () => clearTimeout(t) };
};

interface TreeNode {
	parent: TreeNode | null;
	contents: string;
}

interface SuccessfulCommandResults {
	lines: string[];
}
type CommandResults = SuccessfulCommandResults | undefined;

class TestTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private commandResults: CommandResults = {lines: ['No command run']};

	public refresh(c: CommandResults): any {
		this.commandResults = c;
		this._onDidChangeTreeData.fire(undefined);
	}


	public getTreeItem(element: TreeNode): vscode.TreeItem {
		return {label: element.contents};
	}

	public getChildren(element?: TreeNode): TreeNode[] {
		if (!element) { // Root node
			return ((this.commandResults && this.commandResults.lines) || []).map<TreeNode>(s => ({parent: null, contents: s}));
		}
		return [];
	}

	public getParent(element: TreeNode): TreeNode {
		return element.parent || element;
	}
}

export function activate(context: vscode.ExtensionContext) {
	const treeDataProvider = new TestTreeDataProvider();
	vscode.window.createTreeView('shellCommandStatusView', { treeDataProvider });

	let listProcess = singleChildProcessRunner();
	context.subscriptions.push(listProcess);
	context.subscriptions.push(updateLoop(() => {
		const config = readNewSettings();
		listProcess.startIfNotRunning({...config, command: config.listCommand}, (error, stdout, stderr) => {
			let lines: string[] = [];
			const addText = (t: string) => { lines = lines.concat(t.trim().split('\n')); };
			addText(stdout);
			if (error) {
				addText(`===== Error =====\n${error}`);
			}
			treeDataProvider.refresh({lines});
		});
	}, 500));
	let disposable = vscode.commands.registerCommand('shell-command-status.printSettings', () => {
		const config = readNewSettings();
		vscode.window.showInformationMessage(`Settings are cwd:${config.cwd}, listcmd:${config.listCommand}, shell:${config.shell}`);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
