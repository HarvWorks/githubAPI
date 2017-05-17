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
