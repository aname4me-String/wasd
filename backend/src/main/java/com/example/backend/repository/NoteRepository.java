package com.example.backend.repository;

import com.example.backend.document.NoteDocument;
import org.springframework.data.couchbase.repository.CouchbaseRepository;

public interface NoteRepository extends CouchbaseRepository<NoteDocument, String> {
}
