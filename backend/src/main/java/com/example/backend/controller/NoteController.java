package com.example.backend.controller;

import com.example.backend.document.NoteDocument;
import com.example.backend.service.NoteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> getAll() {
        return noteService.findAll().stream()
                .map(NoteResponse::from)
                .toList();
    }

    @PostMapping
    public NoteResponse create(@Valid @RequestBody NoteRequest request) {
        NoteDocument document = new NoteDocument();
        document.setTitle(request.title());
        document.setContent(request.content());
        document.setSourceFileName(request.sourceFileName());
        document.setContentType(request.contentType());
        return NoteResponse.from(noteService.create(document));
    }

    @PutMapping("/{id}")
    public NoteResponse update(@PathVariable String id, @Valid @RequestBody NoteRequest request) {
        NoteDocument document = new NoteDocument();
        document.setTitle(request.title());
        document.setContent(request.content());
        document.setSourceFileName(request.sourceFileName());
        document.setContentType(request.contentType());
        return NoteResponse.from(noteService.update(id, document));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        noteService.delete(id);
    }

    public record NoteRequest(@NotBlank String title, String content, String sourceFileName, String contentType) {}

    public record NoteResponse(
            String id,
            String title,
            String content,
            String sourceFileName,
            String contentType,
            Long version,
            Instant updatedAt
    ) {
        static NoteResponse from(NoteDocument doc) {
            return new NoteResponse(
                    doc.getId(),
                    doc.getTitle(),
                    doc.getContent(),
                    doc.getSourceFileName(),
                    doc.getContentType(),
                    doc.getVersion(),
                    doc.getUpdatedAt()
            );
        }
    }
}
