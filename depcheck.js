'use strict';

const npm = require('npm');
const pairs = require('lodash.pairs');
const zipObject = require('lodash.zipobject');
const find = require('lodash.find');
const Promise = require('es6-promise').Promise;

function findDuplicateDependencies(options) {

  options || (options = {});

  return new Promise(function(resolve, reject) {
    const packages = options.packages || [];
    const {checkDevDependencies} = options;

    npm.load({production: !checkDevDependencies, json: true}, function(err) {

      if (err) return reject(err);

      npm.commands.ls(packages, true, function(err, packageInfo, packageObj) {

        if (err) return reject(err);

        const catalog = catalogDependencies(packageObj.dependencies, packageObj.name);
        const duplicatePairs = pairs(catalog).filter(function (entry) {
          return entry[1].length > 1;
        });

        resolve(zipObject(duplicatePairs));

      });

    })
  });

}

function catalogDependencies(dependencies, path) {

  return _catalogDependencies({}, dependencies, path);

  function _catalogDependencies(result, dependencies, path) {

    return pairs(dependencies).reduce(function(acc, entry) {

      const name = entry[0];
      const moduleObj = entry[1];

      if (!acc[name]) {
        acc[name] = [];
      }

      const isAdded = Boolean(find(acc[name], {version: moduleObj.version}));
      
      if (!isAdded) {
        acc[name].push({
          name: name,
          version: moduleObj.version,
          from: moduleObj.from,
          path: path
        });
      }

      if (moduleObj.dependencies) {
        return _catalogDependencies(acc, moduleObj.dependencies, path.concat('/' + name));
      }

      return acc;

    }, result);

  }
}

module.exports = findDuplicateDependencies;
