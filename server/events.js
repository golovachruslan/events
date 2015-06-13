Meteor.publish('Events', function (options, date) {

    console.log(date);

    date = date || moment().format('YYYY/MM/DD');

    return Events.find({date: date}, options);

});