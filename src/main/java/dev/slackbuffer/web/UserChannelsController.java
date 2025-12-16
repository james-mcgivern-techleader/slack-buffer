package dev.slackbuffer.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/user")
public class UserChannelsController {

  public record Channel(String id, String name) {}

  @GetMapping("/channels")
  public ResponseEntity<List<Channel>> channels() {
    // TODO: replace with real Slack-backed channel list for the authenticated user
    return ResponseEntity.ok(
        List.of(
            new Channel("C00000001", "#general"),
            new Channel("C00000002", "#random"),
            new Channel("C00000003", "#announcements")));
  }
}
