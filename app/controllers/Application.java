package controllers;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import play.mvc.*;

import views.html.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

public class Application extends Controller {
    private static String ENVIRONMENT = "_TEST";

    public static Result index() {
        String output = "";
        String output2 = "";
        String accessToken = null;

        // 01ZJ00000000MNBMA2 - working
        // 01ZJ00000000MbXMAU - not working
        String dashboardId = System.getenv().get("DASHBOARD_ID");
        ENVIRONMENT = (System.getenv().get("IS_LIVE").equals("1") ? "_LIVE" : "_TEST");

        String token = requestAccessToken();

        JSONTokener jt = new JSONTokener(token);
        try {
            JSONObject jo = new JSONObject(jt);
            accessToken = (String)jo.get("access_token");
        } catch (JSONException je) {
            output = "Error parsing JSON.";
        }

        if (accessToken != null) {
            output = getDashboard("", accessToken);
            output2 = getDashboard(dashboardId, accessToken);
        }

        return ok(index.render(output,output2, dashboardId));
    }

    public static Result nvindex() {
        String dashboardList = "";
        String dashboard = "";
        String accessToken = null;

        // 01ZJ00000000MNBMA2 - working
        // 01ZJ00000000MbXMAU - not working
        String dashboardId = System.getenv().get("DASHBOARD_ID");
        ENVIRONMENT = (System.getenv().get("IS_LIVE").equals("1") ? "_LIVE" : "_TEST");

        String token = requestAccessToken();

        JSONTokener jt = new JSONTokener(token);
        try {
            JSONObject jo = new JSONObject(jt);
            accessToken = (String)jo.get("access_token");
        } catch (JSONException je) {
            dashboardList = "Error parsing JSON.";
        }

        if (accessToken != null) {
            dashboardList = getDashboard("", accessToken);
            dashboard = getDashboard(dashboardId, accessToken);
        }

        return ok(nv.render(dashboardId, dashboard, dashboardList));
    }

    // Methods to handle initial connection to salesforce
    private static String requestAccessToken() {
        StringBuilder response = new StringBuilder();
        final String tokenURL = System.getenv().get("TOKEN_URL" + ENVIRONMENT);
        HttpClient client = HttpClientBuilder.create().build();

        try {
            // POST contents
            final String grantType = "urn:ietf:params:oauth:grant-type:jwt-bearer";
            final String token = createToken();

//            final String params = "?grant_type="+grantType+"&assertion="+token;

            HttpPost post = new HttpPost(tokenURL);//+params);

            // Add Headers
            post.addHeader("Content-Type","application/x-www-form-urlencoded");
            post.addHeader("User-Agent", "Mozilla/5.0");
            post.addHeader("Accept-Language", "en-US,en;q=0.5");


            // Add post data
            List<NameValuePair> pairs = new ArrayList<>();
            pairs.add(new BasicNameValuePair("grant_type", grantType));
            pairs.add(new BasicNameValuePair("assertion", token));
            UrlEncodedFormEntity entity = new UrlEncodedFormEntity(pairs, StandardCharsets.UTF_8);
            post.setEntity(entity);

//            System.out.println(post.toString());
//            System.out.println(post.getEntity().toString());

            HttpResponse resp = client.execute(post);

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(resp.getEntity().getContent())
            );

            String inputLine;

            while((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }

            in.close();

            System.out.println(response);

            return response.toString();
        } catch (MalformedURLException e) {
            return "MalformedURLException: " + e.getMessage();
        } catch (IOException e) {
            return "IOException: " + e.getMessage() + "\nResponse:\n" + response.toString();
        }

    }

    private static String createToken() {

        final String header = "{\"alg\":\"RS256\"}";
        final String claimTemplate = "'{'\"iss\": \"{0}\", \"prn\": \"{1}\", \"aud\": \"{2}\", \"exp\": \"{3}\"'}'";

        try {
            final StringBuilder token = new StringBuilder();

            //Encode the JWT Header and add it to our string to sign
            token.append(Base64.encodeBase64URLSafeString(header.getBytes("UTF-8")));
            token.append('.');

            // create a claim array
            final String[] claimArray = new String[4];
            claimArray[0] = System.getenv().get("SECRET_KEY" + ENVIRONMENT);
            claimArray[1] = System.getenv().get("USER_NAME" + ENVIRONMENT);
            claimArray[2] = System.getenv().get("LOGIN_PATH" + ENVIRONMENT);
            claimArray[3] = Long.toString( (System.currentTimeMillis()/1000) + 300);


            // use the claimTemplate to format the payload properly
            final MessageFormat claims = new MessageFormat(claimTemplate);
            final String payload = claims.format(claimArray);

            System.out.println("Payload:\n" + payload);

            // Add the encoded claims object
            token.append(Base64.encodeBase64URLSafeString(payload.getBytes(StandardCharsets.UTF_8)));

            final String privateKeyString = System.getenv().get("PRIVATE_KEY" + ENVIRONMENT);
//            System.out.println(privateKeyString);

            // decode the private key which is stored in base64
            Base64 b64PK = new Base64();
            byte [] decoded = b64PK.decode(privateKeyString);

            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);

            PrivateKey pk = KeyFactory.getInstance("RSA").generatePrivate(spec);

            // should have a PrivateKey at this point, unless that was just gibberish...
            // Sign the JWT Header + "." + JWT Claims object
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initSign(pk);
            sig.update(token.toString().getBytes(StandardCharsets.UTF_8));
            String signedPayload = Base64.encodeBase64URLSafeString(sig.sign());

            token.append(".");

            token.append(signedPayload);

//            System.out.println("Token:");
//            System.out.println(token);

            System.out.println("Token: \n" + token);
            return token.toString();

        } catch (Exception e) {
            System.err.println(e.getMessage());
            return null;
        }
    }

    // Methods to handle gets from salesforce
    private static String getDashboard(String dashboardId, String accessToken) {
        String result;
        StringBuilder response = new StringBuilder();

        HttpClient client = HttpClientBuilder.create().build();

        String sfURI = System.getenv().get("SF_URI_" + ENVIRONMENT);
        String dashboardPath = "/services/data/v31.0/analytics/dashboards/";

        String fullURI = sfURI + dashboardPath + dashboardId;
        System.out.println("Full URI: " + fullURI);
        HttpGet get = new HttpGet(fullURI);
        get.addHeader("Authorization", "Bearer " + accessToken);
        get.addHeader("Content-Type", "application/x-www-form-urlencoded");
        get.addHeader("User-Agent", "Mozilla/5.0");
        get.addHeader("Accept-Language", "en-US,en;q=0.5");

        try {
            HttpResponse resp = client.execute(get);
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(resp.getEntity().getContent())
            );

            String inputLine;

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }

            in.close();

            result = response.toString();
            System.out.println(result);
        } catch (ClientProtocolException cpe) {
            result = "ClientProtocolException Error";
        } catch (IOException ioe) {
            result = "IOException Error";
        }


        return result;
    }
}
