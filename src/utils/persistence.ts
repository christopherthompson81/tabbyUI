export interface Conversation {
  id: string;
  name: string;
  messages: any[];
  timestamp: number;
  author?: string;
  folderId?: string;
}

export interface ConversationFolder {
  id: string;
  name: string;
  conversations: Conversation[];
  subfolders: ConversationFolder[];
  timestamp: number;
  author?: string;
}

export function getPersistedConversations(): ConversationFolder[] {
  const data = localStorage.getItem('conversations');
  if (!data) {
    // Initialize with a default folder
    return [{
      id: 'root',
      name: 'Conversations',
      conversations: [],
      subfolders: [],
      timestamp: Date.now()
    }];
  }
  return JSON.parse(data);
}

export function persistConversations(folders: ConversationFolder[]) {
  localStorage.setItem('conversations', JSON.stringify(folders));
}

export function getPersistedCurrentConversationId() {
  return JSON.parse(localStorage.getItem('currentConversationId') || null);
}

export function persistCurrentConversationId(id: number) {
  localStorage.setItem('currentConversationId', JSON.stringify(id));
}

export function getPersistedServerUrl() {
  return localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000';
}

export function persistServerUrl(url: string) {
  localStorage.setItem('serverUrl', url);
}

export function getPersistedApiKey() {
  return localStorage.getItem('apiKey') || '';
}

export function persistApiKey(key: string) {
  localStorage.setItem('apiKey', key);
}

export function getPersistedAdminApiKey() {
  return localStorage.getItem('adminApiKey') || '';
}

export function persistAdminApiKey(key: string) {
  localStorage.setItem('adminApiKey', key);
}

export function getPersistedGenerationParams() {
  return {
    maxTokens: localStorage.getItem('maxTokens') || 150,
    temperature: localStorage.getItem('temperature') || 1,
    topP: localStorage.getItem('topP') || 1,
    topK: localStorage.getItem('topK') || -1,
    frequencyPenalty: localStorage.getItem('frequencyPenalty') || 0,
    presencePenalty: localStorage.getItem('presencePenalty') || 0,
    repetitionPenalty: localStorage.getItem('repetitionPenalty') || 1,
    typicalP: localStorage.getItem('typicalP') || 1,
    minTokens: localStorage.getItem('minTokens') || 0,
    generateWindow: localStorage.getItem('generateWindow') || 512,
    tokenHealing: localStorage.getItem('tokenHealing') || 'true',
    mirostatMode: localStorage.getItem('mirostatMode') || 0,
    mirostatTau: localStorage.getItem('mirostatTau') || 1.5,
    mirostatEta: localStorage.getItem('mirostatEta') || 0.3,
    addBosToken: localStorage.getItem('addBosToken') || 'true',
    banEosToken: localStorage.getItem('banEosToken') || 'false',
  };
}

export function persistGenerationParam(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function findConversation(
  folders: ConversationFolder[],
  conversationId: string
): Conversation | null {
  for (const folder of folders) {
    // Check current folder's conversations
    const conversation = folder.conversations.find(c => c.id === conversationId);
    if (conversation) return conversation;
    
    // Recursively check subfolders
    const subfolderResult = findConversation(folder.subfolders, conversationId);
    if (subfolderResult) return subfolderResult;
  }
  return null;
}

export function findFirstConversation(folders: ConversationFolder[]): Conversation | null {
  for (const folder of folders) {
    if (folder.conversations.length > 0) {
      return folder.conversations[0];
    }
    const subfolderResult = findFirstConversation(folder.subfolders);
    if (subfolderResult) return subfolderResult;
  }
  return null;
}
