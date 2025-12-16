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
public class PublishedPostsController {

  @GetMapping("/published-posts")
  public ResponseEntity<List<SlackPost>> publishedPosts() {
    // TODO: replace with persistence + real publish logic
    Instant now = Instant.now();

    return ResponseEntity.ok(
        List.of(
            new SlackPost(
                "pp_001",
                "C00000003",
                "#announcements",
                "Yesterday's update: build pipeline improved.",
                now.minus(1, ChronoUnit.DAYS)),
            new SlackPost(
                "pp_002",
                "C00000001",
                "#general",
                "Last week's reminder: submit your timesheets.",
                now.minus(7, ChronoUnit.DAYS)),
            new SlackPost(
                "pp_003",
                "C00000002",
                "#random",
                "Two weeks ago: share your favorite keyboard shortcuts.",
                now.minus(14, ChronoUnit.DAYS))));
  }
}
