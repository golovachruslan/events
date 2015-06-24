
  var app = angular.module('app.example', [
    'angular-meteor',
    'ui.router',
    'ionic',
    'ngCordova.plugins.datePicker']);

  function onReady() {
    angular.bootstrap(document, ['app.example']);
  }

  if (Meteor.isCordova) {
    angular.element(document).on("deviceready", onReady);
  }
  else {
    angular.element(document).ready(onReady);
  }

  app.config(['$urlRouterProvider', '$stateProvider',
    function($urlRouterProvider, $stateProvider){

    $urlRouterProvider.otherwise("/tab/events");

    $stateProvider
      .state('tabs', {
          url: "/tab",
          abstract: true,
          templateUrl: 'client/index.ng.html'
      })
      .state('tabs.events', {
        url : '/events',
          views: {
            'events-tab': {
              templateUrl: 'client/events.ng.html',
              controller: 'EventsCtrl'
            }
          }
      })
      .state('tabs.event', {
          url: '/event/:id',
          views: {
            'events-tab': {
              templateUrl: 'client/event.ng.html',
              controller:'EventCtrl'
            }
          }
        });
  }]);

  app.controller('EventsCtrl',
    function ($scope, $meteorCollection, $ionicModal, $rootScope, $ionicPopup, $cordovaDatePicker, $meteor, $ionicLoading, $timeout) {

      $scope.search = {
        query: '',
        date: moment(new Date()).format('YYYY/MM/DD'),
        onlyFree: false
      };

      $scope.sort = { title: 1 };

      $scope.Events = $meteor.collection(function() {
        return Events.find({}, {
          sort : $scope.getReactively('sort')
        });
      });

      $scope.showLoading = function (flag) {
        $scope.loading = flag;
      };

      $scope.showLoading(true);

      $meteor.autorun($scope, function () {
        $meteor.subscribe('Events', {
          sort: $scope.getReactively('sort')
        }, $scope.getReactively('search', true)).finally(() => $scope.showLoading(false));
      });

      // Create our modal
      $ionicModal.fromTemplateUrl('client/filters.ng.html', function (modal) {

        $scope.eventModal = modal;

      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.applyFilters = function () {
        angular.copy($scope.modalData, $scope.search);
        $scope.eventModal.hide();
        $scope.showLoading(true);
      };

      $scope.closeFilters = function() {
        $scope.eventModal.hide();
      };

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.eventModal.remove();
      });

      $scope.setDate = function() {
        var options = {date: moment($scope.modalData.date,'YYYY/MM/DD').toDate(), mode: 'date', allowOldDates: false};
        $cordovaDatePicker.show(options).then(function (date) {
          $scope.modalData.date = moment(date).format('YYYY/MM/DD');
        });
      };

      $scope.showFilters = function () {
        $scope.modalData = angular.copy($scope.search);
        $scope.eventModal.show();
      };

      $scope.showMap = function () {


        if(window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        var map = plugin.google.maps.Map.getMap();

        map.clear();

        map.setZoom(9);

        map.setOptions({
          mapType: plugin.google.maps.MapTypeId.ROADMAP,
          controls: {
            'compass': true,
            'myLocationButton': true,
            'indoorPicker': true,
            'zoom': true // Only for Android
          },
          'gestures': {
            'scroll': true,
            'tilt': false,
            'rotate': true,
            'zoom': true
          }
        });


        var getCenterOfCoordinates = function (geoCoordinates) {

            if (geoCoordinates.length == 1) {
                return geoCoordinates[0];
            }

            var x = 0;
            var y = 0;
            var z = 0;

            _.each(geoCoordinates, function (geoCoordinate) {
                var latitude = geoCoordinate.lat * Math.PI / 180;
                var longitude = geoCoordinate.lng * Math.PI / 180;

                x += Math.cos(latitude) * Math.cos(longitude);
                y += Math.cos(latitude) * Math.sin(longitude);
                z += Math.sin(latitude);
            });

            var total = geoCoordinates.length;

            x = x / total;
            y = y / total;
            z = z / total;

            var centralLongitude = Math.atan2(y, x);
            var centralSquareRoot = Math.sqrt(x * x + y * y);
            var centralLatitude = Math.atan2(z, centralSquareRoot);
            return new plugin.google.maps.LatLng(centralLatitude * 180 / Math.PI, centralLongitude * 180 / Math.PI);

        };

        map.setAllGesturesEnabled(true);

        map.showDialog();

        map.addEventListener(plugin.google.maps.event.MAP_READY, function() {

            coordinates = [];

          _.each($scope.Events, function (item) {

            var geo = item.geo;

            if(geo) {

                var cc = new plugin.google.maps.LatLng(geo.latitude, geo.longitude);

                map.addMarker({
                  'position': cc,
                  'title': item.title
                }, function (marker) {

                  marker.showInfoWindow();

                });

                coordinates.push(cc);
            }

          });

          var t = getCenterOfCoordinates(coordinates);
          map.setCenter(t);

        });
      };

      $scope.formatDate = function (date) {
        return moment(date, "YYYY/MM/DD").format("dddd, MMMM Do");
      };

    }
  );

  app.controller('EventCtrl',
      function ($scope, $meteorCollection, $rootScope, $meteor, $stateParams) {

        $scope.event = $meteor.object(Events, $stateParams.id);

        $scope.getDate = function () {
          return moment($scope.event.date, "YYYY/MM/DD").format("dddd, MMMM Do");
        }

      }
  );