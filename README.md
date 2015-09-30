# inkwell.js

Inkwell is a tool for creating incremental backups.

## Installation
Installation goes through NPM:
```
$ npm install -g inkwell
```
## License

## Usage
If none exists, create a `.inkwellignore` in your `<source>` directory or one of its parents.

Then use:
```
$ inkwell <source> <destination>
```

Inkwell will fully backup any files that have been modified since your last backup, while only hard linking any unchanged files to their most recent backups.

Each time inkwell is run, a timestamped backup is made with the convention `back-YYYY-MM-DD.HH-mm-ss`.

A `<destination>` directory might look something like this:
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