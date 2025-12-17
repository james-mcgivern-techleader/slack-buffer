package dev.slackbuffer.post;

import dev.slackbuffer.model.SlackPost;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    // Seed stub data so the UI has something to show.
    // TODO: remove once posts are created via the Create flow.
    seedIfEmpty();
  }

  public SlackPost create(SlackPost post) {
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

  private void seedIfEmpty() {
    if (!repository.findAll().isEmpty()) return;

    Instant now = Instant.now();

    repository.save(
        new SlackPost(
            "sp_001",
            "C00000001",
            "#general",
            "Reminder: team sync in 10 minutes.",
            now.plus(10, ChronoUnit.MINUTES)));

    repository.save(
        new SlackPost(
            "sp_002",
            "C00000003",
            "#announcements",
            "Release notes draft ready for review.",
            now.plus(2, ChronoUnit.HOURS)));

    repository.save(
        new SlackPost(
            "sp_003",
            "C00000002",
            "#random",
            "Friday fun: post your best pet photo.",
            now.plus(2, ChronoUnit.DAYS)));

    repository.save(
        new SlackPost(
            "pp_001",
            "C00000003",
            "#announcements",
            "Yesterday's update: build pipeline improved.",
            now.minus(1, ChronoUnit.DAYS)));

    repository.save(
        new SlackPost(
            "pp_002",
            "C00000001",
            "#general",
            "Last week's reminder: submit your timesheets.",
            now.minus(7, ChronoUnit.DAYS)));

    repository.save(
        new SlackPost(
            "pp_003",
            "C00000002",
            "#random",
            "Two weeks ago: share your favorite keyboard shortcuts.",
            now.minus(14, ChronoUnit.DAYS)));
  }
}
