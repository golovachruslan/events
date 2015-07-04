
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

  app.run(function($ionicPlatform) {

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

    });

  }).config(['$urlRouterProvider', '$stateProvider',
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
    function ($scope, $meteorCollection, $ionicModal, 
      $rootScope, $ionicPopup, $cordovaDatePicker, $meteor, $ionicLoading, $timeout) {

      $scope.search = {
        query: '',
        date: moment(new Date()).format('YYYY/MM/D'),
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

      $scope.login = function() {

        $meteor.loginWithFacebook(
          {
              loginStyle:'popup',
              requestPermissions : [
              "email",
              "public_profile", 
              "user_friends"
              ]
            
          });

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

      $scope.save = function() {

      };

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.eventModal.remove();
      });

      $scope.setDate = function() {
        var options = {date: moment($scope.modalData.date,'YYYY/MM/D').toDate(), mode: 'date', allowOldDates: false};
        $cordovaDatePicker.show(options).then(function (date) {
          $scope.modalData.date = moment(date).format('YYYY/MM/D');
        });
      };

      $scope.showFilters = function () {
        $scope.modalData = angular.copy($scope.search);
        $scope.eventModal.show();
      };

      $scope.showMap = function () {

        var map = plugin.google.maps.Map.getMap();

        map.clear();

        map.setOptions({
          backgroundColor: 'white',
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

        map.setAllGesturesEnabled(true);

        map.showDialog();

        map.addEventListener(plugin.google.maps.event.MAP_READY, function () {

              var coordinates = [],
                  bounds = new plugin.google.maps.LatLngBounds();

              _.each($scope.Events, function (item) {

                  var geo = item.geo;

                  if (geo) {

                      var cc = new plugin.google.maps.LatLng(geo.latitude, geo.longitude);

                      map.addMarker({
                          //'icon': "http://cdn.1001freedownloads.com/icon/thumb/371594/Map-Marker-Flag-4-Left-Pink-icon.png",
                          'position': cc,
                          //'animation': plugin.google.maps.Animation.BOUNCE,
                          'title': item.title,
                          'snippet': item.description,
                          'styles': {
                              'font-style': 'italic',
                              'font-weight': 'bold'
                          }
                      }, function (marker) {

                          //marker.showInfoWindow();

                      });

                      coordinates.push(cc);

                      bounds.extend(cc);
                  }

              });

              map.moveCamera({
                  'target': bounds.getCenter(),
                  'zoom': 8
              }, function () {

              });

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