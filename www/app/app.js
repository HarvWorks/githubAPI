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

myApp.factory('usersFactory', ($http) => {
    let factory = {};
    factory.pageNum = (pageInput, maxPage, pageNum) => {
        if (pageInput === '...') {
            pageNum = 'popUp';
        } else if (pageInput === 'previous') {
            if (pageNum > 1) {
                pageNum--;
            } else {
                pageNum = null;
            }
        } else if (pageInput === 'next') {
            if (pageNum < maxPage) {
                pageNum++;
            } else {
                pageNum = null;
            }
        } else {
            pageNum = pageInput;
        }
        return pageNum;
    };
    factory.pagination = (maxPage, pageNum) => {
        const pageArr = [{'page': 'previous', 'active': ''}];
        let firstIter = 1;
        let lastIter = maxPage;
        if (maxPage > 15) {
            if (pageNum > 7) {
                firstIter = pageNum - 5;
                pageArr.push({'page': 1, 'active': ''});
                pageArr.push({'index': 'left', 'page': '...', 'active': ''});
            }
            if (pageNum < maxPage - 7) {
                lastIter = pageNum + 5;
            } else {
                lastIter = maxPage;
                firstIter = maxPage - 13;
            }
            if (pageNum < 7) {
                lastIter = 13;
            }
        }
        for (let i = firstIter; i <= lastIter; i++) {
            let active = '';
            if (i === pageNum) {
                active = 'active';
            }
            pageArr.push({'page': i, active});
        }
        if (maxPage > 15 && pageNum < maxPage - 7) {
            pageArr.push({'index': 'right', 'page': '...', 'active': ''});
            pageArr.push({'page': maxPage, 'active': ''});
        }
        pageArr.push({'page': 'next', 'active': ''});
        return pageArr;
    };
    factory.findUser = (user, callback, ifSearch = 0) => {
        const url = 'https://api.github.com/users/' + user;
        factory.recieveData(url, callback, ifSearch);
    };
    factory.findUsers = (searchTerm, pageNumber, callback) => {
        const url = 'https://api.github.com/search/users?q=' + searchTerm + ' in:login&page=' + pageNumber + '&per_page=30+type=user';
        factory.recieveData(url, callback, 1, searchTerm);
    };
    factory.findRepos = (url, pageNumber, callback) => {
        url += '?page=' + pageNumber;
        factory.recieveData(url, callback);
    };
    factory.recieveData = (url, callback, ifSearch = 0, searchTerm = '') => {
        if (self.fetch) {
            fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(function (json) {
                    if (!json.incomplete_results) {
                        if (ifSearch === 2) {
                            return callback({'items':[json]}, true);
                        } else {
                            return callback(json);
                        }
                    }
                    throw new Error('JSON object is not complete');
                })
                .catch(function (error) {
                    if (ifSearch === 1) {
                        factory.findUser(searchTerm, callback, 2);
                    } else {
                        console.log('There has been a problem with your fetch operation: ' + error.message);
                        return callback();
                    }
                });
        } else {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = () => {
                const status = xhr.status;
                if (status === 200) {
                    if (ifSearch === 2) {
                        return callback({'items': [xhr.response]}, true);
                    } else {
                        return callback(xhr.response);
                    }
                } else {
                    console.log('breakign');
                    if (ifSearch === 1) {
                        console.log('working');
                        factory.findUser(searchTerm, callback, 2);
                    } else {
                        callback(status);
                    }
                }
            };
            xhr.send();
        }
    };
    return factory;
});

