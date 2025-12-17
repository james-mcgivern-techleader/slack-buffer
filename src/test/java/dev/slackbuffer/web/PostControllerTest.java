package dev.slackbuffer.web;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.slackbuffer.post.SlackPostService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PostControllerTest {

  @Test
  void deletePost_returnsNoContentAndCallsService() throws Exception {
    SlackPostService slackPostService = mock(SlackPostService.class);

    MockMvc mvc = MockMvcBuilders.standaloneSetup(new PostController(slackPostService)).build();

    mvc.perform(delete("/v1/api/post/sp_123")).andExpect(status().isNoContent());

    verify(slackPostService).delete("sp_123");
  }
}
