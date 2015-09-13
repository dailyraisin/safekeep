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
        console.log("Usage: inkwell source destination");
        process.exit(1);
    }
    else if (this.dest === undefined) {
        console.log("Usage: inkwell source destination");
        process.exit(1);
    }
    if (fs.lstatSync(this.source).isDirectory() === false) {
        console.log(self.source + " is not a directory. I can only back up directories.");
        process.exit(1);
    }
    this.formatArgs();
};

Inkwell.prototype.formatArgs = function() {
    var self = this;
    this.source = path.resolve(this.source); //return absolute path and remove possible trailing slash
    this.dest = path.resolve(this.dest);
    if (path.basename(this.dest) == path.basename(this.source )) { //avoid double nesting
        self.dest = path.dirname(self.dest);
    }
    self.dest = self.dest + "/" + path.basename(this.source); //add basename of source to destination
    this.finalVariables();
};


Inkwell.prototype.finalVariables = function() {
    this.ignore = this.source + "/.inkwellignore";
    this.date = moment().format('YYYY-MM-DD.hh-mm-ss');
    this.incomplete = this.dest + "/incomplete-back-" + this.date;
    this.complete = this.dest + "/back-" + this.date;
    this.current = this.dest + "/current";
    this.linkDest = this.current;
    this.finalChecklist();
};


Inkwell.prototype.finalChecklist = function() {
    var self = this;
    fs.access(this.ignore, fs.R_OK, function(err) { //make sure there's a .inkwellignore in the source directory
        if (err) {
            console.log(chalk.bgYellow(self.ignore + " does not exist"));
            process.exit(1);
        }
    });
    mkdirp(this.dest, function (err) {//if destination doesn't exist, make directory
        if (err) {
            console.log("Unable to create " + self.dest);
            process.exit(1);
        }
        else {//AFTER destination is created (if it didn't exist already), then make sure destination is writeable
            fs.access(self.dest, fs.W_OK, function(err) {
                if (err) {
                console.log(self.dest + " is not writable");
                process.exit(1);
                }
            });
        }
    });
    mkdirp(this.complete, function (err) {//create "completed" directory
        if (err) {
            console.log("Unable to create " + self.complete);
            process.exit(1);
        }
        else console.log(chalk.cyan("Created " + self.complete));
    });
    this.rSync();
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
            console.log("rsync was unsuccessful " + cmd);
            process.exit(1);
        }
    });
};

Inkwell.prototype.moveToComplete = function() {
    var self = this;
    //console.log("Now's the time to move incomplete to complete.");
    mv(self.incomplete, self.complete, function(err) {});
    this.clearOldLink();
};

Inkwell.prototype.clearOldLink = function() {
    var self = this;
    //console.log("Now's the time to clear /current");
    fs.unlink(self.current, function(){}); //maybe put makeNewLink as callback
    this.makeNewLink();
};

Inkwell.prototype.makeNewLink = function() {
    var self = this;
    //console.log("Now's the time to link /current");
    fs.symlink(path.basename(self.complete) + "/", self.current, function(){});
};

var inkwell = new Inkwell(source, dest);
inkwell.initialize();
