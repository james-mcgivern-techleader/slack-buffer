package dev.slackbuffer.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthTokenStore tokenStore;

  public AuthController(AuthTokenStore tokenStore) {
    this.tokenStore = tokenStore;
  }

  public record LoginRequest(String email, String password) {}

  public record SignupRequest(String email, String password) {}

  public record AuthResponse(boolean ok, String message, String token, String email) {}

  public record MeResponse(boolean ok, String email) {}

  public record LogoutResponse(boolean ok) {}

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
    // TODO: replace with real authentication (session/JWT + user store)
    String token = tokenStore.issueTokenForEmail(req.email());

    ResponseCookie cookie =
        ResponseCookie.from(AuthUtil.AUTH_COOKIE_NAME, token)
            .path("/")
            .sameSite("Lax")
            .build();

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(new AuthResponse(true, "stub login accepted", token, req.email()));
  }

  @PostMapping("/signup")
  public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest req) {
    // TODO: replace with real signup (validation + user store)
    String token = tokenStore.issueTokenForEmail(req.email());

    ResponseCookie cookie =
        ResponseCookie.from(AuthUtil.AUTH_COOKIE_NAME, token)
            .path("/")
            .sameSite("Lax")
            .build();

    return ResponseEntity.ok()
        .header("Set-Cookie", cookie.toString())
        .body(new AuthResponse(true, "stub signup accepted", token, req.email()));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(HttpServletRequest request) {
    String token = AuthUtil.tokenFromRequest(request);
    if (token == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MeResponse(false, null));
    }

    String email = tokenStore.emailForToken(token);
    if (email == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MeResponse(false, null));
    }

    return ResponseEntity.ok(new MeResponse(true, email));
  }

  @PostMapping("/logout")
  public ResponseEntity<LogoutResponse> logout(HttpServletRequest request) {
    String token = AuthUtil.tokenFromRequest(request);
    tokenStore.revokeToken(token);

    ResponseCookie cookie =
        ResponseCookie.from(AuthUtil.AUTH_COOKIE_NAME, "")
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();

    return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body(new LogoutResponse(true));
  }
}
