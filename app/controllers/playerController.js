/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var songModel = require('../models/song.js');
var userModel = require('../models/user.js');
var usersCtrl = require('./usersController.js');
var mongoose = require('mongoose');
var _ = require('lodash');

exports.playSong = function(req,res){
    console.log('Playing Song function');
    var songname = req.params.song;
    function sendTrack(track) {
        if (!track)
            return res.send(404, 'Track not found with id "' + songname + '"');
        var d = JSON.stringify(track).replace(/ /g, '');
        console.log("Server logged User Id: " + req.user._id);
        console.log("Server logged user: " + req.user);
        res.render('player.ejs', {songname: songname, ttracks :track , stracks : d});
    }
    getTrack(songname, sendTrack, req.user._id);
};

exports.loadtracks = function (req, res) {
    var songname = req.params[0];
    var p = __dirname +"/../../users/"+req.user._id+"/"+songname;
    var pp = path.resolve(p);

    res.sendfile(pp);
};

function getTrack(songname, callback,id) {
    var pp = __dirname + "/../../users/"+id+"/"+songname;
    getFiles(pp, function(fileNames) {
        var track = {
            id: songname,
            instruments: [],
            urls : []
        };
        fileNames.sort();
        for (var i = 0; i < fileNames.length; i ++) {
            var instrument = fileNames[i].match(/(.*)\.[^.]+$/, '')[1];
            track.instruments.push({
                name: instrument,
                sound: instrument + '.mp3'
            });

            track.urls.push(songname+'/'+instrument+'.mp3');
        }
        callback(track);
    });
}

function getFiles(dirName, callback) {
    fs.readdir(dirName, function(error, directoryObject) {
        callback(directoryObject);
    });
}

exports.saveComment = function (request, response){
    var body = request.body;
    var comment = body.comment;
    var songname = body.songname;
    songModel.findOne({title: songname} , function(err, song){
        song.comments.push({
            body: comment,
            user: request.user
        });
        song.save(function(){
            response.end();
        });
    });
};

exports.loadComments = function(request, response){
    var songname = request.params.song;
    songModel.findOne({title: songname}, 'comments', function(err, song){
            response.send(_(song.comments).sortBy(['createdAt']).reverse()
                           .forEach(function(value){
                                value.user = usersCtrl.getUsernameById(value.user);
                                value.createdAt = value.createdAt.toDateString();
                            })
            );
    });
};
