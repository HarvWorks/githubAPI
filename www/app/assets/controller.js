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
