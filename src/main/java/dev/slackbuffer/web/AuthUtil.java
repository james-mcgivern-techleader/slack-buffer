package dev.slackbuffer.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;

public final class AuthUtil {

  public static final String AUTH_COOKIE_NAME = "sb_token";

  private AuthUtil() {}

  public static String tokenFromRequest(HttpServletRequest request) {
    if (request == null) return null;

    String token = parseBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
    if (token != null) return token;

    Cookie[] cookies = request.getCookies();
    if (cookies == null) return null;

    for (Cookie c : cookies) {
      if (AUTH_COOKIE_NAME.equals(c.getName())) {
        return c.getValue();
      }
    }

    return null;
  }

  public static String parseBearerToken(String authorization) {
    if (authorization == null) return null;
    if (!authorization.startsWith("Bearer ")) return null;
    return authorization.substring("Bearer ".length()).trim();
  }
}
