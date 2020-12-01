const core = require('@actions/core')
const github = require('@actions/github')

try {
  const projectName = core.getInput('name')
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  core.debug(`The event payload: ${payload}`)
  core.info(`Creating ${projectName}`)
} catch (error) {
  core.setFailed(error.message)
}