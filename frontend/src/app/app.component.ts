import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Note {
  id: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/notes';

  notes: Note[] = [];
  title = '';
  content = '';
  editingId: string | null = null;

  constructor() {
    this.loadNotes();
  }

  loadNotes(): void {
    this.http.get<Note[]>(this.apiUrl).subscribe((notes) => {
      this.notes = notes;
    });
  }

  saveNote(): void {
    const payload = { title: this.title, content: this.content };

    if (this.editingId) {
      this.http.put<Note>(`${this.apiUrl}/${this.editingId}`, payload).subscribe(() => {
        this.resetForm();
        this.loadNotes();
      });
      return;
    }

    this.http.post<Note>(this.apiUrl, payload).subscribe(() => {
      this.resetForm();
      this.loadNotes();
    });
  }

  edit(note: Note): void {
    this.editingId = note.id;
    this.title = note.title;
    this.content = note.content;
  }

  delete(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => {
      this.loadNotes();
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.title = '';
    this.content = '';
  }
}
