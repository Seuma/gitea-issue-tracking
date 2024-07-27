import * as vscode from 'vscode';
import axios from 'axios';
import { GiteaIssueItem } from './giteaissueitem';

export class GiteaIssueProvider implements vscode.TreeDataProvider<GiteaIssueItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<GiteaIssueItem | undefined> = new vscode.EventEmitter<GiteaIssueItem | undefined>();
	readonly onDidChangeTreeData?: vscode.Event<GiteaIssueItem | undefined> = this._onDidChangeTreeData.event;
	
	private config = vscode.workspace.getConfiguration('giteaIssueTracker');
	private url: string | undefined = "";
	private token: string | undefined = "";
	private repo: string | undefined = "";
	private owner: string | undefined = "";
	private user: any;

	private issues: GiteaIssueItem[] = [];

	constructor()
	{
		this.url = this.config.get('url');
		this.token = this.config.get('token');
		this.repo = this.config.get('repo');
		this.owner = this.config.get('owner');

		const user = this.fetchUser();

		if (user != null || user != "") {
			this.user = user
		}
		
		this.refresh();
	}

	getTreeItem(element: GiteaIssueItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: GiteaIssueItem): Promise<GiteaIssueItem[]> {
		if (element) {
			return [];
		} else {
			return this.issues;
		}
	}

	private async fetchIssues(withUser = false): Promise<any[]> {
		try {
			
			let url = `${this.url}/api/v1/repos/${this.owner}/${this.repo}/issues`;

			if (withUser) {
				url = url + `?assigned_by=${this.user.login}`;
				vscode.window.showInformationMessage(`login user: ${this.user.login}`)
			}

			const response = await axios.get(url, {
			  headers: {
				'Authorization': `token ${this.token}`
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

	private async fetchUser(): Promise<any> {
		try {
			const response = await axios.get(`${this.url}/api/v1/user`, {
				headers: {
					"Authorization": `token ${this.token}`
				}
			});

			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(`Failed to fetch user: ${error.message}`);
			} else {
				vscode.window.showErrorMessage(`Failed to fetch user: ${JSON.stringify(error)}`);
			}

			return null;
		}
	}

	async refresh(withUser = false): Promise<void> {
		if (withUser) this.user = await this.fetchUser();
		
		const issues = await this.fetchIssues(withUser);
		this.issues = issues.map(issue => new GiteaIssueItem(issue));
		this._onDidChangeTreeData.fire();
	}

	async updateTimeOnIssue(issueItem: GiteaIssueItem, timeSpent: number)
	{
		await axios.post(`${this.url}/api/v1/repos/${this.owner}/${this.repo}/issues/${issueItem.issue.number}/times`, {
			time: timeSpent * 60,
		}, {
			headers: {
				'Authorization': `token ${this.token}`,
				'Content-Type': 'application/json'
			}
		});
	}
}