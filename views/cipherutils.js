var CryptoSynchronizer = function(plainSetter, plainGetter,
                                  cipherSetter, cipherGetter,
                                  keyGetter,
                                  threeStrikes) {

    var numFailedDecryptions = 0;
    var oldKey;
    var pub = {};

    pub.encrypt = function() {
        var x = plainGetter();
        var key = keyGetter();
        oldKey = key;
        if (key.charCodeAt(0) & 1) {
            x = rot13(x);
        }
        numFailedDecryptions = 0;
        cipherSetter(x);
    };

    pub.decrypt = function() {
        var x = cipherGetter();
        var key = keyGetter();
        if (key != oldKey) {
            // failed decryption
            numFailedDecryptions++;
            if (threeStrikes && numFailedDecryptions == 3) {
                threeStrikes();
                numFailedDecryptions = 0;
                return;
            }
        }
        if (key.charCodeAt(0) & 1) {
            x = rot13(x);
        }
        plainSetter(x);
    };

    var rot13 = function(x) {
        var i, j;
        var s = "";
        for (i = 0; i < x.length; i++) {
            j = x.charCodeAt(i);
            if (j >= 97 && j <= 109)
                j += 13;
            else if (j >= 110 && j <= 122)
                j -= 13;
            else if (j >= 65 && j <= 77)
                j += 13;
            else if (j >= 78 && j <= 90)
                j -= 13;
            s += String.fromCharCode(j);
        }
        return s;
    };

    return pub;
};

var cipherutils = cipherutils ? cipherutils : new function() {
    var pub = {};

    // 64 chars, excluding the easily-confused ones: O, I, l, 0, 1
    var charSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz!@#$&+=23456789';

    var makeString = function(len, f) {
        var i, r = '';
        for (i = 0; i < len; i++) {
            r += f(i);
        }
        return r;
    };

    pub.makeSalt = function(len) {
        return makeString(len, function(i) {
            return String.fromCharCode(Math.floor(256 * Math.random()));
        });
    };

    var zeroString = makeString(function(i) {
        return String.fromCharCode(0);
    });

    pub.hash = function(cipher, pw) {
        return cipher.encrypt(pw, zeroString);
    };

    pub.confirmHash = function(cipher, pw, expected) {
        return expected && (cipher.decrypt(pw, expected) === zeroString);
    };

    // 22 chars => 128 bits of entropy
    // 16 chars => 96 bits of entropy
    // 11 chars => 64 bits of entropy
    pub.makePassword = function(len) {
        var i, s = '', n = charSet.length;
        for (i = 0; i < len; i++) {
            s += charSet[Math.floor(n * Math.random())];
        }
        return s;
    };

    pub.CryptoSynchronizer = CryptoSynchronizer;

    return pub;
};

if (module !== undefined) {
    // node.js require
    for (var key in cipherutils) {
        module.exports[key] = cipherutils[key];
    }
}
