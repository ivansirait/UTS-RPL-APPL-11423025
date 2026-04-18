package com.meditrack.monolith.model;

public class Report {
    private final String id;
    private final String type;
    private final String content;

    public Report(String id, String type, String content) {
        this.id = id;
        this.type = type;
        this.content = content;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getContent() {
        return content;
    }
}
