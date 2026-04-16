package com.example.backend.service;

import com.example.backend.document.NoteDocument;
import com.example.backend.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<NoteDocument> findAll() {
        return noteRepository.findAll().stream()
                .sorted(Comparator.comparing(NoteDocument::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public NoteDocument create(NoteDocument note) {
        note.setId(UUID.randomUUID().toString());
        note.setUpdatedAt(Instant.now());
        return noteRepository.save(note);
    }

    public NoteDocument update(String id, NoteDocument note) {
        NoteDocument existing = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + id));

        existing.setTitle(note.getTitle());
        existing.setContent(note.getContent());
        existing.setSourceFileName(note.getSourceFileName());
        existing.setContentType(note.getContentType());
        existing.setUpdatedAt(Instant.now());

        return noteRepository.save(existing);
    }

    public void delete(String id) {
        noteRepository.deleteById(id);
    }
}
