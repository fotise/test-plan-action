const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')
const fs   = require('fs')

  try {
    const config = core.getInput('config')
    const ghToken = core.getInput('token')
    const octokit = github.getOctokit(ghToken)
    const context = github.context
    
    const configDoc = yaml.safeLoad(fs.readFileSync(config, 'utf8'));
    core.debug(`Loaded config ${configDoc}`)

    const projectParams = {
        ...context.repo,
        name: configDoc.name
    }

    core.debug(`Creating "${configDoc.name}" project board in ${projectParams.owner}/${projectParams.repo}`)

    octokit.projects.createForRepo(projectParams).then(createRepoResponse => {
      const projectStr = JSON.stringify(createRepoResponse)
      core.debug(`Response: ${projectStr}`)
    }).catch(createRepoError => {
      core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
    })

  } catch (error) {
    core.setFailed(error.message)
  }