// This is the controller for the user Profile pageArr
myApp.controller('userController', ['$scope', 'usersFactory', '$routeParams', '$cookies', '$location', function ($scope, usersFactory, $routeParams, $cookies, $location) {
    let pageNum = 1;
    let maxPage = 1;
    $scope.findUser = () => {
        usersFactory.findUser($routeParams.userName, (user) => {
            $scope.user = user;
            $scope.anotherPage(parseInt(pageNum, 10));
        });
    };
    $scope.findRepos = (pageNum = 1) => {
        usersFactory.findRepos($scope.user.repos_url, pageNum, (repos) => {
            maxPage = Math.ceil(Math.min($scope.user.public_repos, 1000) / 30);
            const pageArr = usersFactory.pagination(maxPage, pageNum);
            $scope.pages = pageArr;
            $scope.repos = repos;
            $scope.$apply();
        });
    };
    $scope.anotherPage = (pageInput = 1) => {
        const tempPageNum = usersFactory.pageNum(pageInput, maxPage, pageNum);
        if (tempPageNum) {
            if (tempPageNum === 'popUp') {
                $scope.pagePicker = {'in': 'in', 'display': 'display:block'};
                $scope.maxPage = maxPage;
            } else {
                $cookies.put('repoPageNum', tempPageNum);
                pageNum = tempPageNum;
                document.body.scrollTop = document.documentElement.scrollTop = 310;
                $scope.findRepos(pageNum);
            }
        }
    };
    $scope.pickPage = () => {
        // To make sure pageNum is an interger
        let tempPage = parseInt($scope.page, 10);
        if (tempPage > maxPage) {
            tempPage = maxPage;
        } else if (tempPage < 1) {
            tempPage = 1;
        }
        $scope.page = ''
        $scope.anotherPage(tempPage);
        $scope.closePagePicker();
    };
    $scope.closePagePicker = () => {
        $scope.pagePicker = {'in': '', 'display': 'display:none'};
    };
    $scope.pickPageEnter = (keyPress) => {
        if (keyPress.which === 13) {
            $scope.pickPage()
        }
    }
    $scope.loadPage = () => {
        if ($cookies.get('repoPageNum')) {
            pageNum = $cookies.get('repoPageNum');
            console.log(pageNum);
        }
    };
    $scope.loadPage();
    $scope.findUser();
}]);

// This is the one controller of this app using angular.
myApp.controller('usersController', ['$scope', 'usersFactory', '$routeParams', '$cookies', '$location', function ($scope, usersFactory, $routeParams, $cookies, $location) {
    let pageNum = 1;
    let maxPage = 1;
    let currentSearch = '';
    let searchComparer = (searchTerm) => {
        if (currentSearch.length > searchTerm.length || currentSearch.length <= 1) {
            return true;
        } else {
            for (let i = 0; i < currentSearch.length; i++) {
                if (currentSearch[i] !== searchTerm[i]) {
                    return true;
                }
            }
            return false;
        }
    };
    $scope.findUsers = (pageNum = 1) => {
        if ($scope.searchTerm) {
            const searchTerm = $scope.searchTerm;
            if (maxPage > 1 || searchComparer(searchTerm)) {
                $cookies.put('pageNum', pageNum)
                $cookies.put('searchTerm', searchTerm);
                usersFactory.findUsers(searchTerm, pageNum, (data, needReload = false) => {
                    if (data) {
                        maxPage = Math.ceil(Math.min(data.total_count, 1000) / 30);
                        const pageArr = usersFactory.pagination(maxPage, pageNum);
                        if (needReload) {
                            maxPage = 5;
                        }
                        $scope.users = data.items;
                        $scope.pages = pageArr;
                        $scope.$apply();
                    } else {
                        $scope.users = 'err';
                    }
                    currentSearch = searchTerm;
                });
            };
        } else {
            $scope.users = [];
            $cookies.put('searchTerm', '');
        }
    };
    $scope.anotherPage = (pageInput = 1) => {
        const tempPageNum = usersFactory.pageNum(pageInput, maxPage, pageNum);
        if (tempPageNum) {
            if (tempPageNum === 'popUp') {
                $scope.pagePicker = {'in': 'in', 'display': 'display:block'};
                $scope.maxPage = maxPage;
            } else {
                pageNum = tempPageNum;
                document.body.scrollTop = document.documentElement.scrollTop = 0;
                $scope.findUsers(pageNum);
            }
        }
    };
    $scope.pickPage = () => {
        // To make sure pageNum is an interger
        let tempPage = parseInt($scope.page, 10);
        if (tempPage > maxPage) {
            tempPage = maxPage;
        } else if (tempPage < 1) {
            tempPage = 1;
        }
        $scope.page = ''
        $scope.anotherPage(tempPage);
        $scope.closePagePicker();
    };
    $scope.loadPage = () => {
        $scope.searchTerm = $cookies.get('searchTerm');
        if ($cookies.get('pageNum')) {
            pageNum = $cookies.get('pageNum');
        }
    };
    $scope.closePagePicker = () => {
        $scope.pagePicker = {'in': '', 'display': 'display:none'};
    };
    $scope.pickPageEnter = (keyPress) => {
        if (keyPress.which === 13) {
            $scope.pickPage()
        }
    };
    $scope.profilePage = (user) => {
        $cookies.put('repoPageNum', 1);
        $location.url('/user/' + user);
    };
    $scope.loadPage();
    $scope.findUsers(parseInt(pageNum, 10));
}]);
