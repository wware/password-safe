Password safe web app
==

The idea here is an offline HTML5 app that keeps my various passwords in
encrypted form, and syncs with the server when it's possible to do so. Encryption will be via
[Ciphersaber](http://en.wikipedia.org/wiki/CipherSaber).

A cryptographically strong password is used across browsers because it's the password used to encrypt
the content while stored on the server. It's too long to be kept in human memory, representing 128 bits
of entropy (e.g. "YQ4KH4So5GhDV575TchDe") generated randomly. To copy this password to another browser
or device, the user will need a copy of it because it's too long and random to remember. This will be
sent to the user in four separate emails sent out at five minute intervals, minimizing the opportunity
to get the PW by sniffing packets.

Each device also has a user-chosen PIN. This can be short, like 4 to 6 characters. The
PIN is used to decrypt the password locally.

Here are the cryptographic rules of engagement.

* The password is stored in PIN-encrypted form in the browser's localStorage.
* The content is stored in PW-encrypted form in the browser's localStorage.
* If the PIN is incorrectly guessed three times, localStorage is wiped.
* A salted hash of the password is stored in the server's database.
* The salted hash never leaves the server.
* The PIN never leaves the browser, and is never stored in localStorage.
* The plaintext password is never stored in localStorage or on the server.
* When encrypting the PW with the PIN, we give a few zero bytes as prefix so we can tell if the decryption was successful.
* The server will see the unencrypted password only when the user registers or logs in. At this time, the user can opt to receive the password in emails. After the emails are sent, we discard the user's email address.
* As the PIN is typed into the browser, the PW is decrypted on each keystroke, and as soon as there is a successful decryption, the PIN input field is erased. The PW is never visible in the browser (except when entering it on the login page.)

The app should work on a Macbook, a phone, and a tablet, so some responsive CSS may be
required. I am having good results so far using [Bootstrap](http://getbootstrap.com/).

Main page

* When you enter the main page, it attempts to pull down the most recent encrypted content from the server. That will fail if you're offline, and you'll be stuck with whatever is already in localStorage.
* You enter a PIN and if/when it’s correct, the PW is decrypted and you view decrypted content.
* Three wrong PINs will wipe the localStorage and take you to the login page.
* Decrypted content can be edited, or cut/copy and pasted.
* When content is edited, it is sent up to the server. The most recent version replaces any older version.
* If focus ever leaves this page, or the mobile device goes to sleep, the PIN input field and the content are blanked.

Login page (LOGIN)

* Enter username and password, server confirms the password (a salted hash that never leaves the server)
* If PW fails, start over.
* If PW succeeds, you enter a PIN twice (2nd time to confirm).

 - The user can opt to receive the PW in four separate emails.
 - The PIN is used to encrypt the PW and you are sent to the main page.

Login page (REGISTER)

* Enter a username. Server checks its availability and if it’s available, the client generates a PW for you.
* The PW is sent to the server, which stores it as a salted hash along with your username.
* You enter a PIN twice (2nd time to confirm).

 - The user can opt to receive the PW in four separate emails.
 - The PIN is used to encrypt the PW and you are sent to the main page.
