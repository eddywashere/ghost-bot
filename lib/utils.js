const renderCodeBlock = response => {
  return '```\n' + response.trim() + '\n```';
};

const arrayToSentence = list => {
  if (list.length === 0) {
    return '';
  } else if (list.length === 1) {
    return list[0];
  }
  return list.slice(0, list.length - 1).join(', ') + ', and ' + list.slice(-1);
};

module.exports = {
  renderCodeBlock,
  arrayToSentence,
};
