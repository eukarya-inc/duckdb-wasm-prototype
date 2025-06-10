import Anthropic from '@anthropic-ai/sdk';
import { type Message, type TaskLoopConfig, type TaskLoopCallbacks, type TaskLoopFunction, type TaskLoopState } from './types';
import { generateSystemPrompt } from './systemPrompt';

export class TaskLoop {
  private anthropic: Anthropic;
  private config: TaskLoopConfig;
  private state: TaskLoopState;

  constructor(config: TaskLoopConfig) {
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1000,
      ...config,
    };

    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true,
    });

    this.state = {
      isRunning: false,
      currentMessage: '',
      conversationHistory: [],
    };
  }

  /**
   * Creates a task loop function that can process messages
   */
  public createTaskLoop(): TaskLoopFunction {
    return async (message: string, callbacks?: TaskLoopCallbacks) => {
      if (this.state.isRunning) {
        console.warn('TaskLoop is already running');
        return;
      }

      try {
        this.state.isRunning = true;
        this.state.currentMessage = '';
        
        // Add user message to conversation history
        const userMessage: Message = { role: 'user', content: message };
        this.state.conversationHistory.push(userMessage);

        // For now, we're not implementing the full tool loop as mentioned in the requirements
        // Just implementing basic streaming response functionality
        await this.processMessage(callbacks);

      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error occurred');
        console.error('TaskLoop error:', err);
        callbacks?.onError?.(err);
      } finally {
        this.state.isRunning = false;
      }
    };
  }

  private async processMessage(callbacks?: TaskLoopCallbacks): Promise<void> {
    try {
      // Prepare messages with system prompt
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = 
        this.state.conversationHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }));

      // Stream response from Anthropic
      const stream = await this.anthropic.messages.stream({
        model: this.config.model!,
        max_tokens: this.config.maxTokens!,
        system: generateSystemPrompt(),
        messages,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullContent += chunk.delta.text;
          this.state.currentMessage = fullContent;
          callbacks?.onStreamUpdate?.(fullContent);
        }
      }

      // Add assistant response to conversation history
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullContent || 'エラーが発生しました',
      };
      this.state.conversationHistory.push(assistantMessage);

      callbacks?.onComplete?.(fullContent);

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to process message');
      throw err;
    }
  }

  /**
   * Get current state of the task loop
   */
  public getState(): Readonly<TaskLoopState> {
    return { ...this.state };
  }

  /**
   * Reset the conversation history
   */
  public reset(): void {
    this.state.conversationHistory = [];
    this.state.currentMessage = '';
  }

  /**
   * Get conversation history
   */
  public getConversationHistory(): readonly Message[] {
    return [...this.state.conversationHistory];
  }
}

/**
 * Factory function to create a TaskLoop instance
 */
export function createTaskLoop(config: TaskLoopConfig): TaskLoop {
  return new TaskLoop(config);
}