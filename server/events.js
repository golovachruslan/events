Meteor.publish('Events', function (options, search) {

    var query = search ? search.query : '',
        date = search ? search.date : moment(new Date()).format('YYYY/MM/DD');

    date = date || moment().format('YYYY/MM/DD');

    return Events.find({
        'title': {'$regex': '.*' + (query || '') + '.*', '$options': 'i'},
        $and: [{date: date}]
    }, options);

});