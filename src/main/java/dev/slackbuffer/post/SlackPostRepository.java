package dev.slackbuffer.post;

import dev.slackbuffer.model.SlackPost;
import java.util.List;
import java.util.Optional;

public interface SlackPostRepository {
  SlackPost save(SlackPost post);

  Optional<SlackPost> findByPostId(String postId);

  List<SlackPost> findAll();

  void deleteByPostId(String postId);
}
