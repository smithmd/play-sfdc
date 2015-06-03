# Dashboard for Campaign

## Heroku

Heroku is used as the deployment and hosting server. It can be committed to via git and recompiles the application on each push.

## Play

This application makes use of the Play framework. The server side logic is written in Java and the HTML templates are
done in Scala.

#### Routes

Routes are described in `/conf/routes` and tell the application what controller method to execute when a `GET` is issued to the server.

Each is described in a single line like this:

```
GET     /                           controllers.Application.index()
```

In this case, when the user requests the default `/` route, the server will process `controllers.Application.index()` and return the results of its attempt to render that route's controller.

#### Controller

###### Routes

The controller is found under `/app/controllers/` and is called `Application.java`

The controller has a method for each route that returns a `Result` object and corresponds to a view. For example, `index()` returns the result of attempting to render the `index.scala.html` view.

The controller can pull system variables from Heroku like this:

```
System.getenv().get("DASHBOARD_ID")
```

This would pull the system variable called `DASHBOARD_ID` from Heroku. These can be set up on the Heroku console.

###### Access Tokens

There are two static methods employed to create and request a token to grant access to salesforce.

The first that is called by a route is `requestAccessToken()`. This method is reponsible for making an HTTP connection to salesforce and passing an access token that is built with `createToken()`.