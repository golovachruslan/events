
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
        .state('tabs.map', {
          url : '/map',
          views: {
            'events-tab': {
              templateUrl: 'client/map.ng.html',
              controller: 'MapCtrl'
            }
          }
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
        /*if (flag) {
          $ionicLoading.show({
            template: '<ion-spinner icon="ripple"></ion-spinner>',
            noBackdrop: true
          });
        } else {
          $ionicLoading.hide();
        }*/

        $scope.loading = flag;
      };

      $scope.showLoading(true);

      $meteor.autorun($scope, function () {
        $meteor.subscribe('Events', {
          sort: $scope.getReactively('sort')
        }, $scope.getReactively('search', true)).finally(function () {
          $scope.showLoading(false);
        });
      });

      // Create our modal
      $ionicModal.fromTemplateUrl('client/filters.ng.html', function (modal) {

        $scope.eventModal = modal;

      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $ionicModal.fromTemplateUrl('client/map.ng.html', function (modal) {

        $scope.mapModal = modal;

      }, {
        scope: $scope,
        //controller: 'MapCtrl',
        animation: 'slide-in-up'
      });

      $scope.applyFilters = function () {
        angular.copy($scope.modalData, $scope.search);
        $scope.eventModal.hide();
        $scope.showLoading(true);
      };

      $scope.closeNewTask = function() {
        $scope.eventModal.hide();
      };

      $scope.closeMap = function() {
        $scope.mapModal.hide();
      };

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.eventModal.remove();
      });

      $scope.setDate = function() {
        var options = {date: moment($scope.modalData.date,'YYYY/MM/DD').toDate(), mode: 'date', allowOldDates: false};
        //var options = {date: new Date(), mode: 'time'}; for time
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

        //$scope.mapModal.show();

         /* var div = document.getElementById("map_canvas");
          var map = plugin.google.maps.Map.getMap(div);*/

        var map = plugin.google.maps.Map.getMap();

        map.clear();

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

        var geo = $scope.Events[0].geo;

        var cc = new plugin.google.maps.LatLng(geo.latitude, geo.longitude);
        map.setCenter(cc);

        map.setAllGesturesEnabled(true);

        map.showDialog();

        map.addEventListener(plugin.google.maps.event.MAP_READY, function() {

          _.each($scope.Events, function (item) {

            var geo = item.geo;
            var cc = new plugin.google.maps.LatLng(geo.latitude, geo.longitude);

            map.addMarker({
              'position': cc,
              'title': item.title
            }, function (marker) {

              marker.showInfoWindow();

            });


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

  app.controller('MapCtrl',
      function ($scope, $meteorCollection, $rootScope, $meteor, $stateParams, $timeout) {

        $timeout(function () {

          var div = document.getElementById("map_canvas");
          var map = plugin.google.maps.Map.getMap(div);

          $scope.$on('$destroy', function() {
            alert(1);
          });

          map.setOptions({
            mapType: plugin.google.maps.MapTypeId.ROADMAP,
            controls: {
              compass: true,
              myLocationButton: true
            },
            gestures: {
              scroll: true,
              tilt: true,
              rotate: true,
              zoom: true
            }
          });

          map.refreshLayout();

        },2000);

      }
  );