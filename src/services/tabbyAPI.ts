export interface MessageContent {
    type: 'text' | 'image_url';
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

// The following is a sample response that shows an example ModelInfo object. update the ModelInfo interface to match it, AI! 
/*
{
    "id": "FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview-exl2-4_25bpw",
    "object": "model",
    "created": 1739736899,
    "owned_by": "tabbyAPI",
    "logging": {
        "log_prompt": false,
        "log_generation_params": false,
        "log_requests": false
    },
    "parameters": {
        "max_seq_len": 32768,
        "rope_scale": 1,
        "rope_alpha": 1,
        "max_batch_size": 256,
        "cache_size": 32768,
        "cache_mode": "Q6",
        "chunk_size": 2048,
        "prompt_template": "from_tokenizer_config",
        "prompt_template_content": "{% if not add_generation_prompt is defined %}{% set add_generation_prompt = false %}{% endif %}{% set ns = namespace(is_first=false, is_tool=false, is_output_first=true, system_prompt='') %}{%- for message in messages %}{%- if message['role'] == 'system' %}{% set ns.system_prompt = message['content'] %}{%- endif %}{%- endfor %}{{bos_token}}{{ns.system_prompt}}{%- for message in messages %}{%- if message['role'] == 'user' %}{%- set ns.is_tool = false -%}{{'<｜User｜>' + message['content']}}{%- endif %}{%- if message['role'] == 'assistant' and message['content'] is none %}{%- set ns.is_tool = false -%}{%- for tool in message['tool_calls']%}{%- if not ns.is_first %}{{'<｜Assistant｜><｜tool▁calls▁begin｜><｜tool▁call▁begin｜>' + tool['type'] + '<｜tool▁sep｜>' + tool['function']['name'] + '\\n' + '```json' + '\\n' + tool['function']['arguments'] + '\\n' + '```' + '<｜tool▁call▁end｜>'}}{%- set ns.is_first = true -%}{%- else %}{{'\\n' + '<｜tool▁call▁begin｜>' + tool['type'] + '<｜tool▁sep｜>' + tool['function']['name'] + '\\n' + '```json' + '\\n' + tool['function']['arguments'] + '\\n' + '```' + '<｜tool▁call▁end｜>'}}{{'<｜tool▁calls▁end｜><｜end▁of▁sentence｜>'}}{%- endif %}{%- endfor %}{%- endif %}{%- if message['role'] == 'assistant' and message['content'] is not none %}{%- if ns.is_tool %}{{'<｜tool▁outputs▁end｜>' + message['content'] + '<｜end▁of▁sentence｜>'}}{%- set ns.is_tool = false -%}{%- else %}{% set content = message['content'] %}{% if '</think>' in content %}{% set content = content.split('</think>')[-1] %}{% endif %}{{'<｜Assistant｜>' + content + '<｜end▁of▁sentence｜>'}}{%- endif %}{%- endif %}{%- if message['role'] == 'tool' %}{%- set ns.is_tool = true -%}{%- if ns.is_output_first %}{{'<｜tool▁outputs▁begin｜><｜tool▁output▁begin｜>' + message['content'] + '<｜tool▁output▁end｜>'}}{%- set ns.is_output_first = false %}{%- else %}{{'\\n<｜tool▁output▁begin｜>' + message['content'] + '<｜tool▁output▁end｜>'}}{%- endif %}{%- endif %}{%- endfor -%}{% if ns.is_tool %}{{'<｜tool▁outputs▁end｜>'}}{% endif %}{% if add_generation_prompt and not ns.is_tool %}{{'<｜Assistant｜>'}}{% endif %}",
        "num_experts_per_token": null,
        "use_vision": false,
        "draft": null
    }
}
*/

export interface ModelInfo {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

export async function getModelInfo(serverUrl: string, apiKey: string): Promise<ModelInfo | null> {
    try {
        const response = await fetch(`${serverUrl}/v1/model`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '',
            },
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking server status:', error);
        return null;
    }
}

export interface ModelLoadProgress {
    model_type: string | null;
    module: number | null;
    modules: number | null;
    status: string | null;
}

export async function loadModelWithProgress(
    serverUrl: string,
    adminApiKey: string,
    payload: any,
    onProgress: (progress: ModelLoadProgress) => void
): Promise<void> {
    try {
        const response = await fetch(`${serverUrl}/v1/model/load`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': adminApiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to start model loading');
        }

        const stream = response.body;
        if (!stream) {
            throw new Error('No response body');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder('utf-8');

        function processText({ done, value }: { done: boolean; value?: Uint8Array }): any {
            if (done) {
                onProgress({
                    model_type: 'model',
                    module: 1,
                    modules: 1,
                    status: 'complete'
                });
                return;
            }

            const chunk = decoder.decode(value);
            const separateLines = chunk.split(/data: /g);

            separateLines.forEach(line => {
                //console.log(line);
                if (line.trim() === "[DONE]") {
                    return;
                }
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        // Ensure we have the required fields
                        const progressData: ModelLoadProgress = {
                            model_type: data.model_type || 'model',
                            module: data.module || 0,
                            modules: data.modules || 1,
                            status: data.status || 'processing'
                        };
                        onProgress(progressData);
                    } catch (error) {
                        console.error('Error parsing progress:', error);
                    }
                }
            });

            return reader.read().then(processText);
        }

        return reader.read().then(processText);
    } catch (error) {
        console.error('Error loading model:', error);
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
        let updatedMessages: MessageProps[];
        if (regenerate) {
            updatedMessages = messages.slice(0, -1); // Remove the last response
        } else {
            updatedMessages = [...messages, {
                role: "user",
                content: userMessage
            }];
        }

        const response = await fetch(`${serverUrl}/v1/chat/completions?stream=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '',
            },
            body: JSON.stringify({
                messages: updatedMessages,
                stream: true
            }),
            signal: abortSignal,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const stream = response.body;
        if (!stream) {
            throw new Error('No response body');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder('utf-8');
        updatedMessages.push({ role: "assistant", content: [{ type: 'text', text: '' }] });

        function processText({ done, value }: { done: boolean; value?: Uint8Array }): any {
            if (done) {
                onComplete(updatedMessages);
                return;
            }

            const chunk = decoder.decode(value);
            const separateLines = chunk.split(/data: /g);

            separateLines.forEach(line => {
                if (line.trim() === "[DONE]") {
                    return;
                }
                if (line.trim()) {
                    try {
                        const data: TabbyAPIResponse = JSON.parse(line);
                        //console.log(data);
                        if (data.choices[0].delta.content) {
                            const lastMessage:MessageProps = updatedMessages[updatedMessages.length - 1];
                            const lastContent:MessageContent = lastMessage.content[lastMessage.content.length - 1];

                            if (lastContent.type === 'text') {
                                lastContent.text = (lastContent.text || '') + data.choices[0].delta.content;
                            } else {
                                lastMessage.content.push({
                                    type: 'text',
                                    text: data.choices[0].delta.content || ''
                                });
                            }
                            onUpdate([...updatedMessages]);
                        }
                    } catch (error) {
                        console.error('Error parsing response:', error);
                    }
                }
            });

            return reader.read().then(processText);
        }

        return reader.read().then(processText);
    } catch (error) {
        console.error('Error sending conversation:', error);
        throw error;
    }
}
