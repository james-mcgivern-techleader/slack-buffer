package dev.slackbuffer.web;

import dev.slackbuffer.model.SlackPost;
import dev.slackbuffer.post.SlackPostService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api")
public class ScheduledPostsController {

  private final SlackPostService slackPostService;

  public ScheduledPostsController(SlackPostService slackPostService) {
    this.slackPostService = slackPostService;
  }

  @GetMapping("/scheduled-posts")
  public ResponseEntity<List<SlackPost>> scheduledPosts() {
    return ResponseEntity.ok(slackPostService.listScheduled());
  }
}
