const _ = require('lodash');
const yargs = require('yargs');
const YargsPromise = require('yargs-promise');
const {renderCodeBlock} = require('./lib/utils');
const pkg = require('./package.json');

yargs.env('GHOST_BOT');

// update string templates
yargs.updateStrings({
  'Unknown argument: %s': {
    one: 'Error: [%s] is not a valid argument',
    other: 'Error: [%s] are not valid arguments',
  },
});

// load commands in ./cmds/*
yargs.commandDir('./cmds');

// default usage and help
yargs
  .usage(
    'Usage: \n  /ghost <command> <subcommand> [--parameters]' +
      '\n\nFor help with specific commands, use:' +
      '\n  /ghost <command> --help'
  )
  .version(() => pkg.version)
  .alias('V', 'version')
  .help('h')
  .alias('h', 'help')
  .strict()
  .recommendCommands();
// .epilogue('Need additional help? Checkout the docs at https://bexar.io/docs');

// command wrap yargs-promise to always return slack formatted object
// ^ it's easier to format slack response objects in command handlers
// and use the cli version of bot to return slackResponse.text
const command = (msg, event = {}) => {
  const {slackEvent} = event;
  const parser = new YargsPromise(yargs, { slackEvent });

  return parser
    .parse(msg)
    .then(({data, argv}) => {
      // if response data is a string
      // apply default formatting
      if (_.isString(data)) {
        return {
          text: data,
          response_type: 'in_channel',
        };
      }
      return data;
    })
    .catch(({error, argv}) => {
      // command handler errors should be caught and
      // should instead resolve a friendly help message
      // if that doesn't happen, this is a generic catch all
      const text = _.get(error, 'message', error.toString());

      // log errors in lambda
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.error('[ERROR] Parsing command', error, argv);
      }
      return {
        text,
        response_type: 'ephemeral',
      };
    });
};

module.exports = command;
