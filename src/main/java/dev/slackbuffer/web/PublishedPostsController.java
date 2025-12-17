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
public class PublishedPostsController {

  private final SlackPostService slackPostService;

  public PublishedPostsController(SlackPostService slackPostService) {
    this.slackPostService = slackPostService;
  }

  @GetMapping("/published-posts")
  public ResponseEntity<List<SlackPost>> publishedPosts() {
    return ResponseEntity.ok(slackPostService.listPublished());
  }
}
