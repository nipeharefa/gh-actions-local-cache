const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const path = require('path');
const glob = require('@actions/glob');
const  { v4 } = require('uuid');
const fs = require('fs');

const createTempDirectory = async() => {
    let tempDirectory= process.env['RUNNER_TEMP'] || '';
    const dest = path.join(tempDirectory, v4())
    await io.mkdirP(dest)
    return dest
};

const createManifest = (tempDirectory, cachePaths) => {
  return fs.writeFileSync(
    path.join(tempDirectory, 'manifest.txt'),
    cachePaths.join('\n'),
  )
}

const getInputAsArray = (name, options = {}) => {
  return core
    .getInput(name, options)
    .split("\n")
    .map(s => s.replace(/^!\s+/, "!").trim())
    .filter(x => x !== "");
}

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

async function setup() {
  const paths = getInputAsArray('path', {
    required: true
  });

  const temp = await createTempDirectory();
  const cachePaths = await resolvePaths(paths);

  core.debug(JSON.stringify(cachePaths));
  core.debug(JSON.stringify(cachePaths.join('\n')));
  core.debug(JSON.stringify(temp));

  createManifest(temp, cachePaths);
  let manifest = path.join(temp, 'manifest.txt');
  await execCommands([`tar --zstd --posix -cf cache.tgz -P -C /Users/nipeharefa/projects/gowi/act --files-from=${manifest}`]);

  try {
    await io.mv('cache.tgz', core.getInput('storage'));
  } catch (error) {
    core.error(error);
  }
}

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

// module.exports = setup
if (require.main === module) {
    setup();
}