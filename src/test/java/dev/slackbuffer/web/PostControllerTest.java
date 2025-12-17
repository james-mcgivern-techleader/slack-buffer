package dev.slackbuffer.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.slackbuffer.model.SlackPost;
import dev.slackbuffer.post.SlackPostService;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PostControllerTest {

  @Test
  void createPost_returnsCreatedAndCallsService() throws Exception {
    SlackPostService slackPostService = mock(SlackPostService.class);

    SlackPost created =
        new SlackPost(
            "sp_123",
            "C123",
            "#general",
            "hello",
            Instant.parse("2025-01-01T00:00:00Z"));

    when(slackPostService.create(any(SlackPost.class))).thenReturn(created);

    MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostController(slackPostService)).build();

    String json =
        "{" +
        "\"postId\":null," +
        "\"channelId\":\"C123\"," +
        "\"channelName\":\"#general\"," +
        "\"text\":\"hello\"," +
        "\"scheduledAt\":\"2025-01-01T00:00:00Z\"" +
        "}";

    mvc.perform(post("/v1/api/post").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isCreated());

    verify(slackPostService).create(any(SlackPost.class));
  }

  @Test
  void deletePost_returnsNoContentAndCallsService() throws Exception {
    SlackPostService slackPostService = mock(SlackPostService.class);

    MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostController(slackPostService)).build();

    mvc.perform(delete("/v1/api/post/sp_123")).andExpect(status().isNoContent());

    verify(slackPostService).delete("sp_123");
  }
}
