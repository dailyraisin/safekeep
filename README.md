# Safekeep

Inkwell is a tool for making incremental backups, written in Node.js.

## Installation
Installation goes through NPM:
```
$ npm install -g safekeep
```
## License
## Usage

```
$ safekeep <source> <destination>
```
Requires `.safekeepignore` in `<source>` directory or one of its parents.
## Example

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
Each time safekeep is run, a timestamped backup is made with the convention `back-YYYY-MM-DD.HH-mm-ss`, as well as a link called `current ->` which points to the latest backup.

Any changes made to `<source>` are fully backed up! Otherwise `safekeep` knows not make full copies of unchanged files.
