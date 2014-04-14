$(function() {
    var html5_support;
    var pin = $('#pin');
    var content = $('#content');
    var pinForPassword = $('#pin-for-pw');
    var passwordShow = $('#pw-show');
    var mainPage = $('.main-page');
    var loginPage = $('.login-page');
    var helpPage = $('.help-page');
    var nonHelpPage = $('.non-help-page');
    var more = $('#more');
    var saveButton = $('.save-button');
    var mainButton = $('.main-button');
    var loginButton = $('.login-button');
    var helpButton = $('.help-button');
    var backButton = $('.back-button');
    var blankButton = $('.blank-button');
    var setupButton = $('.setup-button');
    var showPasswordButton = $('.showpw-button');
    var cipher = ciphersaber;
    var password = null;

    try {
        html5_support = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        html5_support = false;
    }

    if (!html5_support) {
        more.text('This only works on a HTML5-supported browser, sorry!');
        return;
    }

    var cipher;
    // Maybe make it a user option to choose which cipher?
    if (false) {
        cipher = ciphersaber;
    } else {
        // use rijndael instead
        cipher = {
            encrypt: function(key, plaintext) {
                var iv = cipherutils.makePassword(16);
                var encrypted = mcrypt.Encrypt(plaintext, iv, key, 'rijndael-128', 'cfb');
                return iv + encrypted;
            },
            decrypt: function(key, s) {
                var iv = s.substring(0, 16);
                var ciphertext = s.substring(16);
                return mcrypt.Decrypt(ciphertext, iv, key, 'rijndael-128', 'cfb');
            }
        };
    }

    var goToLogin = function() {
        blank();
        mainPage.hide();
        loginPage.show();
        helpPage.hide();
        nonHelpPage.show();
    };

    /*
     * If there is a valid password in localStorage, go to the main page.
     * Otherwise go to the login page, so the user can either enter an
     * existing password or register a new one.
     */
    var backButtonHandler = function() {
        if (window.localStorage.getItem('encryptedPassword') === null) {
            mainPage.hide();
            loginPage.show();
        } else {
            mainPage.show();
            loginPage.hide();
        }
        helpPage.hide();
        nonHelpPage.show();
    };
    backButtonHandler();

    // This is done when logging in or registering.
    var setupPin = function(pin, pw) {
        var encryptedPassword = cipher.encrypt(pin, '000000' + pw);
        localStorage.setItem('encryptedPassword', encryptedPassword);
        localStorage.setItem('attempts', 0);
    };

    blank = function(event) {
        console.log(event);
        pin.val('');
        content.val('');
        pinForPassword.val('');
        more.text('');
        if (passwordShow.text()) {
            passwordShow.text('');
        }
    };

    window.onblur = blank;

    getPassword = function(pinSource, event) {
        var pin = pinSource.val();
        if (!pin) {
            blank(event);
            return;
        }
        var attempts = parseInt(localStorage.getItem('attempts') || '0') + 1;
        password = cipher.decrypt(pin, localStorage.getItem('encryptedPassword') || '');
        if (password.substring(0, 6) === '000000') {
            // console.log('getPassword successful');
            password = password.substring(6);
            localStorage.setItem('attempts', 0);
            blank(event);
            return true;
        } else {
            // console.log('getPassword ' + attempts + ' failed attempts');
            password = null;
            localStorage.setItem('attempts', attempts);
            if (attempts == 3) {
                // console.log('clearing localStorage');
                localStorage.clear();
                goToLogin();
            } else {
                blank(event);
                pinSource.val('Wrong PIN');
            }
            return false;
        }
    };

    attemptDecryption = function(event) {
        if (getPassword(pin, event)) {
            content.val(cipher.decrypt(password, localStorage.getItem('content')));
            pin.val('');
            more.text('');
        }
    };

    var onGetPin = function(pinSource, handler) {
        pinSource.keyup(function(event) {
            if (event.keyCode == 13) {
                handler(event);
            }
        });
        pinSource.blur(function(event) {
            handler(event);
        });
    };

    onGetPin(pin, function(event) {
        attemptDecryption(ciphersaber, event);
    });

    onGetPin(pinForPassword, function(event) {
        passwordShow.text('');
        if (getPassword(ciphersaber, pinForPassword, event)) {
            passwordShow.text(password);
        }
    });

    setupButton.click(function() {
        localStorage.clear();
        var pw = cipherutils.makePassword(22);
        setupPin('1234', pw);
        localStorage.setItem('content', cipher.encrypt(pw, 'Abc Def Ghi'));
    });

    backButton.click(backButtonHandler);

    saveButton.click(function(event) {
        if (password !== null && content.val() !== '') {
            var encryptedContent = cipher.encrypt(password, content.val());
            localStorage.setItem('content', encryptedContent);
            console.log('send encryptedContent to the server');
            blank(event);
        }
    });

    mainButton.click(function() {
        mainPage.show();
        loginPage.hide();
        helpPage.hide();
        nonHelpPage.show();
    });

    loginButton.click(goToLogin);

    helpButton.click(function() {
        mainPage.hide();
        loginPage.hide();
        helpPage.show();
        nonHelpPage.hide();
    });

    blankButton.click(blank);
});
