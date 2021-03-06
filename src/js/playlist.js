const Track = require('./track.js');

// playlist fields:
//   * localId: id in our extension sync data
//   * remoteId: id in Google Music
//   * title
//   * rules: the query to find tracks with
//   * userId: Google Music user id
//   * sorts: [{sortBy, sortByOrder}]
//   * limit

function ruleToString(rule) {
  // Return a string representation of a rule, parenthesised if necessary
  if (rule.name) {
    const field = Track.fieldsByName[rule.name];
    // FIXME this is duplicated in playlist_editor
    const type = field.is_datetime ? 'datetime' : Track.lfToBusinessTypes[field.type];
    const operators = Track.operators[type];
    const operator = operators.filter(o => o.name === rule.operator)[0];
    return `${field.label} ${operator.label} ${JSON.stringify(rule.value)}`;
  } else if (rule.all || rule.any) {
    const subRules = rule.all || rule.any;
    if (subRules.length === 1) {
      return ruleToString(subRules[0]);
    } else if (subRules.length > 1) {
      const subRulesStr = subRules.map(r => ruleToString(r)).filter(s => s.length).join(rule.any ? ' or ' : ' and ');
      return `(${subRulesStr})`;
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

function sortToString(sort) {
  return `${sort.sortBy} ${lfOrderToString(sort.sortByOrder)}`;
}

exports.toString = function toString(playlist) {
  const sorts = playlist.sorts.map(sortToString).join(', ');

  return `${ruleToString(playlist.rules)} sort by ${sorts}`;
};

function involvedFieldNames(rule) {
  // Return an object mapping field names to true for any fields involved in this rule.
  const fieldNames = {};


  if (rule.name) {
    fieldNames[rule.name] = true;
  } else if (rule.all || rule.any) {
    const subRules = rule.all || rule.any;
    const allSubFieldNames = subRules.map(involvedFieldNames);

    for (let i = 0; i < allSubFieldNames.length; i++) {
      for (const fieldName in allSubFieldNames[i]) {
        fieldNames[fieldName] = true;
      }
    }
  }
  return fieldNames;
}

exports.involvedFields = function involvedFields(playlist) {
  // Return an object mapping field names to true for any fields involved in this playlist.
  const fieldNames = involvedFieldNames(playlist.rules);
  for (let i = 0; i < playlist.sorts.length; i++) {
    fieldNames[playlist.sorts[i].sortBy] = true;
  }

  return fieldNames;
};
