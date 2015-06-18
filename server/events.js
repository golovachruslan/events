Meteor.publish('Events', function (options, search) {

    var query = search ? search.query : '',
        date = search ? search.date : moment(new Date()).format('YYYY/MM/DD');

    date = date || moment().format('YYYY/MM/DD');

    var qq = {
        'title': {'$regex': '.*' + (query || '') + '.*', '$options': 'i'},
        '$and': [{date: date}]
    };

    if (search.onlyFree) {
        qq['$and'].push({cost: 'FREE'});
    }

    return Events.find(qq, options);

});