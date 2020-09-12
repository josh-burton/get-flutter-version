import * as core from '@actions/core'
import {join} from 'path'
import {readFile} from 'fs'
import yaml from 'js-yaml'

type safeLoadType = string | object | undefined

interface Pubspec {
  version?: string
}

async function run(): Promise<void> {
  try {
    const version = await getFlutterVersion()
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
  const pubspecObj = await readYamlFile(pubspecYaml)

  if (!pubspecObj) {
    throw new Error(`pubspec.yaml not found ${pubspecYaml}`)
  }
  if (typeof pubspecObj !== 'object') {
    throw new Error(`${pubspecObj} is not an object`)
  }

  const pubspecData = pubspecObj as Pubspec
  if (!pubspecData.version) {
    throw new Error('version not found in pubspec.yaml')
  }
  const versionList = pubspecData.version.split('+')
  return versionList[0]
}

async function readYamlFile(file: string): Promise<safeLoadType> {
  const fileData: string = await new Promise((resolve, reject) =>
    readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  )
  return yaml.safeLoad(fileData)
}
