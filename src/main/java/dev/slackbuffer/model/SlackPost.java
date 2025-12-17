package dev.slackbuffer.model;

import java.time.Instant;

public record SlackPost(
    String postId,
    String channelId,
    String channelName,
    String text,
    Instant scheduledAt) {}
