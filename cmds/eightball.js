const COMMAND_NAME = 'eightball';
const botBuilder = require('claudia-bot-builder');
const slackTemplate = botBuilder.slackTemplate;
// from https://github.com/github/hubot-scripts/blob/master/src/scripts/eight-ball.coffee
const ball = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes – definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Signs point to yes",
  "Yes",
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful"
];

const command = {
  command: `${COMMAND_NAME} <repo>`,
  description: 'The Magic Eight ball',
  builder: yargs => {
    return yargs
      .reset()
      .usage(`Usage: /ghost ${COMMAND_NAME} "<query>"`)
      .example(`/ghost ${COMMAND_NAME} "is it going to rain today?"`)
      .strict()
      .help();
  },
  handler: argv => {
    const { resolve }  = argv;
    const response = ball[Math.floor(Math.random() * ball.length)];
    return resolve(response);
  }
};

module.exports = command;
