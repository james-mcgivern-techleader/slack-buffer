package dev.slackbuffer.web;

import dev.slackbuffer.model.SlackPost;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api")
public class ScheduledPostsController {

  @GetMapping("/scheduled-posts")
  public ResponseEntity<List<SlackPost>> scheduledPosts() {
    // TODO: replace with persistence + real scheduling logic
    Instant now = Instant.now();

    return ResponseEntity.ok(
        List.of(
            new SlackPost(
                "sp_001",
                "C00000001",
                "#general",
                "Reminder: team sync in 10 minutes.",
                now.plus(10, ChronoUnit.MINUTES)),
            new SlackPost(
                "sp_002",
                "C00000003",
                "#announcements",
                "Release notes draft ready for review.",
                now.plus(2, ChronoUnit.HOURS)),
            new SlackPost(
                "sp_003",
                "C00000002",
                "#random",
                "Friday fun: post your best pet photo.",
                now.plus(2, ChronoUnit.DAYS))));
  }
}
