# inkwell.js

Inkwell is a tool for creating incremental backups.

## Installation
Installation goes through NPM:
```
$ npm install -g inkwell
```
## License

## Usage
First, create `.inkwellignore` in your `<source>` directory or one of its parents.
```
$ inkwell <source> <destination>
```

Inkwell will backup any files that have been modified since your last backup, and create hard links to the most recent backups of files that haven't been modified.

A `<destination>` directory might look like this, for example: