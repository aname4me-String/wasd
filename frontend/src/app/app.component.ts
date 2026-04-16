import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface Note {
  id: string;
  title: string;
  content: string;
  sourceFileName?: string;
  contentType?: string;
  version: number;
  updatedAt: string;
}

interface NotePayload {
  title: string;
  content: string;
  sourceFileName?: string;
  contentType?: string;
}

interface PendingMutation {
  type: 'create' | 'update' | 'delete';
  noteId?: string;
  clientTempId?: string;
  payload?: NotePayload;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/notes';
  private readonly notesCacheKey = 'wasd-notes-cache-v1';
  private readonly queueCacheKey = 'wasd-pending-queue-v1';
  private syncing = false;

  notes: Note[] = [];
  title = '';
  content = '';
  sourceFileName = '';
  contentType = '';
  editingId: string | null = null;
  isOnline = navigator.onLine;
  syncMessage = '';
  pendingCount = 0;

  ngOnInit(): void {
    this.loadLocalState();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.loadNotes();
    void this.flushQueue();
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  loadNotes(): void {
    if (!this.isOnline) {
      this.syncMessage = 'You are offline. Showing cached notes.';
      return;
    }

    this.http.get<Note[]>(this.apiUrl).subscribe((notes) => {
      this.notes = notes;
      this.saveNotesCache();
      this.syncMessage = '';
    }, () => {
      this.syncMessage = 'Could not load from server. Showing cached notes if available.';
    });
  }

  saveNote(): void {
    const payload = this.buildPayload();

    if (this.editingId) {
      this.saveUpdate(payload);
      return;
    }

    this.saveCreate(payload);
  }

  edit(note: Note): void {
    this.editingId = note.id;
    this.title = note.title;
    this.content = note.content;
    this.sourceFileName = note.sourceFileName ?? '';
    this.contentType = note.contentType ?? '';
  }

  delete(id: string): void {
    if (!this.isOnline) {
      this.applyLocalDelete(id);
      this.enqueue({ type: 'delete', noteId: id });
      this.syncMessage = 'Offline: delete queued.';
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => {
      this.notes = this.notes.filter((note) => note.id !== id);
      this.saveNotesCache();
      this.syncMessage = '';
    }, (error) => {
      if (this.isOfflineError(error)) {
        this.handleOffline();
        this.applyLocalDelete(id);
        this.enqueue({ type: 'delete', noteId: id });
        this.syncMessage = 'Offline: delete queued.';
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.title = '';
    this.content = '';
    this.sourceFileName = '';
    this.contentType = '';
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.sourceFileName = file.name;
    this.contentType = file.type || 'text/plain';
    if (!this.title.trim()) {
      this.title = file.name;
    }
    this.content = await file.text();
  }

  private saveCreate(payload: NotePayload): void {
    if (!this.isOnline) {
      const tempId = this.createTempId();
      this.applyLocalCreate(tempId, payload);
      this.enqueue({ type: 'create', clientTempId: tempId, payload });
      this.syncMessage = 'Offline: create queued.';
      this.resetForm();
      return;
    }

    this.http.post<Note>(this.apiUrl, payload).subscribe((created) => {
      this.notes = [created, ...this.notes.filter((note) => note.id !== created.id)];
      this.saveNotesCache();
      this.syncMessage = '';
      this.resetForm();
    }, (error) => {
      if (this.isOfflineError(error)) {
        this.handleOffline();
        const tempId = this.createTempId();
        this.applyLocalCreate(tempId, payload);
        this.enqueue({ type: 'create', clientTempId: tempId, payload });
        this.syncMessage = 'Offline: create queued.';
        this.resetForm();
      }
    });
  }

  private saveUpdate(payload: NotePayload): void {
    if (!this.editingId) {
      return;
    }

    const id = this.editingId;
    if (!this.isOnline) {
      this.applyLocalUpdate(id, payload);
      this.enqueue({ type: 'update', noteId: id, payload });
      this.syncMessage = 'Offline: update queued.';
      this.resetForm();
      return;
    }

    this.http.put<Note>(`${this.apiUrl}/${id}`, payload).subscribe((updated) => {
      this.notes = this.notes.map((note) => note.id === updated.id ? updated : note);
      this.saveNotesCache();
      this.syncMessage = '';
      this.resetForm();
    }, (error) => {
      if (this.isOfflineError(error)) {
        this.handleOffline();
        this.applyLocalUpdate(id, payload);
        this.enqueue({ type: 'update', noteId: id, payload });
        this.syncMessage = 'Offline: update queued.';
        this.resetForm();
      }
    });
  }

  private buildPayload(): NotePayload {
    const title = this.title.trim() || this.sourceFileName.trim() || 'Untitled file';
    return {
      title,
      content: this.content,
      sourceFileName: this.sourceFileName.trim() || undefined,
      contentType: this.contentType.trim() || undefined
    };
  }

  private createTempId(): string {
    return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private applyLocalCreate(id: string, payload: NotePayload): void {
    const now = new Date().toISOString();
    const localNote: Note = {
      id,
      title: payload.title,
      content: payload.content,
      sourceFileName: payload.sourceFileName,
      contentType: payload.contentType,
      version: 0,
      updatedAt: now
    };
    this.notes = [localNote, ...this.notes.filter((note) => note.id !== id)];
    this.saveNotesCache();
  }

  private applyLocalUpdate(id: string, payload: NotePayload): void {
    const now = new Date().toISOString();
    this.notes = this.notes.map((note) => note.id === id ? {
      ...note,
      title: payload.title,
      content: payload.content,
      sourceFileName: payload.sourceFileName,
      contentType: payload.contentType,
      updatedAt: now
    } : note);
    this.saveNotesCache();
  }

  private applyLocalDelete(id: string): void {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.saveNotesCache();
  }

  private enqueue(mutation: PendingMutation): void {
    const queue = this.readQueue();
    queue.push(mutation);
    this.writeQueue(queue);
  }

  private readQueue(): PendingMutation[] {
    try {
      const raw = localStorage.getItem(this.queueCacheKey);
      return raw ? JSON.parse(raw) as PendingMutation[] : [];
    } catch {
      return [];
    }
  }

  private writeQueue(queue: PendingMutation[]): void {
    localStorage.setItem(this.queueCacheKey, JSON.stringify(queue));
    this.pendingCount = queue.length;
  }

  private loadLocalState(): void {
    try {
      const raw = localStorage.getItem(this.notesCacheKey);
      if (raw) {
        this.notes = JSON.parse(raw) as Note[];
      }
    } catch {
      this.notes = [];
    }
    this.pendingCount = this.readQueue().length;
  }

  private saveNotesCache(): void {
    localStorage.setItem(this.notesCacheKey, JSON.stringify(this.notes));
  }

  private readonly handleOnline = () => {
    this.isOnline = true;
    this.syncMessage = 'Back online. Syncing queued changes...';
    void this.flushQueue();
    this.loadNotes();
  };

  private readonly handleOffline = () => {
    this.isOnline = false;
    this.syncMessage = 'You are offline. Changes will sync automatically.';
  };

  private async flushQueue(): Promise<void> {
    if (!this.isOnline || this.syncing) {
      return;
    }

    const queue = this.readQueue();
    if (!queue.length) {
      this.pendingCount = 0;
      return;
    }

    this.syncing = true;
    const idMap = new Map<string, string>();
    const remaining = [...queue];

    try {
      while (remaining.length) {
        const mutation = remaining[0];
        if (mutation.type === 'create' && mutation.payload) {
          const created = await firstValueFrom(this.http.post<Note>(this.apiUrl, mutation.payload));
          if (mutation.clientTempId) {
            idMap.set(mutation.clientTempId, created.id);
            this.notes = this.notes.map((note) => note.id === mutation.clientTempId ? created : note);
          }
          remaining.shift();
          this.writeQueue(this.remapQueueWithResolvedIds(remaining, idMap));
          continue;
        }

        if (mutation.type === 'update' && mutation.payload && mutation.noteId) {
          const resolvedId = idMap.get(mutation.noteId) ?? mutation.noteId;
          const updated = await firstValueFrom(this.http.put<Note>(`${this.apiUrl}/${resolvedId}`, mutation.payload));
          this.notes = this.notes.map((note) => note.id === resolvedId ? updated : note);
          remaining.shift();
          this.writeQueue(this.remapQueueWithResolvedIds(remaining, idMap));
          continue;
        }

        if (mutation.type === 'delete' && mutation.noteId) {
          const resolvedId = idMap.get(mutation.noteId) ?? mutation.noteId;
          await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${resolvedId}`));
          this.notes = this.notes.filter((note) => note.id !== resolvedId);
          remaining.shift();
          this.writeQueue(this.remapQueueWithResolvedIds(remaining, idMap));
          continue;
        }

        remaining.shift();
        this.writeQueue(this.remapQueueWithResolvedIds(remaining, idMap));
      }

      this.saveNotesCache();
      this.syncMessage = 'All offline changes synced.';
    } catch (error) {
      if (this.isOfflineError(error)) {
        this.handleOffline();
        this.syncMessage = 'Connection lost during sync. Pending changes kept.';
      } else {
        this.syncMessage = 'Some queued changes could not be synced yet.';
      }
    } finally {
      this.syncing = false;
      this.pendingCount = this.readQueue().length;
    }
  }

  private isOfflineError(error: unknown): boolean {
    const candidate = error as { status?: number };
    return !navigator.onLine || candidate?.status === 0;
  }

  private remapQueueWithResolvedIds(queue: PendingMutation[], idMap: Map<string, string>): PendingMutation[] {
    return queue.map((mutation) => ({
      ...mutation,
      noteId: mutation.noteId ? (idMap.get(mutation.noteId) ?? mutation.noteId) : mutation.noteId
    }));
  }
}
