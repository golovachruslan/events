
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

  Meteor.subscribe('Events');

  app.controller('TodoCtrl', ['$scope', '$meteorCollection', '$ionicModal', '$rootScope', '$ionicSideMenuDelegate', '$ionicPopup', '$cordovaDatePicker',
    function ($scope, $meteorCollection, $ionicModal, $rootScope, $ionicSideMenuDelegate, $ionicPopup, $cordovaDatePicker) {

      $scope.Events = $meteorCollection(Events);

      $scope.search = {
        date:null
      };

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
      }

      //Cleanup the modal when we are done with it!
      $scope.$on('$destroy', function() {
        $scope.taskModal.remove();
      });

      $scope.toggleProjects = function () {
        $ionicSideMenuDelegate.toggleLeft();
      };

      $scope.setDate = function() {
        var options = {date: new Date(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function(date){
          $scope.search.date = date;
        });
      }

      $scope.pickDate = function(task) {
        var options = {date: new Date(), mode: 'date'};
        //var options = {date: new Date(), mode: 'time'}; for time
        $cordovaDatePicker.show(options).then(function(date){
          task.date = date;
        });
      }
    }
  ]);