var dotenv = require("dotenv").config();
var keys = require('./keys.js');
var req = require('request');
var Twit = require('twit');
var Spotify = require('node-spotify-api');
var spot = new Spotify(keys.spotify);
var twitty = new Twit(keys.twitter);