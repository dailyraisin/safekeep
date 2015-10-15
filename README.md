# Safekeep

Safekeep is a tool for making incremental backups, written in Node.js.

## Installation

Installation through NPM:

```
$ npm install -g safekeep
```

## Usage

```
$ safekeep <source> <destination>
```

Requires `.safekeepignore` in the `<source>` directory or a parent directory.

## Example

A `<destination>` directory might look something like this:

```
~/backups
├── back-2015-09-13.10-04-05
├── back-2015-09-13.10-41-09
├── back-2015-09-13.14-23-56
├── back-2015-09-14.17-33-27
├── back-2015-09-15.16-12-06
├── back-2015-09-16.08-56-24
├── back-2015-09-17.14-42-30
├── back-2015-09-19.22-02-52
├── back-2015-09-19.22-03-50
└── current -> back-2015-09-19.22-03-50/
```

Each time safekeep is run, a timestamped backup is made with the convention `back-YYYY-MM-DD.HH-mm-ss`, as well as a link called `current ->` which points to the latest backup.

Any changes made to `<source>` are incrementally backed up.

## Requirements

Node v0.12

## License

Unlicensed.
