# depcheck (dependency-checker)
**depcheck** is a small package to find duplicate dependencies in your node_modules. This project is inspired by [find-duplicate-dependencies](https://github.com/vovacodes/find-duplicate-dependencies) by Vladimir Guguiev.

## Install

```bash
$ npm install @webkits/depcheck
```



## Usage

### CLI

```bash
depcheck [options] [package-name-1] [...] [package-name-n]

Analyze and find the duplicates packages in node_modules. If no package names
are provided, it will check all the dependencies.

Options:
      --version  Show version number                                   [boolean]
  -v, --verbose  Display the duplicate packages in details with their version
                 and caller path                                       [boolean]
  -h, --help     Show help                                             [boolean]
```

This command exits with 1 if there are some duplicates and with 0 if there are not.



**Example 1**: Check all the dependencies

```bash
$ depcheck
```



**Example 2**: Check some dependecies

```bash
$ depcheck -v -- lodash react
```



### API

```javascript
const findDuplicateDependencies = require('@webkits/depcheck');

findDuplicateDependencies()
  .then(duplicates => console.log(JSON.stringify(duplicates)))
 	.catch(err => {
  	console.error(err.stack);
  	return process.exit(1);
	});
```
