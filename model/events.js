Events = new Meteor.Collection("Events");

Ground.Collection(Events);

Meteor.methods({
    saveEvent: function (event) {

        var e = Events.findOne({uid: event.uid});

        if (!e) {
            Events.insert(event);
        }

    }
});

Events.allow({
    insert: function (userId, event) {
        return true;
    },
    update: function () {
        return true;
    },
    remove: function () {
        return true;
    }
});