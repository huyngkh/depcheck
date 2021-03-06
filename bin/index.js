#! /usr/bin/env node

const util = require('util');
const chalk = require('chalk');
const yargs = require('yargs');
const findDuplicateDependencies = require('../depcheck');

const argv = yargs
  .scriptName("depcheck")
  .usage('$0 [options] [package-name-1] [...] [package-name-n]', 'Analyze and find the duplicates packages in node_modules. If no package names are provided, it will check all the dependencies.')
  .option('verbose', {
    description: 'Display the duplicate packages in details with their version and caller path',
    alias: 'v',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h').argv;

findDuplicateDependencies({packages: argv._}).then(
  function(duplicates) {
    if (Object.keys(duplicates).length) {

      printFailMessage(duplicates);
      return process.exit(1);
    }

    printSuccessMessage();
  }
).catch(function(err) {
  console.error(err.stack);
  return process.exit(1);
});


function printSuccessMessage() {
  if (argv._.length) {
    console.log(chalk.green(`There are no duplicate dependencies in the following package(s)`));
    console.log(chalk.cyan(argv._.join(' ')));
  } else {
    console.log(chalk.green('There are no duplicate dependencies in your package(s). Congratulations!'));
  }
}

function printFailMessage(duplicates) {
  const duplicatePackages = Object.keys(duplicates);
  console.log(chalk.red('This package has the following duplicate dependencies:\n'));

  duplicatePackages.forEach(function(packageName) {
  
    if (argv.verbose) {
      console.log(chalk.red(packageName), ':');
      console.log(util.inspect(duplicates[packageName], { colors: Boolean(process.stdout.isTTY) }), '\n');
    } else {
      const dups = getStats(duplicates[packageName]);
      dups.sort();

      console.log(chalk.cyan(`${packageName}@${dups[dups.length - 1]}`), chalk.red(`\t${dups.length} dups`));
    }
  });

  console.log(`\nTotal: ${duplicatePackages.length} duplicate packages found.\n`);
  console.log(chalk.red('Please run "npm dedupe" to see if that could be fixed. If not, manually resolve version conflicts'));
}

function getStats(arrDupInfos) {
  const versionDups = {};

  arrDupInfos.forEach(function(dupInfo) {
    const {version, path} = dupInfo;

    if (!versionDups[version]) {
      versionDups[version] = path;
    }
  });
  
  return Object.keys(versionDups);
}
