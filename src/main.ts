import * as core from '@actions/core'
import {join} from 'path'
import {readFile} from 'fs'
import yaml from 'js-yaml'

async function run(): Promise<void> {
  try {
    const version = getFlutterVersion()
    core.info(`version: ${version}`)
    core.setOutput('version', version)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

async function getFlutterVersion(): Promise<string> {
  const dir = process.env.GITHUB_WORKSPACE || './'
  const pubspecYaml = join(dir, 'pubspec.yaml')
  const pubspecData = await readYamlFile(pubspecYaml).catch(() => {
    Promise.reject(new Error(`pubspec.yaml not found: ${pubspecYaml}`))
  })
  if (
    !pubspecData ||
    !pubspecData.version ||
    typeof pubspecData.version !== 'string'
  ) {
    core.setFailed('version not found in pubspec.yaml')
  }
  const versionList = pubspecData.version.split('+')
  return versionList[0]
}

async function readYamlFile(file: string) {
  const fileData: string = await new Promise((resolve, reject) =>
    readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  )
  return yaml.load(fileData)
}
