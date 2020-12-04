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

  core.debug(`Creating "${configDoc.name}" project board in ${projectParams.owner}/${projectParams.repo}`)

  octokit.projects.createForRepo(projectParams).then(createRepoResponse => {
    const projectId = createRepoResponse.data.id
    let previousColumnId 

    for (let index in configDoc.columns) {
      const columnName = configDoc.columns[index]
      core.debug(`Adding column ${columnName}`)

      const column = await octokit.projects.createColumn({
        project_id: projectId,
        name: columnName
      })

      let postion
      
      if (index == 0) {
        generateIssues(octokit, configDoc.folder, projectParams.owner, projectParams.repo, column.node_id)
        postion = 'first'
      } else {
        postion = `after:${previousColumnId}`
      }

      previousColumnId  = column.id

      core.debug(`Moving column ${columnName} to position ${postion}`)

      octokit.projects.moveColumn({
        column_id: column.id,
        position: postion
      })
    }
  }).catch(createRepoError => {
    core.setFailed(`Failed creating the project with error: ${createRepoError.message}`)
  })
} catch (error) {
  core.setFailed(error.message)
}


function generateIssues(octokit, folder, owner, repo, columnId) {
  var files = fs.readdirSync(folder)
  for (let file of files) {
    core.debug(`Loading test case file ${file}`)

    fs.readFile(`${folder}/${file}`, 'utf8', (err, data) => {
      var content = fm(data)
      core.debug(content)
      
      const issue = {
        owner: owner,
        repo: repo, 
        title: content.attributes.title,
        body: content.body,
      }

      if (content.attributes.assignees) {
        issue.assignees = content.attributes.assignees.split(',').map(s => s.trim())
      }

      if (content.attributes.labels) {
        issue.labels = content.attributes.labels.split(',').map(s => s.trim())
      }

      const mutation = `mutation($issueId: ID!, $columnId: ID!) { 
        addProjectCard( 
          input: { 
            contentId: $issueId, 
            projectColumnId: $columnId 
          }
        ) {
          clientMutationId  
        }
      }`

      octokit.issues.create(issue).then(({ data }) => {
        core.debug(data)

        const variables = {
          issueId: data.node_id,
          columnId: columnId
        }
        
        octokit.graphql(mutation, variables).then( data => {
          core.debug(data)
        }).catch(cardError => {
          core.setFailed(`Failed adding the card: ${cardError.message}`)
        })
      }).catch(issueError => {
        core.setFailed(`Failed creating the issue: ${issueError.message}`)
      })
    })
  }
}