package dev.slackbuffer.model;

import java.time.Instant;

public record SlackPost(
    String id,
    String channelId,
    String channelName,
    String text,
    Instant scheduledAt) {}
