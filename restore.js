const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const path = require('path');
const glob = require('@actions/glob');
// const  { v4 } = require('uuid');
const fs = require('fs');

const resolvePaths = async(patterns = []) => {
    const paths = [];
    const workspace = process.env['GITHUB_WORKSPACE'] ?? process.cwd()
    const globber = await glob.create(patterns.join('\n'), {
      implicitDescendants: false
    });
  
    for await (const file of globber.globGenerator()) {
      const relativeFile = path
        .relative(workspace, file)
        .replace(new RegExp(`\\${path.sep}`, 'g'), '/')
      core.debug(`Matched: ${relativeFile}`)
      // Paths are made relative so the tar entries are all relative to the root of the workspace.
      if (relativeFile === '') {
        // path.relative returns empty string if workspace and file are equal
        paths.push('.')
      } else {
        paths.push(`${relativeFile}`)
      }
    }
  
    return paths;
  };


  function getWorkingDirectory() {
    return process.env['GITHUB_WORKSPACE'] ?? process.cwd()
  }

const extractTar = async(souce) => {
    const workingDirectory = getWorkingDirectory()
    await io.mkdirP(workingDirectory);

    await execCommands([`tar -xf ${souce} -P -C ${workingDirectory}`])
};

const execCommands = async(commands = [], cwd = '') => {
    for (const command of commands) {
      try {
        await exec.exec(command, undefined, {
          cwd,
          env: {...(process.env), MSYS: 'winsymlinks:nativestrict'}
        })
      } catch (error) {
        throw new Error(
          `${command.split(' ')[0]} failed with error: ${error?.message}`
        )
      }
    }
  };
  

const setup = async() => {

    try {
        let storage = core.getInput('storage');
        let key = core.getInput('key');

        const storagePath = core.getInput('storage', {required: true});
      
        let targetPath = path.join(storagePath, `${key}.tgz`);
      
        try {
          let cacheExist = fs.existsSync(targetPath);
          if (!cacheExist) {
            core.info(
                `Cache not found.`
            );
            return;
          }
          
        } catch (error) {
          core.error(error)
        }

        const f = path.join(storage, `${key}.tgz`);
        await extractTar(f)
    } catch (error) {
        core.error(error)  
    } 
};

// module.exports = setup
if (require.main === module) {
    setup();
}