
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
    function ($scope, $meteorCollection, $ionicModal, $rootScope, $ionicPopup, $cordovaDatePicker, $meteor, $ionicLoading) {

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

      $scope.applyFilters = function () {
        angular.copy($scope.modalData, $scope.search);
        $scope.eventModal.hide();
        $scope.showLoading(true);
      };

      $scope.closeNewTask = function() {
        $scope.eventModal.hide();
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