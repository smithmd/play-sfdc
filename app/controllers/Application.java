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
import play.*;
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

        String dashboardId = "01ZG0000000SczBMAS";
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

            final String[] claimArray = new String[4];
            claimArray[0] = System.getenv().get("SECRET_KEY" + ENVIRONMENT);
            claimArray[1] = System.getenv().get("USER_NAME" + ENVIRONMENT);
            claimArray[2] = System.getenv().get("LOGIN_PATH" + ENVIRONMENT);
            claimArray[3] = Long.toString( (System.currentTimeMillis()/1000) + 300);

            final MessageFormat claims = new MessageFormat(claimTemplate);
            final String payload = claims.format(claimArray);

            // Add the encoded claims object
            token.append(Base64.encodeBase64URLSafeString(payload.getBytes(StandardCharsets.UTF_8)));

            final String privateKeyString = System.getenv().get("PRIVATE_KEY" + ENVIRONMENT);
//            System.out.println(privateKeyString);

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

            System.out.println("Token:");
            System.out.println(token);

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

        String sfURI = "https://interlochen--uat.cs10.my.salesforce.com";
        String dashboardPath = "/services/data/v31.0/analytics/dashboards/";

        HttpGet get = new HttpGet(sfURI + dashboardPath + dashboardId);
        get.addHeader("Authorization", "Bearer " + accessToken);
        get.addHeader("Content-Type","application/x-www-form-urlencoded");
        get.addHeader("User-Agent", "Mozilla/5.0");
        get.addHeader("Accept-Language", "en-US,en;q=0.5");

        try {
            HttpResponse resp = client.execute(get);
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(resp.getEntity().getContent())
            );

            String inputLine;

            while((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }

            in.close();

            result = response.toString();
        } catch (ClientProtocolException cpe) {
            result = "ClientProtocolException Error";
        } catch (IOException ioe) {
            result = "IOException Error";
        }


        return result;
    }
}
