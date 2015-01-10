var R = rijndael();

var directiveBuilder = function (keyname) {
    var nullValue = [0,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    var _keyname = keyname;
    return function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                /*
                 * Force fresh decryptions when keys change.
                 */
                // TODO instead of referencing scope.data.var1,
                // use the dotted contents of attr.ngModel ("data.var1")
                // so that this will also work with var2.
                scope.$watch(function() {
                    return scope[_keyname];
                }, function() {
                    var value = scope.data.var1;
                    setTimeout(function () {
                        scope.data.var1 = nullValue;
                        scope.$apply();
                        setTimeout(function () {
                            scope.data.var1 = value;
                            scope.$apply();
                        }, 0);
                    }, 0);
                });
                function fromUI(text) {
                    return R.Encrypt(text || '', scope[_keyname]);
                }
    
                function toUI(text) {
                    return R.Decrypt(text || '', scope[_keyname]);
                }
                ngModel.$parsers.push(fromUI);
                ngModel.$formatters.push(toUI);
            }
        };
    };
};

var module = angular.module("demo", []);

module.directive('cryptosync', directiveBuilder('key1'));
module.directive('cryptosync2', directiveBuilder('key2'));

module.controller("Controller1", ["$scope", function($scope) {
    $scope.key1 = "0123456789ABCDEF";
    $scope.key2 = "89ABCDEF01234567";

    $scope.data = {
        var1: [0,
            [157, 44, 218, 144, 27, 104, 45, 51, 89, 112, 154, 90, 178, 65, 150, 36]],
        var2:[0,
            [172, 236, 236, 171, 165, 179, 206, 197, 26, 137, 183, 150, 236, 32, 159, 93]]
    };

    $scope.loadData = function () {
        $scope.data = {
            var1: [3, [238, 179, 26, 7, 162, 104, 145, 98, 136, 182, 53, 197, 132, 4, 32, 167],
                [172, 143, 61, 224, 243, 166, 11, 12, 154, 131, 147, 124, 76, 108, 71, 200]
            ],
            var2: [3, [19, 184, 32, 17, 93, 71, 45, 157, 89, 41, 30, 26, 123, 124, 8, 182],
                [107, 77, 0, 17, 8, 49, 80, 51, 255, 116, 11, 169, 154, 77, 136, 248]
            ]
        };
    };

    $scope.loadBadData = function () {
        $scope.data = {
            var1: [3, [238, 179, 26, 7, 162, 104, 145, 98, 136, 182, 53, 197, 132, 4, 32, 167],
                [172, 143, 61, 224, 243, 166, 11, 12, 154, 131, 147, 124, 76, 108, 71, 199]
            ],
            var2: [3, [19, 184, 32, 17, 93, 71, 45, 157, 89, 41, 30, 26, 123, 124, 8, 182],
                [107, 77, 0, 17, 8, 49, 80, 51, 255, 116, 11, 169, 154, 77, 136, 247]
            ]
        };
    };
}]);
