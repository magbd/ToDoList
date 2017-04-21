'use strict';

(function(){

  var myApp = angular.module('myApp', []);

  myApp.directive('ngBlur', function(){
    return function(scope, elem, attrs){
      // détecte quand on sors du focus
      elem.bind('blur', function(){
        // $apply permet de lancer n'importe quelle fonction dans le scope controller
        // scope.$apply("editTodoName(todo)");
        scope.$apply(attrs.ngBlur);
      });
    };
  });

  myApp.controller('TodoCtrl', ['$scope', '$http', 'filterFilter', '$location', function ($scope, $http, filterFilter, $location){

    $scope.todolist = [];
    $scope.placeholder = 'Chargement ...';
    $scope.statusFilter = {};

    var refresh = function(){
      // renvoi les données de la base au tableau $scope.todolist = []
      $http.get('/todolist').success(function(response){
        $scope.todolist = response;
        $scope.placeholder = 'Saisir une nouvelle tâche ...'
        // $scope.todo.name ='';
      });
    };

    // $watch observe le comportement du tableau todolist ======================
    $scope.$watch('todolist', function(){
      //pour actualiser le nombre de tâches restantes :
      // avec un filtre en argument pour ne compter QUE ceux qui ne sont pas completed (=false)
      $scope.remaining = filterFilter($scope.todolist, {completed:false}).length;
      $scope.allchecked = !$scope.remaining; // si il reste 0 taches allchecked prend true (si tout est coché la checkbox globale est aussi cochée)
    }, true);

    refresh();

    // Gestion des filtres
    // $location permet de récupérer les URL grâce à la propriété path =========
    if ($location.path() == '') {$location.path('/')}
    $scope.location = $location;
    $scope.$watch('location.path()', function(path){
      console.log(path); //le paramètre path récupère le chemin de l'URL
      $scope.statusFilter =
      (path == '/active') ? {completed : false} : //affiche toutes les tâches qui ne sont pas completed (flase), sinon
      (path == '/done') ? {completed : true} : // affiche ttes les tâches qui sont completed (true), sinon
      {};
    });

    // fonction appellée au click du bouton destroy
    $scope.removeTodo = function(id){
      $http.delete('/todolist/' + id).success(function(response){
        refresh();
      });
    };

    // fonction appellée par ng-submit du form
    $scope.addTodo = function(){
      var data = {'name': $scope.todo.name, 'completed': false };
      $http.post('/todolist', data).success(function(response){
        refresh();
      });
      $scope.todo.name =''; //vide le champ input
    };

    $scope.updateCheck = function(todo){
      $http.put('/todolist/', todo).success(function(response){
        refresh();
      });
    };

    $scope.editTodoName = function(todo){
      todo.editing = false;
      $http.put('/todolist/', todo).success(function(response){
        refresh();
      });
    }

    $scope.checkAllTodo = function(allchecked){
      // boucle for each sur le tableau todolist
      $scope.todolist.forEach(function(todo){
        // completed prend true dans tout le tableau todolist
        todo.completed = allchecked;
      });
      var valeurAllCheck = {action: allchecked};
      $http.put('/todolist/check', valeurAllCheck).success(function(response){
        refresh();
      });
      $scope.remaining = allchecked ? $scope.todolist.length : 0;
    }

  }]);

})();
