package dev.slackbuffer.web;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private static final Map<String, String> TOKENS_TO_EMAIL = new ConcurrentHashMap<>();

  public record LoginRequest(String email, String password) {}

  public record SignupRequest(String email, String password) {}

  public record AuthResponse(boolean ok, String message, String token, String email) {}

  public record MeResponse(boolean ok, String email) {}

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
    // TODO: replace with real authentication (session/JWT + user store)
    String token = UUID.randomUUID().toString();
    TOKENS_TO_EMAIL.put(token, req.email());
    return ResponseEntity.ok(new AuthResponse(true, "stub login accepted", token, req.email()));
  }

  @PostMapping("/signup")
  public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest req) {
    // TODO: replace with real signup (validation + user store)
    String token = UUID.randomUUID().toString();
    TOKENS_TO_EMAIL.put(token, req.email());
    return ResponseEntity.ok(new AuthResponse(true, "stub signup accepted", token, req.email()));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(
      @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
    String token = parseBearerToken(authorization);
    if (token == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MeResponse(false, null));
    }

    String email = TOKENS_TO_EMAIL.get(token);
    if (email == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MeResponse(false, null));
    }

    return ResponseEntity.ok(new MeResponse(true, email));
  }

  private static String parseBearerToken(String authorization) {
    if (authorization == null) return null;
    if (!authorization.startsWith("Bearer ")) return null;
    return authorization.substring("Bearer ".length()).trim();
  }
}
