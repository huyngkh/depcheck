'use strict';

const Npm = require('./node_modules/npm/lib/npm.js');
const pairs = require('lodash.pairs');
const zipObject = require('lodash.zipobject');
const find = require('lodash.find');
const Promise = require('es6-promise').Promise;

const npm = new Npm();

function findDuplicateDependencies(options) {

  options || (options = {});

  return new Promise(function(resolve, reject) {
    const packages = options.packages || [];
    const {checkDevDependencies} = options;
    
    npm.load().then(() => {
      npm.config.set('json', true);
      npm.config.set('all', true);
      npm.config.set('production', !checkDevDependencies);

      npm.output = (result) => {
        let packageObj = JSON.parse(result);

        try {
          packageObj = JSON.parse(result);
        } catch {
          reject(result);
        }

        const catalog = catalogDependencies(packageObj.dependencies, packageObj.name);
        const duplicatePairs = pairs(catalog).filter(function (entry) {
          return entry[1].length > 1;
        });

        let duplicates = zipObject(duplicatePairs);
        if (packages.length) {
          duplicates = Object.keys(duplicates)
            .filter(pkgName => packages.includes(pkgName))
            .reduce((obj, key) => {
                obj[key] = duplicates[key];
                return obj;
            }, {});
        }

        resolve(duplicates);
      };

      npm.exec('ls', []);
    });
    
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
