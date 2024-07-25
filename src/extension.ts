// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

let activeIssue: any = null;
let timer: NodeJS.Timeout | null = null;
let timeSpent = 0;

function updateTimerContext(isRunning: boolean) {
	vscode.commands.executeCommand('setContext', 'timerRunning', isRunning);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const giteaIssuesProvider = new GiteaIssueProvider();

	vscode.window.createTreeView('giteaIssues', {
		treeDataProvider: giteaIssuesProvider
	});

	const setGiteaActiveIssueCommand = vscode.commands.registerCommand('extension.setGiteaActiveIssue', (issue) => {
		if (timer) {
			vscode.window.showErrorMessage('Timer is active! Please stop the timer before changing issue!');
			return;
		}

		activeIssue = issue;
		let test = issue.issue.title;
		vscode.window.showInformationMessage(`Active issue set to: ${issue.issue.title}`);
	});

	const startGiteaTimerCommand = vscode.commands.registerCommand('extension.startGiteaTimer', () => {
		if (!activeIssue) {
			vscode.window.showErrorMessage('No active issue set!');
			return;
		}

		if (timer) {
			vscode.window.showErrorMessage('Timer already running!');
			return;
		}
		
		vscode.window.setStatusBarMessage(`Time spent on issue ${activeIssue.issue.title}: ${timeSpent} minutes`);

		timer = setInterval(() => {
			timeSpent++;
			vscode.window.setStatusBarMessage(`Time spent on issue ${activeIssue.issue.title}: ${timeSpent} minutes`);
		}, 60000);
		updateTimerContext(true);
	});

	const stopGiteaTimerCommand = vscode.commands.registerCommand('extension.stopGiteaTimer', async () => {
		if (!timer) {
			vscode.window.showErrorMessage('No timer running!');
			return;
		}

		clearInterval(timer);
		timer = null;
		vscode.window.setStatusBarMessage(`Time stopped at: ${timeSpent} minutes`);

		if (activeIssue)
		{
			try {
				const config = vscode.workspace.getConfiguration('giteaIssueTracker');
				const url = config.get('url');
				const token = config.get('token');
				const repo = config.get('repo');
				const user = config.get('user');

				if (timeSpent <= 0)
				{
					vscode.window.showErrorMessage('Not enought time spent on this issue! Aborting time tracking...')
					timeSpent = 0;
					updateTimerContext(false);
					return;
				}

				await axios.post(`${url}/api/v1/repos/${user}/${repo}/issues/${activeIssue.issue.number}/times`, {
					time: timeSpent * 60,
				}, {
					headers: {
						'Authorization': `token ${token}`,
            			'Content-Type': 'application/json'
					}
				});
				vscode.window.showInformationMessage(`Time logged for issue: ${activeIssue.issue.title}`);
			} catch (error) {
				if (error instanceof Error) {
					vscode.window.showErrorMessage(`Failed to log time: ${error.message}`);
				} else {
					vscode.window.showErrorMessage(`Failed to log time: ${JSON.stringify(error)}`);
				}
			}
		}

		timeSpent = 0;
		updateTimerContext(false);
	});

	const reloadGiteaIssuesCommand = vscode.commands.registerCommand('extension.reloadGiteaIssues', () => {
		giteaIssuesProvider
	})

	context.subscriptions.push(setGiteaActiveIssueCommand, startGiteaTimerCommand, stopGiteaTimerCommand, reloadGiteaIssuesCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}



class GiteaIssueProvider implements vscode.TreeDataProvider<IssueItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined> = new vscode.EventEmitter<IssueItem | undefined>();
	readonly onDidChangeTreeData?: vscode.Event<IssueItem | undefined> = this._onDidChangeTreeData.event;

	private issues: IssueItem[] = [];

	constructor()
	{
		this.refresh();
	}

	getTreeItem(element: IssueItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: IssueItem): Promise<IssueItem[]> {
		if (element) {
			return [];
		} else {
			return this.issues;
		}
	}

	private async fetchIssues(): Promise<any[]> {
		try {
			const config = vscode.workspace.getConfiguration('giteaIssueTracker');
			const url = config.get('url');
			const token = config.get('token');
			const repo = config.get('repo');
			const user = config.get('user');
			
			//vscode.window.showInformationMessage(`${url}/api/v1/repos/${user}/${repo}/issues`);

			const response = await axios.get(`${url}/api/v1/repos/${user}/${repo}/issues`, {
			  headers: {
				'Authorization': `token ${token}`
			  }
			});
			return response.data;
		  } catch (error) {
			if (error instanceof Error) {
			  vscode.window.showErrorMessage(`Failed to fetch issues: ${error.message}`);
			} else {
			  vscode.window.showErrorMessage(`Failed to fetch issues: ${JSON.stringify(error)}`);
			}
			return [];
		  }
	}

	async refresh(): Promise<void> {
		const issues = await this.fetchIssues();
		this.issues = issues.map(issue => new IssueItem(issue));
		this._onDidChangeTreeData.fire();
	}
}


class IssueItem extends vscode.TreeItem
{
	constructor(public readonly issue: any)
	{
		super(issue.title, vscode.TreeItemCollapsibleState.None);
		this.contextValue = 'issue';
	}
}
