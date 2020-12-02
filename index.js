const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')
const fs   = require('fs')
const fm = require('front-matter')

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

    let firstColId

    core.debug(`Creating "${configDoc.name}" project board in ${projectParams.owner}/${projectParams.repo}`)

    octokit.projects.createForRepo(projectParams).then(createRepoResponse => {
      const projectId = createRepoResponse.data.id
      core.debug(`Project id: ${projectId}`)

      for (let column, index of configDoc.columns) {
        core.debug(`Adding column ${column}`)

        octokit.projects.createColumn({
          project_id: projectId,
          name: column
        }).then(createColumnResponse => {
          core.debug(JSON.stringify(createColumnResponse.data))
          if (index === 0) {
            firstColId = createColumnResponse.data.id
            core.debug(`First column id is ${firstColId}`)
          }
        }).catch(createColumnError => {
          core.setFailed(`Failed creating the ${column} column with error: ${createColumnError.message}`)
        })        
      }

      var files = fs.readdirSync(configDoc.folder)
      for (let file of files) {
        core.debug(`Loading test case file ${file}`)
        fs.readFile(`${configDoc.folder}/${file}`, 'utf8', (err, data) => {
          var content = fm(data)
          console.log(content)
          // TODO: Create an issue
        })
      }
      
    }).catch(createRepoError => {
      core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
    })

  } catch (error) {
    core.setFailed(error.message)
  }