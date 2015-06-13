
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

    $urlRouterProvider.otherwise("/tabs");

    $stateProvider
      .state('tabs', {
        url : '/tabs',
        templateUrl: 'index.ng.html',
        controller: 'TodoCtrl'
      });
  }]);

  app.controller('TodoCtrl', ['$scope', '$meteorCollection', '$ionicModal', '$rootScope', '$ionicSideMenuDelegate', '$ionicPopup', '$cordovaDatePicker','$meteor',
    function ($scope, $meteorCollection, $ionicModal, $rootScope, $ionicSideMenuDelegate, $ionicPopup, $cordovaDatePicker, $meteor) {

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

      $scope.newEvent = function () {
        $scope.task = {};
        $scope.eventModal.show();
      };

      $scope.closeNewTask = function() {
        $scope.eventModal.hide();
      };

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.taskModal.remove();
      });

      $scope.toggleProjects = function () {
        $ionicSideMenuDelegate.toggleLeft();
      };

      $scope.setDate = function() {
        var options = {date: moment($scope.date,'YYYY/MM/DD').toDate(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function (date) {
          $scope.date = moment(date).format('YYYY/MM/DD');
        });
      };

      $scope.pickDate = function(task) {
        var options = {date: new Date(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function(date){
          task.date = date;
        });
      }
    }
  ]);