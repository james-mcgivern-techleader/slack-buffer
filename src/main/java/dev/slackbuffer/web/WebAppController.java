package dev.slackbuffer.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebAppController {

  @GetMapping({
      "/",
      "/create",
      "/scheduled",
      "/published",
      "/login",
      "/signup",
      "/profile",
      "/app",
      "/app/",
      "/app/create",
      "/app/scheduled",
      "/app/published",
      "/app/login",
      "/app/signup",
      "/app/profile"
  })
  public String app() {
    return "forward:/app/index.html";
  }
}
