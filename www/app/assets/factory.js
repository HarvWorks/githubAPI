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
