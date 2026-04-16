package com.example.backend.document;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.couchbase.core.mapping.Document;

import java.time.Instant;

@Document
public class NoteDocument {

    @Id
    private String id;

    @NotBlank
    private String title;

    private String content;

    @Version
    private Long version;

    private Instant updatedAt;

    public NoteDocument() {
    }

    public NoteDocument(String id, String title, String content, Long version, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.version = version;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
