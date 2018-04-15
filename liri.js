var dotenv = require("dotenv").config();
var keys = require('./keys.js');
var inq = require('inquirer');
var req = require('request');
var Twit = require('twit');
var Spotify = require('node-spotify-api');
var spot = new Spotify(keys.spotify);
var twitty = new Twit(keys.twitter);

function getTweets(name, num) {
    //var num = 20;
    //var name = "supercoolguy162";
    twitty.get('statuses/user_timeline', { screen_name: name, count: num }, function(err, data, response) {
        if(err) {
            return console.log(err);
        }
        if(data) {
            for(let i = 0; i < data.length; i++) {
                console.log(data[i].user.screen_name);
                console.log(data[i].created_at);
                console.log(data[i].text);            
            }
        }
        main();
    });
}//end myTweets

//tweets();
var mainPrompt = {
    type: 'list',
    name: 'choice',
    message: 'What can I do for you today?',
    choices: ['Tweets', 'Spotify', 'Movies', 'Exit']
}
function main () {
    inq.prompt(mainPrompt).then(x => {
        if(x.choice === 'Tweets'){
            runTwitter();
        } else if(x.choice === 'Spotify') {
            runSpotify();
        } else if(x.choice === 'Movies') {
            runOMDB();
        } else {
            return;
        }
    });
}//end main

function tweets(num) {
    inq.prompt(
        {
            type: "input",
            name: "userName",
            message: "Enter Twitter User Name",
            validate: function(name) {
                if(name.length === 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    ).then(x => {
        getTweets(x.userName, num);
    });
}
function runTwitter() {
    inq.prompt([
        {
            type: "list",
            name: "choice",
            message: "Whose Tweets do you want?",
            choices: ['My Tweets', 'Other Tweets']
        },
        {
            type: "list",
            name: "number",
            message: "How many Tweets do you want?",
            choices: ['Last 5', 'Last 10', 'Last 20']
        }
    ]).then(x=>{
        let num;
        switch(x.number) {
            case 'Last 5':
                num = 5;
            break;
            case 'Last 10':
                num = 10;
            break;
            case 'Last 20':
                num = 20;
            break;
        }
        if(x.choice === "My Tweets") {
            getTweets("mynar7", num);
        } else {
            tweets(num);
        }
    });
}

function runSpotify() {
    inq.prompt({
        type: "input",
        name: "song",
        message: "Enter song",
        //default: "the sign ace of base"
    }).then(x=>{
        if(x.song === ''){
            getSong("the sign ace of base");
        } else {
            getSong(x.song);
        }
    });
}

function getSong(song) {
    spot.search({ type: 'track', query: song, limit: '1'}, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        if(data.tracks.items[0]) {
            console.log("Song Title: ", data.tracks.items[0].name);
            console.log("Artist: ", data.tracks.items[0].artists[0].name);    
            console.log("Album: ", data.tracks.items[0].album.name);
            console.log("Release Date: ", data.tracks.items[0].album.release_date);
            console.log("Preview URL: ", data.tracks.items[0].preview_url);
        } else {
            console.log("Song not Found");
        }
        main();
    });
}

function runOMDB() {
    inq.prompt({
        type: "input",
        name: "movie",
        message: "Enter Movie Title",
        //default: "the sign ace of base"
    }).then(x=>{
        if(x.movie === ''){
            omdb('mr nobody');
        } else {
            omdb(x.movie);
        }
    });
}

function omdb(movie) {
    req("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy", function(error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        /*
        * Title of the movie.
        * Year the movie came out.
        * IMDB Rating of the movie.
        * Rotten Tomatoes Rating of the movie.
        * Country where the movie was produced.
        * Language of the movie.
        * Plot of the movie.
        * Actors in the movie.
        * */
        if(error) {
            console.log("Error:", error)
        }
        if (!error && response.statusCode === 200) {
            console.log("Title: ", JSON.parse(body).Title);
            console.log("Release Year: ", JSON.parse(body).Year);
            console.log("Ratings:");
            for(let i = 0; i < JSON.parse(body).Ratings.length; i++) {
                console.log('   ' + JSON.parse(body).Ratings[i].Source + ': ' + JSON.parse(body).Ratings[i].Value);
            }
            console.log("Country produced in: ", JSON.parse(body).Country);
            console.log("Language: ", JSON.parse(body).Language);
            console.log("Plot: ", JSON.parse(body).Plot);
            console.log("Actors: ", JSON.parse(body).Actors);              
        }
        //console.log(JSON.parse(body));
        main();
    });
}

main();