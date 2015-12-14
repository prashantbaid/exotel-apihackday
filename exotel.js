var express = require('express');
var app = express();
var url = require('url');
var Promise = require('bluebird');
var responseText = 'twinkle twinkle little star how i wonder what you are';
var request = Promise.promisify(require('request'));

app.get('/submitsms', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	console.log('received', req.query);
	req.query.Body = req.query.Body.replace("8095103280 ", "");
	var serviceArr = req.query.Body.split(":");
	if(serviceArr[0] === 'text') {
		if(serviceArr[1] === 'tweets')	
			sendTweets(serviceArr[2], res);
		else if(serviceArr[1] === 'news')
			sendNews(serviceArr[2], res);
	}
	else {
		if(serviceArr[1] === 'tweets')	
			sendTweets(serviceArr[2]);
		else if(serviceArr[1] === 'news')
			sendNews(serviceArr[2]);
		sendCall(req, res);
	}
});

function sendCall(req, res) {
	//post call to exotel
	var postData={
   		From: req.query.From,
   		CallerId: '08039236564',
   		CallerType: 'trans',
   		Url: 'http://my.exotel.in/exoml/start/60043'
	};
	require('request').post({
   		url:"https://sapient1:7697153dcbc52e4d4f6eb027c2704ece713cf0d0@twilix.exotel.in/v1/Accounts/sapient1/Calls/connect",
   		formData:postData
   },function(err,response,body){
       console.log(body);
       console.log(response.statusCode);
       //responseText = 'Hello world united states of america';
       res.end('You will receive a call shortly.');
	});
}

app.get('/getres', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	console.log('caller called', responseText);
	res.end(responseText);
});


function sendTweets(account, res) {
	console.log('sendTweets called', account);
  var Twitter = require('twitter'); 
  var client = new Twitter({
  consumer_key: '5z16yRO3vX8b2JK8tmbjyZrLH',
  consumer_secret: 'Qy1BtfO3H4hvbib6mCx2WQsmokfjl62mOGxEEHnXHicOMlEy1L',
  access_token_key: '15367007-jJdPR3O5ZVhjDxePX9W8toAPxfraDTndgXXeJzlOM',
  access_token_secret: 'dkDArrm9POoeKRKm3W1UR9kc5QkXRSRSUDmE1Cacpa0vJ'
});
 
var params = {screen_name: account};
client.get('statuses/user_timeline', params, function(error, tweets, response){
  if (!error) {
  	responseText = 'Tweets from '+account+' are ';
    	responseText += tweets[0].text;
    console.log('reuturning tweetString', responseText);
    if(res)
    	res.end(responseText);
   // return tweetString;
  }
});
}

var topicArr = {
	latest : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22http%3A%2F%2Fdynamic.feedsportal.com%2Fpf%2F555218%2Fhttp%3A%2F%2Ftoi.timesofindia.indiatimes.com%2Frssfeedstopstories.cms%22%3B&format=json&diagnostics=true&callback=',
	entertaintment : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22http%3A%2F%2Fdynamic.feedsportal.com%2Fpf%2F555218%2Fhttp%3A%2F%2Ftoi.timesofindia.indiatimes.com%2Frssfeedstopstories.cms%22%3B&format=json&diagnostics=true&callback=',
	technology : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22http%3A%2F%2Ftimesofindia.feedsportal.com%2Fc%2F33039%2Ff%2F533923%2Findex.rss%22%3B&format=json&diagnostics=true&callback=',
	sports : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22http%3A%2F%2Ftimesofindia.feedsportal.com%2Fc%2F33039%2Ff%2F533921%2Findex.rss%22%3B&format=json&diagnostics=true&callback='

}

function sendNews(topic, res) {
	console.log('send news called', topic);
	request(topicArr[topic]).spread(function(response, body) {
		body = JSON.parse(body);
    	console.log('body is ----', body);
    	var newsItem = body.query.results.item;
    	responseText = 'News from '+ topic + ' are \n';
    	for(var idx in newsItem) {
    		responseText += newsItem[idx].title + '.   \n';
    		if(idx >= 5)
    			break;
    	}
    	console.log('reuturning news', responseText);
    	if(res)
    		res.end(responseText);
    	//return newsString;          	
    });
} 
app.listen(9004);