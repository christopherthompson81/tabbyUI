import { GenerationParams } from "../reducers/settingsReducer";

export interface Conversation {
    id: string;
    name: string;
    messages: any[];
    timestamp: number;
    author?: string;
    folderId?: string;
}

export interface DraftModelParams {
    draft_model_name: string;
    draft_rope_scale: number;
    draft_rope_alpha: number;
    draft_cache_mode: string;
}

export type CacheMode = "FP16" | "Q8" | "Q6" | "Q4";

export interface ModelLoadParams {
    model_name: string;
    max_seq_len: number;
    cache_size: number;
    tensor_parallel: boolean;
    gpu_split_auto: boolean;
    autosplit_reserve: number[];
    gpu_split: number[] | null;
    rope_scale: number;
    rope_alpha: number;
    cache_mode: CacheMode;
    chunk_size: number;
    prompt_template: string;
    vision: boolean;
    num_experts_per_token: number;
    draft_model?: DraftModelParams | null;
    skip_queue: boolean;
}

export interface ConversationFolder {
    id: string;
    name: string;
    conversations: Conversation[];
    subfolders: ConversationFolder[];
    timestamp: number;
    author?: string;
}

export function getModelParams(modelId: string): ModelLoadParams {
    const saved = localStorage.getItem(`modelParams_${modelId}`);
    return saved
        ? JSON.parse(saved)
        : {
              model_name: modelId,
              max_seq_len: 4096,
              cache_size: 4096,
              tensor_parallel: true,
              gpu_split_auto: true,
              autosplit_reserve: [0],
              gpu_split: null,
              rope_scale: 1,
              rope_alpha: 1,
              cache_mode: "FP16",
              chunk_size: 2048,
              prompt_template: "",
              vision: false,
              num_experts_per_token: 0,
              skip_queue: false,
              draft_model: null,
          };
}

export function persistModelParams(modelId: string, params: ModelLoadParams) {
    localStorage.setItem(`modelParams_${modelId}`, JSON.stringify(params));
}

export function getAllModelParams(): { [modelId: string]: ModelLoadParams } {
    const params: { [modelId: string]: ModelLoadParams } = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("modelParams_")) {
            const modelId = key.replace("modelParams_", "");
            const value = localStorage.getItem(key);
            if (value) {
                params[modelId] = JSON.parse(value);
            }
        }
    }
    return params;
}

export function getPersistedConversations(): ConversationFolder[] {
    const data = localStorage.getItem("conversations");
    if (!data) {
        // Initialize with a default folder
        return [
            {
                id: "root",
                name: "Conversations",
                conversations: [],
                subfolders: [],
                timestamp: Date.now(),
            },
        ];
    }
    return JSON.parse(data);
}

export function persistConversations(folders: ConversationFolder[]) {
    localStorage.setItem("conversations", JSON.stringify(folders));
}

export function getPersistedCurrentConversationId() {
    const currentConversationId = localStorage.getItem("currentConversationId");
    return currentConversationId ? JSON.parse(currentConversationId) : false;
}

export function persistCurrentConversationId(id: number) {
    localStorage.setItem("currentConversationId", JSON.stringify(id));
}

export function getPersistedServerUrl() {
    return localStorage.getItem("serverUrl") || "http://127.0.0.1:5000";
}

export function persistServerUrl(url: string) {
    localStorage.setItem("serverUrl", url);
}

export function getPersistedApiKey() {
    return localStorage.getItem("apiKey") || "";
}

export function persistApiKey(key: string) {
    localStorage.setItem("apiKey", key);
}

export function getPersistedAdminApiKey() {
    return localStorage.getItem("adminApiKey") || "";
}

export function persistAdminApiKey(key: string) {
    localStorage.setItem("adminApiKey", key);
}

export function getPersistedGenerationParams(): GenerationParams {
    return {
        maxTokens: Number(localStorage.getItem("maxTokens")) || 32768,
        temperature: Number(localStorage.getItem("temperature")) || 0.6,
        topP: Number(localStorage.getItem("topP")) || 1,
        topK: Number(localStorage.getItem("topK")) || 40,
        frequencyPenalty:
            Number(localStorage.getItem("frequencyPenalty")) || 0.01,
        presencePenalty: Number(localStorage.getItem("presencePenalty")) || 0,
        repetitionPenalty:
            Number(localStorage.getItem("repetitionPenalty")) || 1,
        typicalP: Number(localStorage.getItem("typicalP")) || 1.0,
        minTokens: Number(localStorage.getItem("minTokens")) || 0,
        generateWindow: Number(localStorage.getItem("generateWindow")) || 512,
        tokenHealing: Boolean(localStorage.getItem("tokenHealing")) || true,
        mirostatMode: Number(localStorage.getItem("mirostatMode")) || 0,
        mirostatTau: Number(localStorage.getItem("mirostatTau")) || 1.5,
        mirostatEta: Number(localStorage.getItem("mirostatEta")) || 0.3,
        addBosToken: Boolean(localStorage.getItem("addBosToken")) || true,
        banEosToken: Boolean(localStorage.getItem("banEosToken")) || false,
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
        const conversation = folder.conversations.find(
            (c) => c.id == conversationId
        );
        if (conversation) {
            return conversation;
        }

        // Recursively check subfolders
        const subfolderResult = findConversation(
            folder.subfolders,
            conversationId
        );
        if (subfolderResult) return subfolderResult;
    }
    return null;
}

export function findFirstConversation(
    folders: ConversationFolder[]
): Conversation | null {
    for (const folder of folders) {
        if (folder.conversations.length > 0) {
            return folder.conversations[0];
        }
        const subfolderResult = findFirstConversation(folder.subfolders);
        if (subfolderResult) return subfolderResult;
    }
    return null;
}
