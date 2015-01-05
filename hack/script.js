var CryptoSynchronizer = function(
    plainSetter, plainGetter, cipherSetter, cipherGetter,
    keyGetter, threeStrikes) {

    var numFailedDecryptions = 0;
    var pub = {};

    pub.encrypt = function() {
        var x = plainGetter();
        var key = keyGetter();
        var y = Rijndael.Encrypt(x, key);
        numFailedDecryptions = 0;
        cipherSetter(y);
    };

    pub.decrypt = function() {
        var x = cipherGetter();
        var key = keyGetter();
        var y = Rijndael.Decrypt(x, key);
        if (y === null) {
            numFailedDecryptions++;
            if (threeStrikes && numFailedDecryptions == 3) {
                threeStrikes();
                numFailedDecryptions = 0;
                return;
            }
        }
        plainSetter(y);
    };

    return pub;
};

var myApp = angular.module('myApp', []);

myApp.controller('PasswordSafeController', ['$scope',
    function($scope) {
        var pinLockedKey;
        // $scope.key = '12345678911234567892123456789312';
        $scope.key = '123456789\1011234567892123456789312';
        $scope.pin = '1234';
        var csyncKey = CryptoSynchronizer(
            function(x) {
                $scope.key = x;
            },
            function() {
                return $scope.key;
            },
            function(x) {
                pinLockedKey = x;
            },
            function() {
                return pinLockedKey;
            },
            function() {
                var pin = $scope.pin;
                while (pin.length < 16)
                    pin += "\0";
                return pin;
            },
            function() {
                /* nothing for now */
            });
        csyncKey.encrypt();
        $scope.key = '';
        $scope.unlockKey = function() {
            csyncKey.decrypt();
        };
        $scope.clearKey = function() {
            $scope.key = "";
        };
        $scope.saveKey = function() {
            csyncKey.encrypt();
            $scope.key = "";
        };
        var keyLockedContent = [466,
            [3, 19, 102, 223, 109, 152, 107, 188, 40, 145, 237, 184, 253, 208, 196, 143],
            [116, 165, 65, 127, 7, 10, 4, 171, 39, 195, 160, 204, 239, 105, 53, 79],
            [102, 247, 228, 29, 75, 186, 212, 132, 120, 7, 21, 200, 24, 30, 21, 76],
            [32, 161, 31, 184, 87, 90, 23, 112, 195, 138, 125, 223, 227, 113, 38, 186],
            [136, 222, 139, 251, 105, 1, 107, 178, 137, 177, 20, 22, 141, 32, 123, 11],
            [149, 182, 194, 206, 166, 115, 118, 9, 59, 108, 80, 56, 82, 72, 76, 31],
            [197, 231, 171, 95, 205, 203, 106, 169, 28, 148, 148, 76, 162, 249, 112, 39],
            [151, 222, 255, 4, 194, 53, 72, 246, 87, 53, 161, 21, 30, 38, 54, 102],
            [226, 231, 36, 87, 194, 228, 211, 67, 205, 44, 86, 240, 247, 21, 66, 100],
            [185, 119, 73, 15, 226, 73, 152, 43, 15, 44, 100, 134, 24, 177, 186, 147],
            [36, 129, 64, 15, 123, 47, 70, 150, 229, 95, 114, 52, 47, 5, 108, 244],
            [69, 185, 81, 29, 0, 34, 193, 135, 247, 179, 212, 153, 191, 191, 36, 77],
            [188, 70, 145, 204, 152, 254, 80, 17, 131, 160, 32, 168, 248, 200, 70, 205],
            [240, 56, 0, 25, 201, 188, 133, 157, 18, 159, 167, 85, 221, 118, 247, 168],
            [98, 209, 110, 228, 119, 6, 169, 189, 183, 47, 172, 82, 94, 160, 66, 69],
            [185, 45, 178, 193, 88, 35, 63, 35, 1, 31, 182, 28, 196, 60, 112, 9],
            [115, 34, 156, 73, 169, 228, 193, 222, 101, 187, 1, 92, 44, 47, 95, 157],
            [164, 149, 94, 129, 65, 80, 78, 249, 130, 212, 214, 190, 168, 26, 173, 82],
            [249, 190, 83, 69, 158, 112, 1, 224, 92, 123, 44, 150, 145, 212, 36, 72],
            [196, 252, 5, 174, 156, 197, 97, 6, 10, 96, 107, 248, 169, 16, 117, 158],
            [163, 162, 199, 229, 125, 151, 130, 171, 29, 173, 0, 239, 195, 205, 99, 217],
            [223, 78, 195, 135, 59, 0, 153, 60, 159, 130, 230, 74, 201, 125, 142, 160],
            [53, 28, 100, 48, 220, 41, 57, 157, 217, 163, 76, 160, 237, 247, 135, 224],
            [2, 222, 100, 33, 62, 196, 26, 241, 247, 211, 42, 26, 140, 219, 22, 79],
            [128, 240, 130, 148, 118, 134, 103, 68, 25, 191, 165, 252, 186, 110, 90, 47],
            [181, 65, 0, 35, 179, 100, 66, 73, 59, 170, 104, 198, 149, 104, 164, 27],
            [9, 146, 242, 204, 241, 102, 74, 24, 47, 240, 184, 80, 153, 23, 14, 68],
            [16, 165, 180, 199, 238, 23, 175, 56, 87, 103, 111, 105, 9, 110, 193, 76],
            [77, 18, 185, 72, 111, 72, 94, 64, 153, 69, 38, 227, 192, 51, 221, 118],
            [125, 159, 89, 167, 143, 96, 198, 1, 201, 137, 34, 185, 48, 163, 190, 81],
            [7, 230, 249, 26, 52, 156, 91, 78, 55, 184, 54, 38, 98, 143, 112, 137]
        ];
        $scope.secrets = "";
        var csyncContent = CryptoSynchronizer(
            function(x) {
                $scope.secrets = x;
            },
            function() {
                return $scope.secrets;
            },
            function(x) {
                keyLockedContent = x;
            },
            function() {
                return keyLockedContent;
            },
            function() {
                return $scope.key;
            },
            function() {
                /* nothing for now */
            });
        $scope.unlockContent = function() {
            csyncContent.decrypt();
        };
        $scope.clearContent = function() {
            $scope.secrets = "";
        };
        $scope.saveContent = function() {
            csyncContent.encrypt();
            $scope.secrets = "";
        };
        $scope.secrets = "";
        var csyncContent = CryptoSynchronizer(
            function(x) {
                $scope.secrets = x;
            },
            function() {
                return $scope.secrets;
            },
            function(x) {
                keyLockedContent = x;
            },
            function() {
                return keyLockedContent;
            },
            function() {
                return $scope.key;
            },
            function() { /* nothing for now */ });
        $scope.unlockContent = function() {
            csyncContent.decrypt();
        };
        $scope.clearContent = function() {
            $scope.secrets = "";
        };
        $scope.saveContent = function() {
            csyncContent.encrypt();
            $scope.secrets = "";
        };
    }
]);
