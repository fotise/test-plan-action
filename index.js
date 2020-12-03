const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')
const fs   = require('fs')
const fm = require('front-matter')
const { createDecipher } = require('crypto')

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

    for (let index in configDoc.columns) {
      const column = configDoc.columns[index]
      core.debug(`Adding column ${column}`)

      octokit.projects.createColumn({
        project_id: projectId,
        name: column
      }).then(({ columnData }) => {
        if (index == 0) {
          generateIssues(configDoc.folder, columnData.id)
        }
      }).catch(createColumnError => {
        core.setFailed(`Failed creating the ${column} column with error: ${createColumnError.message}`)
      })        
    }
    
  }).catch(createRepoError => {
    core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
  })

} catch (error) {
  core.setFailed(error.message)
}


function generateIssues(folder, owner, repo, columnId) {
  var files = fs.readdirSync(folder)
  for (let file of files) {
    core.debug(`Loading test case file ${file}`)
    fs.readFile(`${configDoc.folder}/${file}`, 'utf8', (err, data) => {
      var content = fm(data)
      console.log(content)
      /*
      octokit.issues.create({
        owner: owner,
        repo: repo, 
        title: content.attributes.title,
        assignees: content.attributes.assignees,
        labels: content.attributes.labels,
        body: content.body,
      }).then( ({ issueData }) => {
        octokit.projects.createCard({
          column_id: columnId,
          content_id: issueData.id,
          content_type: 'issue',
        }).then( ({ cardData }) => {
          core.debug(cardData)
        }).error( cardError => {
          core.setFailed(cardError.message)
        })
      }).error( issueError => {
        core.setFailed(issueError.message)
      })
      */
    })
  }
}