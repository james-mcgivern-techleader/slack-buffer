package dev.slackbuffer.slack;

import com.slack.api.bolt.App;
import com.slack.api.bolt.jakarta_servlet.SlackAppServlet;
import jakarta.servlet.annotation.WebServlet;

import java.io.Serial;

@WebServlet("/slack/events")
public class SlackAppController extends SlackAppServlet {

  @Serial
  private static final long serialVersionUID = 1L;

  public SlackAppController(App app) {
    super(app);
  }
}
