// Define the types for our service
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type QueryResult = {
  response: string;
  responseTime?: string;
  error?: string;
};

class DeepSeekService {
  private apiUrl: string;

  constructor() {
    // Use the local API route
    this.apiUrl = '/api/deno-deepseek';
  }

  async query(message: string, messageHistory: ChatMessage[] = [], context: string = 'general'): Promise<QueryResult> {
    try {
      console.log('Sending request to DeepSeek API:', {
        message,
        messageHistory: messageHistory.length,
        context
      });
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          messageHistory,
          context
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return {
        response: data.response || 'No response provided',
        responseTime: data.responseTime
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  async queryWithFallback(message: string, messageHistory: ChatMessage[] = [], context: string = 'general'): Promise<QueryResult> {
    try {
      return await this.query(message, messageHistory, context);
    } catch (error) {
      console.error('Primary API failed, using fallback response:', error);
      
      // Generate a simple fallback response
      return {
        response: `I'm currently experiencing connectivity issues with my knowledge service. Here's a general response: 
        
        ${this.generateFallbackResponse(message, context)}
        
        For more specific information, please try again later when my services are fully operational. 🏠`,
      };
    }
  }

  private generateFallbackResponse(message: string, context: string): string {
    // Simple fallback responses for real estate related questions
    if (message.toLowerCase().includes('property') || message.toLowerCase().includes('listing')) {
      return "When creating property listings, focus on **high-quality photos**, detailed descriptions, and highlighting unique features. Virtual tours can also significantly increase engagement. 📸✨";
    } else if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price')) {
      return "Real estate markets vary by location. It's important to research comparable properties, consider current trends, and consult local market reports for accurate pricing. 📊🏘️";
    } else if (message.toLowerCase().includes('client') || message.toLowerCase().includes('buyer')) {
      return "Building strong client relationships is essential in real estate. Regular communication, understanding client needs, and providing valuable market insights can help build trust. 🤝💼";
    } else {
      return "As a real estate assistant, I can help with property listings, market analysis, client management strategies, and marketing techniques when my full services are available. 🏠🔍";
    }
  }
}

// Singleton pattern to reuse the service
let deepseekService: DeepSeekService | null = null;

export function getDeepSeekService(): DeepSeekService {
  if (!deepseekService) {
    deepseekService = new DeepSeekService();
  }
  return deepseekService;
}