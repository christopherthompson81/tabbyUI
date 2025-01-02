export function getPersistedConversations() {
  return JSON.parse(localStorage.getItem('conversations') || '[]');
}

export function persistConversations(conversations: any[]) {
  localStorage.setItem('conversations', JSON.stringify(conversations));
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
