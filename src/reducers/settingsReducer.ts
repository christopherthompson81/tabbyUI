/*
interface LogitBias {
    [key: string]: number;
}
*/

export interface GenerationParams {
    // ------------------
    // General Parameters
    // ------------------
    maxTokens?: number;
    minTokens?: number;
    generateWindow?: number;
    // ----------------------------
    // Sampling and Diversification
    // ----------------------------
    temperature?: number;
    //temperatureLast?: boolean;
    //smoothingFactor?: number;
    topK?: number;
    topP?: number;
    //topA?: number;
    //minP?: number;
    //tfs?: number;
    typicalP?: number;
    //skew?: number;
    xtc_probability?: number;
    xtc_threshold?: number;
    // -------------------
    // Penalties and Decay
    // -------------------
    frequencyPenalty?: number;
    presencePenalty?: number;
    repetitionPenalty?: number;
    //penaltyRange?: number;
    //repetitionDecay?: number;
    // ------------------
    // Control Mechanisms
    // ------------------
    //stop?: string | string[];
    //bannedStrings?: string | string[];
    //allowedTokens?: number[];
    //bannedTokens?: number[];
    addBosToken?: boolean;
    banEosToken?: boolean;
    //skipSpecialToken?: boolean;
    // ---------------------------------
    // Experimental and Advanced Control
    // ---------------------------------
    tokenHealing: boolean;
    //mirostat?: boolean;
    mirostatMode: number;
    mirostatTau: number;
    mirostatEta: number;
    //speculativeNgram?: boolean;
    // ------------------
    // Bias and Influence
    // ------------------
    //logitBias?: LogitBias;
    //negativePrompt? string;
    // ----------------------------------
    // Content Constraints and Validation
    // ----------------------------------
    //jsonSchema?: object;
    //regexPattern?: string;
    //grammarString?: string;
    // -----------------------------------
    // Dry Runs for Simulation and Testing
    // -----------------------------------
    //dryMultiplier?: number; // Scaling factor for the token selection probabilities during dry runs, allowing simulations of different generation strategies.
    //dryBase?: number; // Base value used in calculations during dry runs, influencing the baseline characteristics of token selection.
    //dryAllowedLength?: number; // Maximum allowed length of the generated text during dry runs, controlling the extent of simulation.
    //dryRange?: number; // Range of tokens considered during dry runs, affecting the diversity of simulated outcomes.
    //drySequenceBreakers?: string; // Tokens or substrings that, when encountered, break the current sequence, useful for partitioning text generation.
    // --------------------------------
    // Probabilistic Output and Logging
    // --------------------------------
    //logprobs?: number;
    // ---------------------------------
    // Response Format and Customization
    // ---------------------------------
    //response_format?: object; // Controls the structure and type of the response, with options like text or JSON, influencing how the output is presented.
    //n?: number; // Specifies the number of responses to generate, enabling multi-sample generation.
    //best_of?: number; // Determines how many responses should be generated to select the best one, improving quality by choosing from multiple candidates.
    //echo?: boolean; // Includes the original prompt in the response, useful for debugging or reviewing the input alongside the output.
    //suffix?: string; // Appends a specific suffix to the generated text, allowing for contextual additions.
    //user?: string; // Identifies the user or session, useful for tracking and personalizing responses.
}

// both "completion" and "chat completion" use the format from GenerationParams, but add additional parts.
// completion adds:
//prompt: string;
// chat completions adds:
//messages: MessageProps[]
//prompt_template?: string;
//add_generation_prompt?: boolean
//template_vars?: object;
//response_prefix?: string;
//tools: FunctionTool
/*
interface FunctionToolType {
    name: string;
    description?: string;
    parameters?: object;
    strict?: boolean;
}

interface FunctionTool {
    type: string;
    function: FunctionToolType;
}
*/

export interface SettingsState {
    serverUrl: string;
    apiKey: string;
    adminApiKey: string;
    generationParams: GenerationParams;
}

export type SettingsAction =
    | { type: "SET_SERVER_URL"; url: string }
    | { type: "SET_API_KEY"; key: string }
    | { type: "SET_ADMIN_API_KEY"; key: string }
    | {
          type: "SET_GENERATION_PARAM";
          key: keyof GenerationParams;
          value: string;
      };

export function settingsReducer(
    state: SettingsState,
    action: SettingsAction
): SettingsState {
    switch (action.type) {
        case "SET_SERVER_URL":
            return { ...state, serverUrl: action.url };
        case "SET_API_KEY":
            return { ...state, apiKey: action.key };
        case "SET_ADMIN_API_KEY":
            return { ...state, adminApiKey: action.key };
        case "SET_GENERATION_PARAM":
            return {
                ...state,
                generationParams: {
                    ...state.generationParams,
                    [action.key]: action.value,
                },
            };
        default:
            return state;
    }
}
