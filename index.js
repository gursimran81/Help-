'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const language = require('@google-cloud/language');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function analyseSentiment(agent) {
    const text = request.body.queryResult.queryText;
    
     const client = new language.LanguageServiceClient();
 
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Natural Language Processing
    return new Promise(function(resolve, reject) {
    	client.analyzeSentiment({document: document}).then(function([result]) {
     		const sentiment = result.documentSentiment;
      		console.log(`Text: ${text}`);
      		console.log(`Sentiment score: ${sentiment.score}`);
      
            if(sentiment.score > 0.3){
              agent.setFollowupEvent('good_sentiment_event');
            }else if(sentiment.score < -0){
              agent.setFollowupEvent('bad_sentiment_event');
            }else{
              agent.setFollowupEvent('neutral_sentiment_event');
            }
          	resolve("Stuff worked!");
	});
  });
  }
 function playAudio(assistant) {
  let text_to_speech = '<speak>'+ 'I can play a sound'+ '<audio src="https://actions.google.com/sounds/v1/ambiences/outdoor_summer_ambience.ogg">a digital watch alarm</audio>. ' + '</speak>';
  assistant.tell(text_to_speech);
}
  let intentMap = new Map();
  intentMap.set('DetectSentiment', analyseSentiment);
  intentMap.set('Default Fallback Intent', analyseSentiment);
  intentMap.set('music',playAudio);
  agent.handleRequest(intentMap);
});
