// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { GiteaIssueProvider } from './giteaissueprovider'

let activeIssue: any = null;
let timer: NodeJS.Timeout | null = null;
let timeSpent = 0;
let asAssigned: boolean = false;

function updateTimerContext(isRunning: boolean) {
	vscode.commands.executeCommand('setContext', 'timerRunning', isRunning);
}

function updateAssignedContext(asAssigned: boolean) {
	vscode.commands.executeCommand('setContext', 'showAssigned', asAssigned);
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
				if (timeSpent <= 0)
				{
					vscode.window.showErrorMessage('Not enought time spent on this issue! Aborting time tracking...')
					timeSpent = 0;
					updateTimerContext(false);
					return;
				}
				
				await giteaIssuesProvider.updateTimeOnIssue(activeIssue, timeSpent);
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

	const setGiteaAssignedStatus = vscode.commands.registerCommand('extension.setGiteaAssignedFilter', () => {
		updateAssignedContext(true);
		asAssigned = true;
		giteaIssuesProvider.refresh(true);
	});

	const setGiteaUnassingedStatus = vscode.commands.registerCommand('extension.setGiteaUnassignedFilter', () => {
		updateAssignedContext(false);
		asAssigned = false;
		giteaIssuesProvider.refresh();
	})

	const reloadGiteaIssuesCommand = vscode.commands.registerCommand('extension.reloadGiteaIssues', () => {
		giteaIssuesProvider.refresh(asAssigned);
	})

	context.subscriptions.push(
		setGiteaActiveIssueCommand,
		startGiteaTimerCommand,
		stopGiteaTimerCommand,
		reloadGiteaIssuesCommand,
		setGiteaAssignedStatus,
		setGiteaUnassingedStatus
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
