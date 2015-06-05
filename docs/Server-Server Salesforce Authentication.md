## Server-Server Salesforce Authentication

**Problem:** You want to authorize a foreign (to SFDC) app to make calls into Salesforce, but you don’t want to store id/password on the foreign server (which would be a bad practice anyway), and it’s a “headless” app (like a scheduled integration), so no user interaction is going to happen. You are also confused by all this Oauth flow stuff.

**Solution:** You want OAuth 2.0 xxxx Bearer Token flows where xxxx is either SAML or JWT. Either of these let you set up a bunch of configuration and then basically call SFDC using pre-shared secrets.
The “bunch of configuration” is non-trivial in appearance.  

I’m gonna take a stab at JWT first as it looks simpler, and SFDC has provided actual Java code samples.


### SAML

You will need to set up a Connected App with the appropriate OAuth Scopes: `Manage Apps | Connected Apps`

Configure the `Connected App Permitted Users` behavior to `Admin approved users are pre-authorized` (under OAuth policies), so that Users don't need to manually authorize the Connected App, unless you desire this behaviour. Edit the user's profile under `Manage Users | Profiles` to add access to the Connected App (Connected App Access).

You can use the SAML Bearer Flow to post a SAML Assertion (Containing the Client Secret and Key from the Connected App you configured above) to the OAUTH2 Endpoint, and obtain an access token. [OAuth 2.0 SAML Bearer Assertion Flow](https://help.salesforce.com/apex/HTViewHelpDoc?id=remoteaccess_oauth_SAML_bearer_flow.htm&language=en)

The Issuer must be the OAuth client_id or the remote access application for which the developer registered their certificate.

The Audience must be https://login.salesforce.com or https://test.salesforce.com.

The Recipient must be https://login.salesforce.com/services/oauth2/token or https://test.salesforce.com/services/oauth2/token.

The Subject NameID must be the username of the desired Salesforce user.
This token can then be used for Authorisation in your REST Calls.

### JWT

You can do the same as above using a JSON Web Token. It's basically the same thing, differently formatted token.

[Creating a JWT Bearer Token](https://help.salesforce.com/HTViewHelpDoc?id=remoteaccess_oauth_jwt_flow.htm&language=en_US#create_token)

##### For Java

You need a keystore and a cert. A java keystore (xxxxx.jks) is a password protected container that stores 1-n certificates stored like a hashmap keyed by “alias”.

[Java Keytool Essentials: Working with Java Keystores](https://www.digitalocean.com/community/tutorials/java-keytool-essentials-working-with-java-keystores)

1.  Open a terminal window.
1.  Generate a self-signed Cert into a new keystore. (I think self-signed is
    fine since we’re in charge of both sides of the communication link...but 
    willing to be corrected).
    1.  `keytool -genkey -alias sfdcCert -keyalg RSA -validity 365 -keystore keystore.jks`
    1.  You will be prompted for basic info, and to create a password for the
        keystore. You can also create a separate password for the cert or use 
        the same password as the keystore
1. Extract the certificate from the keystore.
	1.  `keytool -exportcert -alias sfdcCert -file sfdcCert.der -keystore keystore.jks`
	1.  Upload the cert to salesforce 
        1. Setup | Create | Apps | edit Connected App | Use digital signature (browse to file) and save.
	1.  Put the keystore.jks onto the server where the java program will be run (obviously in a path the java program which the java program can access).

This is a cool implementation done in Apex for Salesforce-Salesforce interaction. May be handy for populating sandboxes from production.
https://force201.wordpress.com/2014/09/20/an-apex-implementation-of-the-oauth-2-0-jwt-bearer-token-flow/

##### For Heroku Deploy

You don't necessarily need a keystore, but you _do_ need a certificate. Uploading the certificate is detailed above.

1.  Generate a certificate
    *   `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out certificate.crt`
1.  Extract the private key as a PKCS#8 PEM file.
    *   `openssl pkcs8 -topk8 -inform pem -in privateKey.key -outform pem -nocrypt -out file.pem`
    *   This strips any password or passphrase that was previously
        set on the private key.
1.  Create a variable on heroku and store the PKCS#8 string.
    *   Only the characters between `-----BEGIN PRIVATE KEY-----`
        and `-----END PRIVATE KEY-----`
    *   `heroku config:set PRIVATE_KEY=xxxxxx` where xxxxxx is the
        string from above
    *   You can retrieve this var with: 

        ```java
        System.getenv().get("PRIVATE_KEY")
        ```
1.  Create a variable on heroku for the Consumer Key
    *   You can find this at `Create | Apps | Connected Apps | _Your App_`
    *   When copying the Consumer Secret make sure there are no trailing whitespace characters.

### Possible Errors

*   **Problem:**  
    400 (Bad Request) {"error\_description":"user hasn't approved this consumer","error":"invalid\_grant"}

    **Solution:**  
    Permitted Users: Admin Authorized users are pre-authorized
    and then add correct profiles to the list.  
    Add “refresh token” scope to OAuth scopes on connected app
    **_EVEN IF FULL ACCESS IS SPECIFIED_**.


### Tools:

* Chrome Advanced REST Client extension - useful because (unless I figure out a way) error messages on 400 returns don’t show up in native java response.
* [HTTPBin.org](http://httpbin.org/) - Useful for testing POST or GET. Returns JSON object of exactly what you sent it.