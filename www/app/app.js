// Declaration of myapp as an initalization of Angular
const myApp = angular.module('myApp', ['ngRoute', 'ngCookies']);

myApp.config(($routeProvider, $locationProvider) => {
	$routeProvider
	.when('/', {
		templateUrl: '../partials/index.html',
		controller: 'usersController'
	})
    .when('/user/:userName', {
		templateUrl: '../partials/profile.html',
		controller: 'userController'
	})
	.otherwise({
		redirectTo: '/'
	});
    // couldn't get the server to rewrite the paths so no html5mode for locationProvider
	// $locationProvider.html5Mode(true);
});
