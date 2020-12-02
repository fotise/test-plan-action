const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const context = github.context
    const octokit = new github.GitHub(ghToken)
    
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.debug(`The event payload: ${payload}`)
    core.info(`Creating "${projectName}" project board`)

    octokit.projects.createForRepo({
      ...context.repo,
      projectName,
    })

  } catch (error) {
    core.setFailed(error.message)
  }
}