const fetch = require('node-fetch');
const COMMAND_NAME = 'github';
const botBuilder = require('claudia-bot-builder');
const slackTemplate = botBuilder.slackTemplate;
const command = {
  command: `${COMMAND_NAME} <repo>`,
  description: 'fetch github repo info',
  builder: yargs => {
    return yargs
      .reset()
      .usage(`Usage: /ghost ${COMMAND_NAME} <repo>`)
      .example(`/ghost ${COMMAND_NAME} twbs/bootstrap`)
      .strict()
      .help();
  },
  handler: argv => {
    const { repo, resolve, reject, slackEvent } = argv;
    const [user, project] = repo.split('/');

    const handleResponse = data => {
      const {
        message,
        stargazers_count,
        watchers_count,
        language,
        forks_count,
        description,
        homepage,
        owner
      } = data;

      // check if repo exists
      if (message === 'Not Found') {
        return `${repo}: ${message}`
      }

      if (slackEvent) {
        const response = new slackTemplate('');

        response
          .channelMessage(true)
          .addAttachment('A1')
          .addAuthor(user, owner.avatar_url)
          .addTitle(repo, `https://github.com/${repo}`)
          .addField('Language', language, true)
          .addField('Forks', forks_count, true)
          .addField('Stargazers', stargazers_count, true)
          .addField('Watchers', watchers_count, true)
          .addColor('#2ab27b')

        if (description) {
          response.addText(description);
        }

        return response.get();
      }

      return `${repo} - ${description}\nLanguage: ${language}, Forks: ${forks_count}, Stars: ${stargazers_count}, Watchers: ${watchers_count}`;
    };

    const getRepoInfo = fetch(`https://api.github.com/repos/${user}/${project}`)
      .then(res => res.json())
      .then(handleResponse)
      .catch(err => `Error: ${err.toString()}`);

    return resolve(getRepoInfo);
  }
};

module.exports = command;
