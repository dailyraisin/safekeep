'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var mv = require('mv');
var Rsync = require('rsync');
var moment = require('moment');
var chalk = require('chalk');

var source = process.argv[2];
var dest = process.argv[3];


function Inkwell (source, dest) {
    this.source = source;
    this.dest = dest;
}

Inkwell.prototype.initialize = function() { // verify that there are two arguments, source and destination, and that source is a directory
    var self = this;
    if (this.source === undefined) {
        console.log('Usage: inkwell source destination');
        process.exit(1);
    }
    else if (this.dest === undefined) {
        console.log('Usage: inkwell source destination');
        process.exit(1);
    }
    if (fs.lstatSync(this.source).isDirectory() === false) {
        console.log(self.source + ' is not a directory. I can only back up directories.');
        process.exit(1);
    }
    this.formatArgs();
};

Inkwell.prototype.formatArgs = function() {
    var self = this;
    this.source = path.resolve(this.source); //return absolute path and remove possible trailing slash
    this.dest = path.resolve(this.dest);
    if (path.basename(this.dest) === path.basename(this.source )) { //avoid double nesting
        self.dest = path.dirname(self.dest);
    }
    self.dest = self.dest + '/' + path.basename(this.source); //add basename of source to destination
    this.finalVariables();
};

Inkwell.prototype.finalVariables = function() {
    this.ignore = this.source + '/.inkwellignore';
    this.date = moment().format('YYYY-MM-DD.hh-mm-ss');
    this.incomplete = this.dest + '/incomplete-back-' + this.date;
    this.complete = this.dest + '/back-' + this.date;
    this.current = this.dest + '/current';
    this.linkDest = this.current;
    this.verifyInkwellignore();
};

Inkwell.prototype.verifyInkwellignore = function() {//look for .inkwellignore
    var self = this;
    fs.access(self.ignore, fs.R_OK, ifIgnoreNotFound);//ifIgnoreNotFound is callback
    function ifIgnoreNotFound(err) {
        if (err && path.dirname(self.ignore) === '/') {
            console.log(chalk.bgYellow(self.ignore + ' does not exist in this or any parent directories'));
            process.exit(1);
        }
        else if (err) {
            self.ignore = path.normalize(path.dirname(self.ignore) + '/../.inkwellignore');
            fs.access(self.ignore, fs.R_OK, ifIgnoreNotFound);
            console.log('lookingForIgnore again!');
        }
        else {
            self.makeDestDir();
        }
    }
};

Inkwell.prototype.makeDestDir = function() {
    var self = this;
    mkdirp(this.dest, function (err) {//if destination doesn't exist, make directory
        if (err) {
            console.log('Unable to create ' + self.dest);
            process.exit(1);
        }
        else {//AFTER destination is created (if it didn't exist already), then make sure destination is writeable
            fs.access(self.dest, fs.W_OK, function(err) {
                if (err) {
                    console.log(self.dest + ' is not writable');
                    process.exit(1);
                }
            });
            self.replaceLinkIfMissing();
        }
    });
};

Inkwell.prototype.replaceLinkIfMissing = function() {
    var self = this;
    fs.readdir(this.dest, function(err, files){//read this.dest directory and pass the array "files"
        self.linkLatestBackup(files);
    });
};

Inkwell.prototype.linkLatestBackup = function(files) {//did I just use a closure?
    var self = this;
    this.backups = files.filter(this.filterBack);
    this.latestBackup = this.backups.sort().reverse()[0];
    fs.symlink(this.latestBackup + '/', this.current, function(){
        self.makeBackupDir();
    });
};

Inkwell.prototype.filterBack = function(thisFile) {//callback for array.filter(callback), gets (element, index, array)
    return thisFile.substr(0,5) === 'back-';
};

Inkwell.prototype.makeBackupDir = function() {
    var self = this;
    mkdirp(this.complete, function (err) {//create 'completed' directory
        if (err) {
            console.log('Unable to create ' + self.complete);
            process.exit(1);
        }
        else {
            console.log(chalk.cyan('Created ' + self.complete));
        }
        self.rSync();
    });

};

Inkwell.prototype.rSync = function() {
    var self = this;
    var rsync = new Rsync()
    .flags('az')
	  .set('delete')
	  .set('delete-excluded')
	  .set('exclude-from', self.ignore)
	  .set('link-dest', self.linkDest)
	  .source(self.source)
	  .destination(self.incomplete);

    rsync.execute(function(error, code, cmd){
        if (code === 0) { //exit code 0 means rsync was successful
            self.moveToComplete();
        }
        else {
            console.log(chalk.red('rsync was unsuccessful ' + cmd));
            process.exit(1);
        }
    });
};

Inkwell.prototype.moveToComplete = function() {
    var self = this;
    //console.log('Now's the time to move incomplete to complete.');
    mv(self.incomplete, self.complete, function(err) {}); //is this callback used on success too?
    this.clearOldLink();
};

Inkwell.prototype.clearOldLink = function() {
    var self = this;
    //console.log('Now's the time to clear /current');
    fs.unlink(self.current, function(){}); //maybe put makeNewLink as callback
    this.makeNewLink();
};

Inkwell.prototype.makeNewLink = function() {
    var self = this;
    //console.log('Now's the time to link /current');
    fs.symlink(path.basename(self.complete) + '/', self.current, function(){}); //fs.symlink(target, linkname, callback)
};

var inkwell = new Inkwell(source, dest);
inkwell.initialize();
