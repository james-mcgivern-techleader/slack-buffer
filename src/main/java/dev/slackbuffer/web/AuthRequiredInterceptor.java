package dev.slackbuffer.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthRequiredInterceptor implements HandlerInterceptor {

  private final AuthTokenStore tokenStore;

  public AuthRequiredInterceptor(AuthTokenStore tokenStore) {
    this.tokenStore = tokenStore;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    String token = AuthUtil.tokenFromRequest(request);
    boolean authed = token != null && tokenStore.isValidToken(token);

    if (authed) return true;

    String path = request.getRequestURI();
    if (path != null && path.startsWith("/v1/api/")) {
      response.setStatus(HttpStatus.UNAUTHORIZED.value());
      return false;
    }

    response.sendRedirect("/login");
    return false;
  }
}
