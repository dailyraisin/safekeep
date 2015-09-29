'use strict';

var sprintf = require('sprintf');
var async = require('async');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var mv = require('mv');
var Rsync = require('rsync');
var moment = require('moment');
var chalk = require('chalk');

var date = moment().format('YYYY-MM-DD.hh-mm-ss');

var source = process.argv[2];
var dest = process.argv[3];

var ignore, incomplete, complete, current, linkDest;
var destContents = [];

async.series([
    cliArgs,
    sourceIsDir,
    formatArgs,
    finalVariables,
    verifyInkwellIgnore,
    makeDestDir,
    readDir,
    //checkCurrent,
    linkLatestBackup,
    makeBackupDir,
    rSync,
    moveToComplete,
    clearOldLink,
    makeNewLink,
    debug
], handleError);

function handleError (err) {
    if (err) {
        console.log(chalk.red(err));
        process.exit(1);
    }
}

function cliArgs (next) {
    console.log(chalk.blue('step 1'));

    if (source === undefined || dest === undefined) {
        next('Usage: inkwell source destination');
    }
    else {
        next(null);
    }
}

function sourceIsDir (next) {
    console.log(chalk.blue('step 2'));
    fs.lstat(source, function (err, stats) {
        if (err || !stats.isDirectory()) {
            next(source + ' is not a directory. I can only back up directories.');
        }
        else {
            next(null);
        }
    });
}

function formatArgs (next) {
    console.log(chalk.blue('step 3'));
    source = path.resolve(source); //return absolute path and remove possible trailing slash
    dest = path.resolve(dest);
    if (path.basename(dest) === path.basename(source)) { //avoid double nesting
        dest = path.dirname(dest);
    }
    dest = dest + '/' + path.basename(source); //add basename of source to destination
    next(null);
}

function finalVariables (next) {
    console.log(chalk.blue('step 4'));

    ignore = source + '/.inkwellignore';
    incomplete = dest + '/incomplete-back-' + date;
    complete = dest + '/back-' + date;
    current = dest + '/current';
    linkDest = current;
    next(null);
}

function verifyInkwellIgnore (next) {
    console.log(chalk.blue('step 5'));
    fs.access(ignore, fs.R_OK, ifIgnoreNotFound);
    function ifIgnoreNotFound(err) {
        if (err && path.dirname(ignore) === '/') {
            next(ignore + ' does not exist in this or any parent directories');
        }
        else if (err) {
            ignore = path.normalize(path.dirname(ignore) + '/../.inkwellignore');
            fs.access(ignore, fs.R_OK, ifIgnoreNotFound);
            console.log('lookingForIgnore again!');
        }
        else {
            next(null);
        }
    }
}

function makeDestDir (next) {
    console.log(chalk.blue('step 6'));
    mkdirp(dest, function (err) {//if destination doesn't exist, make directory
        if (err) {
            next('Unable to create ' + dest);
        }
        else {//AFTER destination is created (if it didn't exist already), then make sure destination is writeable
            fs.access(dest, fs.W_OK, function(err) {
                if (err) {
                    next(dest + ' is not writable');
                }
                else {
                    next(null);
                }
            });
        }
    });
}

function readDir (next) {
    console.log(chalk.blue('step 7'));
    fs.readdir(dest, function(err, files) { //read dest directory and pass the array "files"
        if (err) {
            next(err);
        }
        else {
            destContents = files;
            next(null);
        }
    });
}

//function checkCurrent (next) {
//    console.log(chalk.blue('step 7b'));
//    fs.lstat(current, function (err, stats) {
//        if (err || !stats.isSymbolicLink()) {
//            next(err);
//        }
//        else {
//            next(null);
//        }
//    });
//}

function linkLatestBackup (next) {
    console.log(chalk.blue('step 8'));
    var files = destContents;
    var backups = files.filter(filterBack);
    var latestBackup = backups.sort().reverse()[0];
    fs.symlink(latestBackup + '/', current, function (err) {
        //var util = require('util');
        //console.log(util.inspect(err));
        if (err === null || err.code === 'EEXIST') {
            next(null);
        }
        else {
            next(err);
        }
    });
}

function filterBack (thisFile) {//callback for array.filter(callback), gets (element, index, array)
    return thisFile.substr(0,5) === 'back-';
}

function makeBackupDir (next) {
    console.log(chalk.blue('step 9'));
    mkdirp(complete, function (err) {//create 'completed' directory
        if (err) {
            next('Unable to create ' + complete);
        }
        else {
            console.log(chalk.cyan('Created ' + complete));
            next(null);
        }
    });
}

function rSync (next) {
    console.log(chalk.blue('step 10'));
    var rsync = new Rsync()
    .flags('az')
    .set('delete')
    .set('delete-excluded')
    .set('exclude-from', ignore)
    .set('link-dest', linkDest)
    .source(source)
    .destination(incomplete);

    rsync.execute(function(error, code, cmd){
        if (code === 0) { //exit code 0 means rsync was successful
            next(null);
        }
        else {
            next('rsync was unsuccessful ' + cmd);
        }
    });
}


function moveToComplete (next) {
    console.log(chalk.blue('step 11'));
    mv(incomplete, complete, function(err) {
        if (err) {
            next(err);
        }
        else {
            next(null);
        }
    });
}

function clearOldLink (next) {
    console.log(chalk.blue('step 12'));
    fs.unlink(current, function (err) {
        if (err) {
            next(err);
        }
        else {
            next(null);
        }
    });
}

function makeNewLink (next) {
    console.log(chalk.blue('step 13'));
    fs.symlink(path.basename(complete) + '/', current, function (err) {
        if (err) {
            next(err);
        }
        else {
            next(null);
        }
    });
}

function debug (next) {
    formatDebug('source', source);
    formatDebug('dest', dest);
    formatDebug('ignore', ignore);
    formatDebug('incomplete', incomplete);
    formatDebug('complete', complete);
    formatDebug('linkDest', linkDest);
    formatDebug('date', date);
    next(null);
}

function formatDebug (label, value) {
    console.log(sprintf('%12s:', label), chalk.yellow(value));
}
