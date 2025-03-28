export interface MessageContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
        url: string;
    };
}

export interface MessageProps {
    role: string;
    content: MessageContent[];
}

interface TabbyAPIResponse {
    choices: {
        delta: {
            content: string;
        };
    }[];
}

export interface ModelInfo {
    id: string;
    object: string;
    created: number;
    owned_by: string;
    logging: {
        log_prompt: boolean;
        log_generation_params: boolean;
        log_requests: boolean;
    };
    parameters: {
        max_seq_len: number;
        rope_scale: number;
        rope_alpha: number;
        max_batch_size: number;
        cache_size: number;
        cache_mode: string;
        chunk_size: number;
        prompt_template: string;
        prompt_template_content: string;
        num_experts_per_token: number | null;
        use_vision: boolean;
        draft: any;
    };
}

export interface ModelStatus {
    info: ModelInfo | null;
    status: "online" | "no_model" | "offline";
}

export async function getModelInfo(
    serverUrl: string,
    apiKey: string
): Promise<ModelStatus> {
    try {
        const response = await fetch(`${serverUrl}/v1/model`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey || "",
            },
        });

        if (response.ok) {
            const modelInfo = await response.json();
            return { info: modelInfo, status: "online" };
        }
        
        // Check if the error is "no models are currently loaded"
        if (response.status === 400) {
            /*
            const errorData = await response.json();
            if (errorData.error && errorData.error.includes("no models are currently loaded")) {
                return { info: null, status: "no_model" };    
            }
            */
            return { info: null, status: "no_model" };
        }
        
        return { info: null, status: "offline" };
    } catch (error) {
        console.error("Error checking server status:", error);
        return { info: null, status: "offline" };
    }
}

export interface ModelLoadProgress {
    model_type: string | null;
    module: number | null;
    modules: number | null;
    status: string | null;
}

export async function unloadModel(
    serverUrl: string,
    adminApiKey: string
): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/v1/model/unload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error unloading model:", error);
        return false;
    }
}

export async function loadModelWithProgress(
    serverUrl: string,
    adminApiKey: string,
    payload: any,
    onProgress: (progress: ModelLoadProgress) => void
): Promise<void> {
    try {
        const response = await fetch(`${serverUrl}/v1/model/load`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Failed to start model loading");
        }

        const stream = response.body;
        if (!stream) {
            throw new Error("No response body");
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");

        function processText({
            done,
            value,
        }: {
            done: boolean;
            value?: Uint8Array;
        }): any {
            if (done) {
                onProgress({
                    model_type: "model",
                    module: 1,
                    modules: 1,
                    status: "complete",
                });
                return;
            }

            const chunk = decoder.decode(value);
            const separateLines = chunk.split(/data: /g);

            separateLines.forEach((line) => {
                //console.log(line);
                if (line.trim() === "[DONE]") {
                    return;
                }
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        // Ensure we have the required fields
                        const progressData: ModelLoadProgress = {
                            model_type: data.model_type || "model",
                            module: data.module || 0,
                            modules: data.modules || 1,
                            status: data.status || "processing",
                        };
                        onProgress(progressData);
                    } catch (error) {
                        console.error("Error parsing progress:", error);
                    }
                }
            });

            return reader.read().then(processText);
        }

        return reader.read().then(processText);
    } catch (error) {
        console.error("Error loading model:", error);
        throw error;
    }
}

