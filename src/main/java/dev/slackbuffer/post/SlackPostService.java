package dev.slackbuffer.post;

import dev.slackbuffer.model.SlackPost;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class SlackPostService {

  private final SlackPostRepository repository;

  public SlackPostService(SlackPostRepository repository) {
    this.repository = repository;
  }

  public SlackPost create(SlackPost post) {
    validateScheduledAtNotInPast(post.scheduledAt());

    String id = post.postId() != null && !post.postId().isBlank() ? post.postId() : newId();
    SlackPost normalized =
        new SlackPost(id, post.channelId(), post.channelName(), post.text(), post.scheduledAt());
    return repository.save(normalized);
  }

  public SlackPost update(String postId, SlackPost post) {
    SlackPost existing =
        repository
            .findByPostId(postId)
            .orElseThrow(() -> new NoSuchElementException("post not found: " + postId));

    SlackPost merged =
        new SlackPost(
            postId,
            post.channelId() != null ? post.channelId() : existing.channelId(),
            post.channelName() != null ? post.channelName() : existing.channelName(),
            post.text() != null ? post.text() : existing.text(),
            post.scheduledAt() != null ? post.scheduledAt() : existing.scheduledAt());

    validateScheduledAtNotInPast(merged.scheduledAt());

    return repository.save(merged);
  }

  public SlackPost upsert(String postId, SlackPost post) {
    return repository.findByPostId(postId).isPresent() ? update(postId, post) : create(withId(postId, post));
  }

  public SlackPost get(String postId) {
    return repository
        .findByPostId(postId)
        .orElseThrow(() -> new NoSuchElementException("post not found: " + postId));
  }

  public List<SlackPost> listAll() {
    return repository.findAll();
  }

  public void delete(String postId) {
    repository.deleteByPostId(postId);
  }

  public List<SlackPost> listScheduled() {
    Instant now = Instant.now();
    return repository.findAll().stream()
        .filter(p -> p.scheduledAt() != null && !p.scheduledAt().isBefore(now))
        .sorted(Comparator.comparing(SlackPost::scheduledAt))
        .toList();
  }

  public List<SlackPost> listPublished() {
    Instant now = Instant.now();
    return repository.findAll().stream()
        .filter(p -> p.scheduledAt() != null && p.scheduledAt().isBefore(now))
        .sorted(Comparator.comparing(SlackPost::scheduledAt).reversed())
        .toList();
  }

  private static SlackPost withId(String postId, SlackPost post) {
    return new SlackPost(postId, post.channelId(), post.channelName(), post.text(), post.scheduledAt());
  }

  private static String newId() {
    return "sp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
  }

  private static void validateScheduledAtNotInPast(Instant scheduledAt) {
    if (scheduledAt == null) return;

    Instant now = Instant.now();
    if (scheduledAt.isBefore(now)) {
      throw new IllegalArgumentException("scheduledAt must be now or in the future");
    }
  }
}
