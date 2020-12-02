const core = require('@actions/core')
const github = require('@actions/github')

  try {
    const projectName = core.getInput('name')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    const projectParams = {
        ...context.repo,
        name: projectName
    }

    const projectParamsStr = JSON.stringify(projectParams)
    core.debug(`Creating "${projectName}" project board with params ${projectParamsStr}`)

    octokit.projects.createForRepo(projectParams).then(createRepoResponse => {
      core.debug(`Response: ${createRepoResponse}`)
    }).catch(createRepoError => {
      core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
    })

  } catch (error) {
    core.setFailed(error.message)
  }