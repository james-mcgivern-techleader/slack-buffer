package dev.slackbuffer.post;

import dev.slackbuffer.model.SlackPost;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemorySlackPostRepository implements SlackPostRepository {

  private final ConcurrentMap<String, SlackPost> store = new ConcurrentHashMap<>();

  @Override
  public SlackPost save(SlackPost post) {
    store.put(post.postId(), post);
    return post;
  }

  @Override
  public Optional<SlackPost> findByPostId(String postId) {
    return Optional.ofNullable(store.get(postId));
  }

  @Override
  public List<SlackPost> findAll() {
    return new ArrayList<>(store.values());
  }

  @Override
  public void deleteByPostId(String postId) {
    store.remove(postId);
  }
}
