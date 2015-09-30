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
```
Sep 21 09:05 back-2015-09-21.09-05-18
Sep 21 09:51 back-2015-09-21.09-51-11
Sep 21 10:29 back-2015-09-21.10-29-39
Sep 25 16:01 back-2015-09-25.16-01-03
Sep 27 13:36 back-2015-09-27.13-36-21
Sep 27 13:41 back-2015-09-27.13-41-20
Sep 29 14:17 back-2015-09-29.14-17-26
Sep 29 15:24 back-2015-09-29.15-24-05
Sep 29 15:24 current -> back-2015-09-29.15-24-05/
Sep 25 15:55 incomplete-back-2015-09-25.15-55-48
Sep 25 15:56 incomplete-back-2015-09-25.15-56-20
```