package controllers;

import play.*;
import play.mvc.*;

import views.html.*;

public class Application extends Controller {

    public static Result index() {
        String test = System.getenv().get("test");
        return ok(index.render(test));
    }

}
