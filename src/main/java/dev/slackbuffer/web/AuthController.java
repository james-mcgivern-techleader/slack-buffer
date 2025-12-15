package dev.slackbuffer.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  public record LoginRequest(String email, String password) {}

  public record SignupRequest(String email, String password) {}

  public record AuthResponse(String ok, String message) {}

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
    // TODO: replace with real authentication (session/JWT + user store)
    return ResponseEntity.ok(new AuthResponse("true", "stub login accepted for: " + req.email()));
  }

  @PostMapping("/signup")
  public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest req) {
    // TODO: replace with real signup (validation + user store)
    return ResponseEntity.ok(new AuthResponse("true", "stub signup accepted for: " + req.email()));
  }
}
