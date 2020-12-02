const core = require('@actions/core')
const github = require('@actions/github')

  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.debug(`The event payload: ${payload}`)
    core.info(`Creating "${projectName}" project board`)

    octokit.projects.createForRepo({
      ...context.repo,
      projectName,
    }, (response) => {
      core.debug(`Response: ${response}`)
    })

    

  } catch (error) {
    core.setFailed(error.message)
  }