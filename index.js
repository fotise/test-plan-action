const core = require('@actions/core')
const github = require('@actions/github')

  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    const payloadStr = JSON.stringify(context.payload, undefined, 2)
    core.debug(`The event payload: ${payloadStr}`)
    const repoStr = JSON.stringify(context.repo, undefined, 2)
    core.debug(`The repo info: ${repoStr}`)

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