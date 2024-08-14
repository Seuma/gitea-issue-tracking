# Gitea Issue and Timetracking

This extension is meant to track the time of an gitea issue.

## Features

To be able to list all the issues you need to configure this extension in the Settings.

You need a private access token from the gitea instance you work on.
Also the name of the repo itself is needed and the User or Organization name which of which the repository is form.

## Extension Settings

This extension contributes the following settings:

- `giteaIssueTracker.url`: The url of the Gitea instance. NOTE: Without the company/user, and repository name!.
- `giteaIssueTracker.owner`: The Owner (User or Organization) in which the repoistory is.
- `giteaIssueTracker.repo`: The name of the repository. It's case sensitive!
- `giteaIssueTracker.token`: Your private access token!

## Known Bugs

It is known that **all** issues are displayed. There is no filter as of now.

## Planned features

In the future it should be possible to be abel to close an issue or even open an issue.

More advanced filter for searching through the issues (for the title of an Issue)

## Release Notes

Users appreciate release notes as you update your extension.

## 0.0.5

### Updated

- Readme: Remove lines which where left from template
- Repository Link: Update Repository Link to point to GitHub Repo

---

**Enjoy!**
