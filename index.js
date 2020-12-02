const core = require('@actions/core')
const github = require('@actions/github')

  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    const projectParams = {
        ...context.repo,
        projectName,
    }
    const projectParamsStr = JSON.stringify(projectParams)
    
    core.info(`Creating "${projectName}" project board with params ${projectParamsStr}`)

    octokit.projects.createForRepo(projectParams, (response) => {
      core.debug(`Response: ${response}`)
    })

  } catch (error) {
    core.setFailed(error.message)
  }