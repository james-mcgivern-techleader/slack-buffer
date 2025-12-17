package dev.slackbuffer.post;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.slackbuffer.model.SlackPost;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class SlackPostServiceTest {

  @Test
  void create_savesNewSlackPostAndAssignsIdWhenMissing() {
    SlackPostRepository repo = mock(SlackPostRepository.class);
    when(repo.save(any(SlackPost.class))).thenAnswer(inv -> inv.getArgument(0));

    SlackPostService service = new SlackPostService(repo);

    SlackPost created =
        service.create(
            new SlackPost(
                null,
                "C123",
                "#general",
                "hello",
                Instant.now().plus(1, ChronoUnit.HOURS)));

    assertNotNull(created.postId());
    assertTrue(!created.postId().isBlank());
    assertTrue(created.postId().startsWith("sp_"));

    ArgumentCaptor<SlackPost> captor = ArgumentCaptor.forClass(SlackPost.class);
    verify(repo).save(captor.capture());
    assertEquals(created, captor.getValue());
  }

  @Test
  void create_throwsWhenScheduledAtIsInThePast() {
    SlackPostRepository repo = mock(SlackPostRepository.class);
    SlackPostService service = new SlackPostService(repo);

    SlackPost past =
        new SlackPost(
            null,
            "C123",
            "#general",
            "hello",
            Instant.now().minus(1, ChronoUnit.MINUTES));

    assertThrows(IllegalArgumentException.class, () -> service.create(past));
  }

  @Test
  void update_modifiesExistingSlackPost() {
    SlackPostRepository repo = mock(SlackPostRepository.class);

    SlackPost existing =
        new SlackPost(
            "sp_123",
            "C123",
            "#general",
            "old",
            Instant.now().plus(2, ChronoUnit.HOURS));

    when(repo.findByPostId("sp_123")).thenReturn(Optional.of(existing));
    when(repo.save(any(SlackPost.class))).thenAnswer(inv -> inv.getArgument(0));

    SlackPostService service = new SlackPostService(repo);

    SlackPost updated =
        service.update(
            "sp_123",
            new SlackPost(
                null,
                null,
                null,
                "new",
                null));

    SlackPost expected =
        new SlackPost(
            "sp_123",
            "C123",
            "#general",
            "new",
            existing.scheduledAt());

    assertEquals(expected, updated);

    ArgumentCaptor<SlackPost> captor = ArgumentCaptor.forClass(SlackPost.class);
    verify(repo).save(captor.capture());
    assertEquals(expected, captor.getValue());
  }

  @Test
  void update_throwsWhenScheduledAtIsInThePast() {
    SlackPostRepository repo = mock(SlackPostRepository.class);

    SlackPost existing =
        new SlackPost(
            "sp_123",
            "C123",
            "#general",
            "old",
            Instant.now().plus(2, ChronoUnit.HOURS));

    when(repo.findByPostId("sp_123")).thenReturn(Optional.of(existing));

    SlackPostService service = new SlackPostService(repo);

    SlackPost patch =
        new SlackPost(
            null,
            null,
            null,
            "new",
            Instant.now().minus(1, ChronoUnit.MINUTES));

    assertThrows(IllegalArgumentException.class, () -> service.update("sp_123", patch));
  }

  @Test
  void update_throwsWhenSlackPostDoesNotExist() {
    SlackPostRepository repo = mock(SlackPostRepository.class);
    when(repo.findByPostId("missing")).thenReturn(Optional.empty());

    SlackPostService service = new SlackPostService(repo);

    assertThrows(
        NoSuchElementException.class,
        () -> service.update("missing", new SlackPost(null, null, null, "x", null)));
  }

  @Test
  void upsert_createsWhenSlackPostDoesNotExistForId() {
    SlackPostRepository repo = mock(SlackPostRepository.class);
    when(repo.findByPostId("sp_999")).thenReturn(Optional.empty());
    when(repo.save(any(SlackPost.class))).thenAnswer(inv -> inv.getArgument(0));

    SlackPostService service = new SlackPostService(repo);

    SlackPost result =
        service.upsert(
            "sp_999",
            new SlackPost(
                null,
                "C999",
                "#random",
                "hello",
                Instant.now().plus(3, ChronoUnit.HOURS)));

    assertEquals("sp_999", result.postId());

    ArgumentCaptor<SlackPost> captor = ArgumentCaptor.forClass(SlackPost.class);
    verify(repo).save(captor.capture());
    assertEquals("sp_999", captor.getValue().postId());

    verify(repo).findByPostId("sp_999");
  }

  @Test
  void upsert_updatesWhenSlackPostAlreadyExistsForId() {
    SlackPostRepository repo = mock(SlackPostRepository.class);

    SlackPost existing =
        new SlackPost(
            "sp_777",
            "C777",
            "#general",
            "old",
            Instant.now().plus(4, ChronoUnit.HOURS));

    when(repo.findByPostId("sp_777")).thenReturn(Optional.of(existing));
    when(repo.save(any(SlackPost.class))).thenAnswer(inv -> inv.getArgument(0));

    SlackPostService service = new SlackPostService(repo);

    SlackPost result = service.upsert("sp_777", new SlackPost(null, null, null, "new", null));

    SlackPost expected =
        new SlackPost(
            "sp_777",
            "C777",
            "#general",
            "new",
            existing.scheduledAt());

    assertEquals(expected, result);

    verify(repo, times(2)).findByPostId("sp_777");

    ArgumentCaptor<SlackPost> captor = ArgumentCaptor.forClass(SlackPost.class);
    verify(repo).save(captor.capture());
    assertEquals(expected, captor.getValue());
  }
}
