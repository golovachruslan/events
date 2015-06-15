
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
      });
  }]);

  app.controller('EventsCtrl',
    function ($scope, $meteorCollection, $ionicModal, $rootScope, $ionicPopup, $cordovaDatePicker, $meteor) {

      $scope.date = moment(new Date()).format('YYYY/MM/DD');

      $scope.Events = $meteorCollection(Events);

      $meteor.autorun($scope, function() {
        $meteor.subscribe('Events',{}, $scope.getReactively('date'));
      });

      // Create our modal
      $ionicModal.fromTemplateUrl('client/new-task.ng.html', function (modal) {
        $scope.eventModal = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.closeNewTask = function() {
        $scope.eventModal.hide();
      };

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.eventModal.remove();
      });

      $scope.setDate = function() {
        var options = {date: moment($scope.date,'YYYY/MM/DD').toDate(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function (date) {
          $scope.date = moment(date).format('YYYY/MM/DD');
        });
      };

      $scope.newEvent = function () {
        $scope.task = {};
        $scope.eventModal.show();
      };

      $scope.pickDate = function(task) {
        var options = {date: new Date(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function(date){
          task.date = date;
        });
      }
    }
  );