# Gitea Issue and Timetracking

This extension is meant to track the time of an gitea issue.

## Features

To be able to list all the issues you need to configure this extension in the Settings.

You need a private access token from the gitea instance you work on.
Also the name of the repo itself is needed and the User or Organization name which of which the repository is form.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `giteaIssueTracker.url`: The url of the Gitea instance. NOTE: Without the company/user, and repository name!.
* `giteaIssueTracker.owner`: The Owner (User or Organization) in which the repoistory is.
* `giteaIssueTracker.repo`: The name of the repository. It's case sensitive!
* `giteaIssueTracker.token`: Your private access token! 

## Known Bugs

It is known that **all** issues are displayed. There is no filter as of now.

## Planned features

In the future it should be possible to be abel to close an issue or even open an issue.

More advanced filter for searching through the issues (for the title of an Issue)


## Release Notes

Users appreciate release notes as you update your extension.

## 0.0.3

### Added

- Paus function
- unpause function
- Filter for self assigned issues
- Button icons

### Fixed

- Improve of code structure

### Changed

- Order of buttons in view
- Naming of gitea repo owner to "owner" (previously named "user")


---

**Enjoy!**
