package dev.slackbuffer.post;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import dev.slackbuffer.model.SlackPost;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class InMemorySlackPostRepositoryTest {

  @Test
  void saveAndFindByPostId_roundTripsSlackPost() {
    InMemorySlackPostRepository repo = new InMemorySlackPostRepository();

    SlackPost post =
        new SlackPost(
            "sp_test_001",
            "C123",
            "#general",
            "hello",
            Instant.parse("2025-01-01T00:00:00Z"));

    repo.save(post);

    assertTrue(repo.findByPostId("sp_test_001").isPresent());
    assertEquals(post, repo.findByPostId("sp_test_001").get());
  }
}
