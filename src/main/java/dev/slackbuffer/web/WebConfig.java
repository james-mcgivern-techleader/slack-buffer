package dev.slackbuffer.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final AuthRequiredInterceptor authRequiredInterceptor;

  public WebConfig(AuthRequiredInterceptor authRequiredInterceptor) {
    this.authRequiredInterceptor = authRequiredInterceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(authRequiredInterceptor)
        .addPathPatterns(
            "/create",
            "/scheduled",
            "/published",
            "/profile",
            "/app/create",
            "/app/scheduled",
            "/app/published",
            "/app/profile",
            "/v1/api/**");
  }
}
