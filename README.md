# test-plan-action
Manage you test plans with an automated project board

Everytime you need to go through a validation phase, all your test cases will be loaded as issues and added to a project board. You can then track progress by moving the issue through columns, assign them to testers and close them when the test case is validated. 

### Create tests
Each test will be described in its own markdown file using the [Front Matter](https://jekyllrb.com/docs/front-matter/) syntax. Fields in the Front Matter section (between the `---`) are: 

- `title`: the title of the issue
- `labels`: a comma separated list of labels that will be added to the issue
- `assignees`: a comma separated list of handles of users who will be assigned this issue 

The rest of the file will be the body of the issue. 

```markdown
---
title: "Login"
labels: manual test, needs triage
assignees: helaili
---

**Describe the test**
A clear and concise description of what the test is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Status of the test**
- [ ] Reviewed
- [ ] Approved

```

### Configure the test plan

Create a YAML config file with the following data: 

`name`: The name of the project board that will be created
`folder`: Relative path from the root of the repository where the test files are located 
`columns`: List of the columns of the project board. Issues will be created in the first column 

```yaml
name: Test Campaign
folder: test-cases
columns:
- New
- Active
- Resolved
```

#### Create a pipeline

Use this action in a pipeline triggered by the event of your choice. Make sure you use the `actions/checkout` action in a previous step so that the test case files are available. 

```yaml
name: Generate test plan

on:
  workflow_dispatch

jobs:
  generate-test-campaign:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Generate Test Campaign
      uses: ./
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
```