export async function sendConversation(
    serverUrl: string,
    apiKey: string,
    messages: MessageProps[],
    userMessage: MessageContent[],
    regenerate: boolean = false,
    onUpdate: (updatedMessages: MessageProps[]) => void,
    onComplete: (finalMessages: MessageProps[]) => void,
    abortSignal?: AbortSignal
) {
    try {
        // Get the active system prompt
        const activePromptId = localStorage.getItem("activeSystemPromptId") || "default";
        const systemPrompts = JSON.parse(localStorage.getItem("systemPrompts") || "[]");
        const activePrompt = systemPrompts.find((p: any) => p.id === activePromptId);
        const systemPromptContent = activePrompt?.content || "You are a helpful, harmless, and honest AI assistant.";
        
        let updatedMessages: MessageProps[];
        if (regenerate) {
            updatedMessages = messages.slice(0, -1); // Remove the last response
        } else {
            updatedMessages = [
                ...messages,
                {
                    role: "user",
                    content: userMessage,
                },
            ];
        }
        
        // Prepend the system prompt if it's not already included
        const hasSystemMessage = updatedMessages.some(msg => msg.role === "system");
        const messagesWithSystem = hasSystemMessage
            ? updatedMessages 
            : [
                {
                    role: "system",
                    content: [{ type: "text", text: systemPromptContent }]
                },
                ...updatedMessages
            ];

        const response = await fetch(
            `${serverUrl}/v1/chat/completions?stream=true`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey || "",
                },
                body: JSON.stringify({
                    messages: messagesWithSystem,
                    stream: true,
                }),
                signal: abortSignal,
            }
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const stream = response.body;
        if (!stream) {
            throw new Error("No response body");
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        updatedMessages.push({
            role: "assistant",
            content: [{ type: "text", text: "" }],
        });

        function processText({
            done,
            value,
        }: {
            done: boolean;
            value?: Uint8Array;
        }): any {
            if (done) {
                onComplete(updatedMessages);
                return;
            }

            const chunk = decoder.decode(value);
            const separateLines = chunk.split(/data: /g);

            separateLines.forEach((line) => {
                if (line.trim() === "[DONE]") {
                    return;
                }
                if (line.trim()) {
                    try {
                        const data: TabbyAPIResponse = JSON.parse(line);
                        //console.log(data);
                        if (data.choices[0].delta.content) {
                            const lastMessage: MessageProps =
                                updatedMessages[updatedMessages.length - 1];
                            const lastContent: MessageContent =
                                lastMessage.content[
                                    lastMessage.content.length - 1
                                ];

                            if (lastContent.type === "text") {
                                lastContent.text =
                                    (lastContent.text || "") +
                                    data.choices[0].delta.content;
                            } else {
                                lastMessage.content.push({
                                    type: "text",
                                    text: data.choices[0].delta.content || "",
                                });
                            }
                            onUpdate([...updatedMessages]);
                        }
                    } catch (error) {
                        console.error("Error parsing response:", error);
                    }
                }
            });

            return reader.read().then(processText);
        }

        return reader.read().then(processText);
    } catch (error) {
        console.error("Error sending conversation:", error);
        throw error;
    }
}

export interface TemplateListResponse {
    object: string;
    data: string[];
}

export async function getTemplates(
    serverUrl: string,
    adminApiKey: string
): Promise<string[]> {
    try {
        const response = await fetch(`${serverUrl}/v1/templates`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": adminApiKey || "",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch templates");
        }

        const data: TemplateListResponse = await response.json();
        console.log(data);
        return data.data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
    }
}

export async function switchTemplate(
    serverUrl: string,
    adminApiKey: string,
    templateName: string
): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/v1/template/switch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
            body: JSON.stringify({
                prompt_template_name: templateName,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error("Error switching template:", error);
        return false;
    }
}

export async function unloadTemplate(
    serverUrl: string,
    adminApiKey: string
): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/v1/template/unload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error unloading template:", error);
        return false;
    }
}

export interface LoRA {
    id: string;
    object: string;
    created: number;
    owned_by: string;
    scaling: number;
}

export interface LoRAListResponse {
    object: string;
    data: LoRA[];
}

export async function getAllLoRAs(
    serverUrl: string,
    apiKey: string
): Promise<LoRA[]> {
    try {
        const response = await fetch(`${serverUrl}/v1/loras`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey || "",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch LoRAs");
        }

        const data: LoRAListResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching LoRAs:", error);
        return [];
    }
}

