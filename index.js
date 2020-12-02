const core = require('@actions/core')
const github = require('@actions/github')

  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    const projectParams = {
        ...context.repo,
        projectName
    }

    const projectParamsStr = JSON.stringify(projectParams)
    core.debug(`Creating "${projectName}" project board with params ${projectParamsStr}`)

    octokit.projects.createForRepo(
      projectParams, 
      (createRepoResponse) => {
      core.debug(`Response: ${createRepoResponse}`)
      },
      (createRepoError) => {
        core.setFailed(createRepoError.message)
      }
    )

  } catch (error) {
    core.setFailed(error.message)
  }