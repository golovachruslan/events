Meteor.publish('Events', function (options, search) {

    var query = search ? search.query : '',
        date = search ? search.date : moment(new Date()).format('YYYY/MM/DD'),
        onlyFree = search ? search.onlyFree : false;

    date = date || moment().format('YYYY/MM/DD');

    var qq = {
        'title': {'$regex': '.*' + (query || '') + '.*', '$options': 'i'},
        '$and': [{date: date}]
    };

    if (onlyFree) {
        qq['$and'].push({cost: 'FREE'});
    }

    console.log('search: ' + JSON.stringify(qq));

    return Events.find(qq, options);

});