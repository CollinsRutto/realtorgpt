// Simple in-memory buffer for chat history
class MemoryBuffer {
  private messages: Record<string, Array<{ role: string; content: string }>> = {};

  addMessage(sessionId: string, role: string, content: string) {
    if (!this.messages[sessionId]) {
      this.messages[sessionId] = [];
    }
    
    this.messages[sessionId].push({ role, content });
  }

  getMessages(sessionId: string) {
    return this.messages[sessionId] || [];
  }

  resetSession(sessionId: string) {
    this.messages[sessionId] = [];
  }
}

// Singleton instance
const memoryBuffer = new MemoryBuffer();
export default memoryBuffer;