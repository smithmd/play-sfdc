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

The first that is called by a route is `requestAccessToken()`. This method is responsible for making an HTTP connection to salesforce and passing an access token that is built with `createToken()`. 

`createToken()` builds a string encoded in Base64 and signs that with the key stored on the server. This gets returned to `requestAccessToken()`.

`requestAccessToken()` posts the request token to a salesforce url to get an access token. 

[More documentation on salesforce bearer tokens](https://github.com/smithmd/play-sfdc/blob/master/docs/Server-Server%20Salesforce%20Authentication.md)

###### Pulling Dashboards

`getDashboard(String dashboardId, String accessToken)` takes the ID of a dashboard and an access token and requests a dashboard from salesforce. It returns the result as a JSON string.

#### Views

Views are created using a Scala template. [Documentation on Play templates](https://www.playframework.com/documentation/2.0.4/ScalaTemplates)

Basically, the controller passes data over to the view by calling the render function and passing parameters to the view template. The template uses those parameters as the model for the page and returns the result of the render function to the controller.

## Javascript (NVD3 and Google Charts)

To actually draw the charts, main.scala.html uses [Google Charts](https://developers.google.com/chart/) and nv.scala.html uses [NVD3](http://nvd3.org/) in addition to Google charts.

Each chart needs to be handled slightly differently, so each gets its own function. I'm sure there's a way to make it more generic than this but I never had time to think about it.

Each function sifts through the json for the specific report in the dashboard that it needs to display. There are several helper functions to take away some of the tedium.

Then the functions grab column labels and groupings. Each grouping represents a column of data in the report.