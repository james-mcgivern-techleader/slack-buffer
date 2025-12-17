package dev.slackbuffer.web;

import dev.slackbuffer.model.SlackPost;
import dev.slackbuffer.post.SlackPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api")
public class PostController {

  private final SlackPostService slackPostService;

  public PostController(SlackPostService slackPostService) {
    this.slackPostService = slackPostService;
  }

  @PostMapping("/post/{postId}")
  public ResponseEntity<SlackPost> updatePost(
      @PathVariable String postId, @RequestBody SlackPost post) {
    return ResponseEntity.ok(slackPostService.upsert(postId, post));
  }
}
