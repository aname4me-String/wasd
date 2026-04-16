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

    private String sourceFileName;

    private String contentType;

    @Version
    private Long version;

    private Instant updatedAt;

    public NoteDocument() {
    }

    public NoteDocument(String id, String title, String content, String sourceFileName, String contentType, Long version, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.sourceFileName = sourceFileName;
        this.contentType = contentType;
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

    public String getSourceFileName() {
        return sourceFileName;
    }

    public void setSourceFileName(String sourceFileName) {
        this.sourceFileName = sourceFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
