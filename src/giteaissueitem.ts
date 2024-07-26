import * as vscode from 'vscode';

export class GiteaIssueItem extends vscode.TreeItem
{
	constructor(public readonly issue: any)
	{
		super(issue.title, vscode.TreeItemCollapsibleState.None);
		this.contextValue = 'issue';
	}
}