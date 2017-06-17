const _ = require('lodash');
const AWS = require('aws-sdk');
const botBuilder = require('claudia-bot-builder');
const slackTemplate = botBuilder.slackTemplate;
const lambda = new AWS.Lambda();
const slackDelayedReply = botBuilder.slackDelayedReply;
const command = require('./command');
const parser = require('yargs-parser');

const api = botBuilder(
  (message, apiRequest) => {
    const dave = _.get(message, 'originalRequest.user_name', 'dave');
    const text = _.get(message, 'originalRequest.text', _.get(message, 'text'));
    const baseCommand =
      parser(text)['_'][0] && parser(text)['_'][0].toLowerCase();

    return lambda
      .invoke({
        FunctionName: apiRequest.lambdaContext.functionName,
        InvocationType: 'Event',
        Payload: JSON.stringify({ slackEvent: message }),
        Qualifier: apiRequest.lambdaContext.functionVersion
      })
      .promise()
      .then(data => {
        return {
          response_type: 'in_channel'
        };
      })
      .catch(err => {
        console.error('initial response error', err);
        return {
          response_type: 'in_channel',
          text: err.toString()
        };
      });
  },
  { platforms: ['slackSlashCommand'] }
);

api.intercept(event => {
  if (!event.slackEvent) {
    return event;
  }

  const text = _.get(
    event.slackEvent,
    'slackEventoriginalRequest.text',
    _.get(event.slackEvent, 'text')
  );
  return command(text, event)
    .then(response => {
      return slackDelayedReply(
        event.slackEvent,
        response || '[RESPONSE_ERROR]: Missing Response'
      );
    })
    .catch(error => console.error('[SLACK_ERROR]', error))
    .then(() => false);
});

module.exports = api;
