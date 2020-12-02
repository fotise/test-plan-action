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
    core.debug(`Loaded config ${JSON.stringify(configDoc)}`)

    const projectParams = {
        ...context.repo,
        name: configDoc.name
    }

    core.debug(`Creating "${configDoc.name}" project board in ${projectParams.owner}/${projectParams.repo}`)

    octokit.projects.createForRepo(projectParams).then(createRepoResponse => {
      const projectId = createRepoResponse.data.id
      core.debug(`Project id: ${projectId}`)

      for (let column of configDoc.columns) {
        core.debug(`Adding column ${column}`)

        octokit.projects.createColumn({
          project_id: projectId,
          name: column
        }).then(createColumnResponse => {
          core.debug(JSON.stringify(createColumnResponse.data))
        }).catch(createColumnError => {
          core.setFailed(`Failed creating the ${column} column with error: ${createColumnError.message}`)
        })

        var files = fs.readdirSync(configDoc.test-folder)
        for (let file of files) {
          core.debug(`Loading test case file ${file}`)
        }        

      }
    }).catch(createRepoError => {
      core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
    })

  } catch (error) {
    core.setFailed(error.message)
  }