import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatbotService } from '../../core/services/chatbot.service';
import { ChatMessage } from '../../core/models/chat.model';
import { fadeInUp, bubbleIn } from '../../shared/animations';

interface BubbleMessage extends ChatMessage {
  isError?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  animations: [fadeInUp, bubbleIn],
  template: `
    <div class="page-container" style="display:flex;flex-direction:column;height:calc(100vh - 80px)" [@fadeInUp]>
      <h1 class="page-title">
        <mat-icon>chat</mat-icon> Banking Assistant
      </h1>

      <mat-card style="flex:1;display:flex;flex-direction:column;overflow:hidden;padding:0">
        <!-- Messages area -->
        <div #messagesContainer class="chat-messages" style="flex:1;overflow-y:auto;padding:20px">
          <!-- Empty state with suggestions -->
          <div *ngIf="messages.length === 0" style="margin:auto;text-align:center;max-width:520px">
            <mat-icon style="font-size:64px;width:64px;height:64px;color:#9fa8da">smart_toy</mat-icon>
            <h2 style="color:#3f51b5;margin:12px 0 8px;font-weight:600">How can I help you?</h2>
            <p style="color:#666;margin-bottom:24px">Ask me anything about your clients, wallets or ledgerEntries.</p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
              <div *ngFor="let s of suggestions" class="suggestion-chip" (click)="useSuggestion(s)">
                {{ s }}
              </div>
            </div>
          </div>

          <!-- Conversation -->
          <div *ngFor="let msg of messages" style="margin-bottom:14px;display:flex;gap:8px;align-items:flex-end"
            [@bubbleIn]
            [style.flex-direction]="msg.role === 'user' ? 'row-reverse' : 'row'">
            <div [style.background]="msg.role === 'user' ? '#3f51b5' : (msg.isError ? '#f44336' : '#9fa8da')"
              style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0">
              <mat-icon style="font-size:18px;width:18px;height:18px">
                {{ msg.role === 'user' ? 'person' : (msg.isError ? 'error_outline' : 'smart_toy') }}
              </mat-icon>
            </div>
            <div [class]="msg.role === 'user' ? 'chat-bubble-user' : (msg.isError ? 'chat-bubble-assistant chat-bubble-error' : 'chat-bubble-assistant')">
              <div style="white-space:pre-wrap">{{ msg.content }}</div>
              <div style="font-size:.68rem;opacity:.7;margin-top:6px;text-align:right">{{ msg.timestamp | date:'HH:mm' }}</div>
            </div>
          </div>

          <!-- Thinking indicator -->
          <div *ngIf="thinking" [@bubbleIn] style="display:flex;align-items:flex-end;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:#9fa8da;display:flex;align-items:center;justify-content:center;color:white">
              <mat-icon style="font-size:18px;width:18px;height:18px">smart_toy</mat-icon>
            </div>
            <div class="chat-bubble-assistant">
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>

        <!-- Input bar -->
        <div style="padding:14px 20px;border-top:1px solid #eee;display:flex;gap:10px;align-items:center;background:white">
          <mat-form-field appearance="outline" style="flex:1;margin-bottom:-1.25em" subscriptSizing="dynamic">
            <input matInput
              [(ngModel)]="inputMessage"
              (keydown.enter)="sendMessage()"
              placeholder="Type your message..."
              [disabled]="thinking">
          </mat-form-field>
          <button mat-fab color="primary" (click)="sendMessage()"
            [disabled]="!inputMessage.trim() || thinking"
            style="box-shadow:0 4px 12px rgba(63,81,181,.3)">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </mat-card>
    </div>
  `
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: BubbleMessage[] = [];
  inputMessage = '';
  thinking = false;
  conversationId: string | undefined;

  suggestions = [
    'How many clients do we have?',
    'Show me the total balance across all wallets',
    'What are the recent ledgerEntries?',
    'How does an overdraft work?'
  ];

  constructor(private chatbotService: ChatbotService) {}

  ngAfterViewChecked() { this.scrollToBottom(); }

  useSuggestion(s: string) {
    this.inputMessage = s;
  }

  sendMessage() {
    const text = this.inputMessage.trim();
    if (!text || this.thinking) return;

    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.inputMessage = '';
    this.thinking = true;

    this.chatbotService.chat({ message: text, conversationId: this.conversationId }).subscribe({
      next: res => {
        this.conversationId = res.conversationId;
        this.messages.push({ role: 'assistant', content: res.response, timestamp: new Date() });
        this.thinking = false;
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I could not reach the assistant service. Please try again in a moment.',
          timestamp: new Date(),
          isError: true
        });
        this.thinking = false;
      }
    });
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
