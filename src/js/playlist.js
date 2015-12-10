'use strict';

// playlist fields:
//   * localId: id in our extension sync data
//   * remoteId: id in Google Music
//   * title
//   * rules: the query to find tracks with
//   * userId: Google Music user id
//   * sortBy
//   * sortByOrder
//   * limit

function ruleToString(rule) {
  // Return a string representation of a rule, parenthesised if necessary
  if (rule.name) {
    const operators = {'eq': '=', 'neq': '≠', 'lt': '<', 'lte': '≤', 'gt': '>', 'gte': '≥', 'match': 'matches'};
    return rule.name + ' ' + (operators[rule.operator] || rule.operator) + ' ' + rule.value;
  } else if (rule.all || rule.any) {
    const subRules = rule.all || rule.any;
    if (subRules.length === 1) {
      return ruleToString(subRules[0]);
    } else if (subRules.length > 1) {
      return '(' + subRules.map(r => ruleToString(r)).filter(s => s.length).join(rule.any ? ' or ' : ' and ') + ')';
    }
  }
  return '';
}

function lfOrderToString(lfOrder) {
  let str = 'ascending';
  if (lfOrder === 'DESC') {
    str = 'descending';
  }

  return str;
}

exports.toString = function toString(playlist) {
  return ruleToString(playlist.rules) + ' sort by ' + playlist.sortBy + ' ' + lfOrderToString(playlist.sortByOrder);
};