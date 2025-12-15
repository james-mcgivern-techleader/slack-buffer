package dev.slackbuffer.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebAppController {

  @GetMapping({
      "/",
      "/login",
      "/signup",
      "/app",
      "/app/",
      "/app/login",
      "/app/signup"
  })
  public String app() {
    return "forward:/app/index.html";
  }
}
