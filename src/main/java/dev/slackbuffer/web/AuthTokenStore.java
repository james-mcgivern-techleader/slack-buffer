package dev.slackbuffer.web;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenStore {

  private final Map<String, String> tokensToEmail = new ConcurrentHashMap<>();

  public String issueTokenForEmail(String email) {
    String token = UUID.randomUUID().toString();
    tokensToEmail.put(token, email);
    return token;
  }

  public String emailForToken(String token) {
    if (token == null) return null;
    return tokensToEmail.get(token);
  }

  public boolean isValidToken(String token) {
    return emailForToken(token) != null;
  }

  public void revokeToken(String token) {
    if (token == null) return;
    tokensToEmail.remove(token);
  }
}
