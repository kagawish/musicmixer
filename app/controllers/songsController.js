/* jshint node: true */
"use strict";

var mongoose = require('mongoose');
var songModel = require('../models/song.js');
var fs = require('fs');
var path = require('path');
var helperCtrl = require('./helperController.js');
var _ = require('lodash');

exports.createshare = function(req, res){
    songModel.findOneAndUpdate({title:req.params.song}, {shared: true, sharedAt: Date.now()}, function(err, song){
        if(err) throw err;
        res.redirect('/shares');
    });
};

exports.getshare = function(req, res){
    songModel.find({shared: true}, function(err, songs){
        res.render('shares.ejs', {songs: songs });
    });
};

exports.loadsong = function (req, res) {
  var newPath = null,
      uploadedFileNames = [],
      uploadedImages,
      uploadedImagesCounter = 0;
  var pp = __dirname + "/../../users/"+req.user._id+"/"+req.param("songname");
  try{
    fs.mkdirSync(pp);
  }catch (e){
    var songslist = helperCtrl.getDirectories( __dirname + "/../../users/"+req.user._id);
    req.flash('doublicateName', 'Douplicate song name   ');
    return res.render('profile.ejs',{user:req.user,songs:songslist,message:req.flash('doublicateName')});
  }
  songModel.create({title: req.param("songname"), username: req.user.local.username, user: req.user, comments: []}, function(err ,song){
     if(err) throw err;
  });
  if(req.files && req.files.uploadedImages) {
    uploadedImages = Array.isArray(req.files.uploadedImages) ? req.files.uploadedImages : [req.files.uploadedImages];

    uploadedImages.forEach(function (value) {
      console.log(value);
      newPath = pp +"/" + value.originalFilename;
      console.log(newPath);
      fs.renameSync(value.path, newPath);

      uploadedFileNames.push(helperCtrl.parseFile(newPath, req));
    });

    //res.render('profile.ejs',{user:req.user,message:req.flash('doublicateName')});
    res.redirect('/profile');
  }
};

  // songModel.create({title: req.param("songname"), username:req.user.local.username, user: req.user, comments: []}, function(err, song){
  //    if(err) throw err;
  // });

exports.deletesong = function(req,res){
  var songname = req.params.song;
  var pp = __dirname + "/../../users/" + req.user._id + "/" + songname;
  helperCtrl.deleteFolderRecursive(pp);
  songModel.remove({title: req.params.song}, function(err, song){
    if(err) throw err;
  });
  res.redirect('/profile');
};
