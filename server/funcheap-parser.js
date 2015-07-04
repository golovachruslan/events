Meteor.startup(function () {

    var jsdom = Meteor.npmRequire('jsdom'),
        async = Meteor.npmRequire('async');

    var Future = Npm.require('fibers/future');

    var geo = new GeoCoder();

    var parseEvent = function (event) {

        var futParseEvent = new Future();

        var parseEventCallback = Meteor.bindEnvironment(function (errors, window) {

            var description = window.$('.entry-content-description p').eq(0).text();

            event.description = description;

            var address = window.$('.entry-header .venue').text().split('|');
            address = address.pop();

            event.address = address;

            if (event.address) {

                var result = geo.geocode(event.address);

                event.geo = result.length ? result[0] : null;

            }

            Meteor.call('saveEvent', event);

            futParseEvent.return(null);

        });

        jsdom.env(
            {
                scripts: ["http://code.jquery.com/jquery.js"],
                url: event.link,
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.8,ru;q=0.6",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Cookie": "optimizelyEndUserId=oeu1414013314670r0.3393529837485403; __qca=P0-581024923-1414013318089; __gads=ID=d9d71a9a1ec663dd:T=1414013319:S=ALNI_MYJky8o8Kg5hjdlqbUjlJDRdhHhhQ; __smSubscribed=true; __utma=214250965.1017830577.1414013317.1425708898.1425842623.29; __utmz=214250965.1422120341.23.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); optimizelySegments=%7B%7D; optimizelyBuckets=%7B%7D; _ga=GA1.2.1017830577.1414013317; _gat=1; __smToken=HiFlastGJyWXzZsJZdsPI9nv",
                    "Host": "sf.funcheap.com",
                    "Pragma": "no-cache",
                    //"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36"
                    "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.4; en-us; Nexus 4 Build/JOP40D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36"
                },
                done: function (errors, window) {

                    parseEventCallback(errors, window);

                }
            }
        );

        futParseEvent.wait();

    };

    var downloadEvents = function (date, link) {

        var futDownloadEvents = new Future(),
            events = [];

        var downloadEventsCallback = Meteor.bindEnvironment(function (errors, window) {

            console.log('Events for ' + date + ' count: ' + window.$("article").length);

            window.$("article").each(function (index, item) {

                var $item = window.$(item);

                var event = {
                    title: $item.find('.entry-title').text(),
                    link: $item.find('.post-thumbnail').attr('href'),
                    date: date,
                    uid: $item.attr('id'),
                    time: $item.find('.date-time span').text(),
                    image: $item.find('.post-thumbnail img').attr('src'),
                    cost: $item.find('.cost').text(),
                    region: $item.find('.region').text(),
                    startTime: null,
                    endTime: null,
                    address:null,
                    geo:null,
                    categories: [],
                    description: null
                };

                events.push(event);

            });

            _.each(events, function (link) {
                parseEvent(link);
            });

            if (window.$('.next.page-numbers').length) {
                downloadEvents(date, window.$('.next.page-numbers').attr('href'));
            }

            futDownloadEvents.return(null);

        });

        jsdom.env(
            {
                scripts: ["http://code.jquery.com/jquery.js"],
                url: link ? link : "http://sf.funcheap.com/" + date + "/",
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.8,ru;q=0.6",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Cookie": "optimizelyEndUserId=oeu1414013314670r0.3393529837485403; __qca=P0-581024923-1414013318089; __gads=ID=d9d71a9a1ec663dd:T=1414013319:S=ALNI_MYJky8o8Kg5hjdlqbUjlJDRdhHhhQ; __smSubscribed=true; __utma=214250965.1017830577.1414013317.1425708898.1425842623.29; __utmz=214250965.1422120341.23.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); optimizelySegments=%7B%7D; optimizelyBuckets=%7B%7D; _ga=GA1.2.1017830577.1414013317; _gat=1; __smToken=HiFlastGJyWXzZsJZdsPI9nv",
                    "Host": "sf.funcheap.com",
                    "Pragma": "no-cache",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.4; en-us; Nexus 4 Build/JOP40D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36"
                },
                done: function (errors, window) {

                    downloadEventsCallback(errors, window);

                }
            }
        );

        futDownloadEvents.wait();

    };

    /*downloadEvents('2015/06/14');

    downloadEvents('2015/06/15');

    downloadEvents('2015/06/16');*/

    //downloadEvents('2015/07/4');

});