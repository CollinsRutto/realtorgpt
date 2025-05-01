interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SessionData {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
}

class MemoryBufferService {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Set up periodic cleanup
    setInterval(() => this.cleanupSessions(), 5 * 60 * 1000); // Check every 5 minutes
  }

  createSession(): string {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
    return sessionId;
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });
    session.lastActivity = Date.now();
    return true;
  }

  getMessages(sessionId: string): ChatMessage[] | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    session.lastActivity = Date.now();
    return [...session.messages];
  }

  resetSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.messages = [];
    session.lastActivity = Date.now();
    return true;
  }

  private cleanupSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export as singleton
export const memoryBuffer = new MemoryBufferService();