export async function getActiveLoRAs(
    serverUrl: string,
    apiKey: string
): Promise<LoRA[]> {
    try {
        const response = await fetch(`${serverUrl}/v1/lora`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey || "",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch active LoRAs");
        }

        const data: LoRAListResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching active LoRAs:", error);
        return [];
    }
}

export interface LoRALoadRequest {
    loras: {
        name: string;
        scaling: number;
    }[];
    skip_queue?: boolean;
}

export async function loadLoRAs(
    serverUrl: string,
    adminApiKey: string,
    request: LoRALoadRequest
): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/v1/lora/load`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
            body: JSON.stringify(request),
        });

        return response.ok;
    } catch (error) {
        console.error("Error loading LoRAs:", error);
        return false;
    }
}

export async function unloadAllLoRAs(
    serverUrl: string,
    adminApiKey: string
): Promise<boolean> {
    try {
        const response = await fetch(`${serverUrl}/v1/lora/unload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": adminApiKey,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error unloading LoRAs:", error);
        return false;
    }
}

export interface TokenEncodeRequest {
  add_bos_token?: boolean;
  encode_special_tokens?: boolean;
  decode_special_tokens?: boolean;
  text: string;
}

export interface TokenEncodeResponse {
  tokens: number[];
  length: number;
}

export async function encodeTokens(
  serverUrl: string,
  apiKey: string,
  request: TokenEncodeRequest
): Promise<TokenEncodeResponse> {
  try {
    const response = await fetch(`${serverUrl}/v1/token/encode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to encode tokens");
    }

    return await response.json();
  } catch (error) {
    console.error("Error encoding tokens:", error);
    return { tokens: [], length: 0 };
  }
}

export interface TokenDecodeRequest {
  add_bos_token?: boolean;
  encode_special_tokens?: boolean;
  decode_special_tokens?: boolean;
  tokens: number[];
}

export interface TokenDecodeResponse {
  text: string;
}

export async function decodeTokens(
  serverUrl: string,
  apiKey: string,
  request: TokenDecodeRequest
): Promise<TokenDecodeResponse> {
  try {
    const response = await fetch(`${serverUrl}/v1/token/decode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to decode tokens");
    }

    return await response.json();
  } catch (error) {
    console.error("Error decoding tokens:", error);
    return { text: "" };
  }
}

export interface SamplerOverride {
  force: boolean;
  override: number;
}

export interface SamplerOverrides {
  [key: string]: SamplerOverride;
}

export interface SamplerOverridesResponse {
  selected_preset: string;
  overrides: SamplerOverrides;
  presets: string[];
}

export interface SamplerOverrideSwitchRequest {
  preset?: string;
  overrides?: SamplerOverrides;
}

export async function getSamplerOverrides(
  serverUrl: string,
  apiKey: string
): Promise<SamplerOverridesResponse> {
  try {
    const response = await fetch(`${serverUrl}/v1/sampling/overrides`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sampler overrides");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching sampler overrides:", error);
    return { selected_preset: "", overrides: {}, presets: [] };
  }
}

export async function switchSamplerOverride(
  serverUrl: string,
  adminApiKey: string,
  request: SamplerOverrideSwitchRequest
): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/v1/sampling/override/switch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminApiKey,
      },
      body: JSON.stringify(request),
    });

    return response.ok;
  } catch (error) {
    console.error("Error switching sampler override:", error);
    return false;
  }
}

export async function unloadSamplerOverride(
  serverUrl: string,
  adminApiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/v1/sampling/override/unload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminApiKey,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error unloading sampler override:", error);
    return false;
  }
}

export interface DraftModelsResponse {
  object: string;
  data: ModelInfo[];
}

export async function getDraftModels(
  serverUrl: string,
  apiKey: string
): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${serverUrl}/v1/model/draft/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch draft models");
    }

    const data: DraftModelsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching draft models:", error);
    return [];
  }
}
