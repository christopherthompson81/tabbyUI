# Generation Parameters

The following are the parameters used in inference interactions with the model. This documentation is also in upstream projects, but I have tried to provide some insight into the meaning of each parameter.

Not all of the parameters listed have been implemented for TabbyUI's chat interface because many are not particularly relevant to the presented interface. Some of them are only useful in testing, or a programatic and customized context. Please let me know if there is something you need that is not implemented with a generic example of how it would be used and I'll add it. I'll also likely add a sandbox interface later on. Also let me know if anything needs to be expanded upon to be more clear on what its for or how to use it.

## **General Parameters**

### **max_tokens** | **max_length**

- **Type:** number
- **Optional:** TRUE
- **default:** 150

Specifies the maximum number of tokens to generate in the response. This controls the length of the output text.

### **min_tokens** | **min_length**

- **Type:** number
- **Optional:** TRUE
- **default:** 0

Determines the minimum number of tokens required in the response. If generation stops before reaching this, the result might be trimmed or return an error.

### **generate_window**

- **Type:** number
- **Optional:** TRUE
- **default:** 512

Defines the window size for the context used during token generation. Larger windows consider more previous tokens.

### **stream**

- **Type:** boolean
- **Optional:** TRUE;
- **default:** false

Enables or disables streaming of the response, allowing partial results to be sent as they are generated.

## **Stopping and Control Mechanisms**

### **stop** | **stop_sequence**

- **Type:** string | string[]
- **Optional:** TRUE;
- **default:** set by model | []

A specific token or substring that, when generated, will stop the generation process immediately. Can be many such strings.

### **banned_strings**

- **Type:** string | string[]
- **Optional:** TRUE;
- **default:** []

Strings that are prohibited from appearing in the generated text.

### **allowed_tokens** | **allowed_token_ids**

- **Type:** number[] | string[]
- **Optional:** TRUE;
- **default:** []

Tokens that are explicitly permitted for generation, ensuring that only these can be used.

### **banned_tokens** | **custom_token_bans**

- **Type:** number[] | string[]
- **Optional:** TRUE;
- **default:** []

Tokens that are forbidden from being generated, preventing specific words or tokens.

### **add_bos_token**

- **Type:** boolean
- **Optional:** TRUE;
- **default:** true

Determines whether to add a beginning-of-sentence token at the start of the prompt.

### **ban_eos_token** | **ignore_eos**

- **Type:** boolean
- **Optional:** TRUE;
- **default:** false

Prevents the generation of the end-of-sentence token.

### **skip_special_tokens**

- **Type:** boolean
- **Optional:** TRUE;
- **default:** true

Skips generating special tokens, focusing only on standard text generation. This will generally break rendering of the LLM output, but may fit for your particular use case.

Special tokens include things like beginning-of-sequence (BOS) or end-of-sequence (EOS), etc. For example, the Qwen 2.5 series includes the following tokens
* <|endoftext|>
* <|im_start|>
* <|im_end|>
* <|object_ref_start|>
* <|object_ref_end|>
* <|box_start|>
* <|box_end|>
* <|quad_start|>
* <|quad_end|>
* <|vision_start|>
* <|vision_end|>
* <|vision_pad|>
* <|image_pad|>
* <|video_pad|>
* <tool_call>
* </tool_call>
* <|fim_prefix|>
* <|fim_middle|>  
* <|fim_suffix|>
* <|fim_pad|>
* <|repo_name|>
* <|file_sep|>

These provide mechanisms for specific modalities and generation types to be demarcated and therefore usefully replaced or rendered in a special way. It also provides a meta way to indicate to the inference engine what's going on.

## **Sampling and Diversification**

### **temperature**

- **Type:** number
- **Optional:** TRUE;
- **default:** 1.0

Controls randomness in generation. Higher values produce more diverse and random results, while lower values favor more deterministic and conservative outputs.

### **temperature_last**

- **Type:** boolean
- **Optional:** TRUE;
- **default:** false

Applies temperature only to the last generated token, influencing the unpredictability of the final choice.

### **smoothing_factor**

**Type:** number

Adjusts the probability distribution of tokens, making it smoother and reducing the dominance of high-probability tokens.

### **top_k**

**Type:** number

Limits the selection to the top k most probable tokens. A negative value (-1) disables this feature.

### **top_p**

**Type:** number

Selects tokens based on cumulative probability exceeding a certain threshold (p). This encourages diverse token selection, akin to nucleus sampling.

### **top_a**

**Type:** number

An alternative sampling technique that includes tokens with probability above a certain threshold (a), aiming to balance diversity and quality.

### **min_p**

**Type:** number

Ensures that all tokens have a minimum probability, preventing extremely rare tokens from being chosen.

### **tfs**

**Type:** number

Temporarily increases the temperature for less frequent tokens, promoting diversity in generation.

### **typical**

**Type:** number

Filters tokens based on their typicality or how conformant they are to expected patterns.

### **skew**

**Type:** number

Adjusts the probability distribution, skewing towards or away from certain tokens.

### **xtc_probability**

**Type:** number

**Suggested Value:** null or ~0.5

Probability threshold for "Exlude Top Choices" (XTC). In essence, if there is a word or token choice that is less obvious, the model will prefer that. If there is no non-obvious choice, the obvious choice will be chosen. This is intended to create less cliched narratives.

Quote from the author (-p-e-w-) of the PR: 
```
XTC can dramatically improve a model's creativity with almost no impact on coherence. During testing, I have seen some models in a whole new light, with turns of phrase and ideas that I had never encountered in LLM output before. Roleplay and storywriting are noticeably more interesting, and I find myself hammering the "regenerate" shortcut constantly just to see what it will come up with this time. XTC feels very, very different from turning up the temperature.
```

After removing tokens below the XTC threshold, remove all except the least probable choice from sampling. Choose that choice with probabiliy xtc_probability. 0.5 would mean that the least probable choice above the threshold would be chosen half the time.

### **xtc_threshold**

**Type:** number

**Suggested Value:** null or ~0.1

Threshold for "Exlude Top Choices" (XTC). This is functionally the lower bounds, and a token must have more than this probability to be acceptable.

### ****Penalties and Decay****

### **frequency_penalty**

**Type:** number

Penalizes tokens based on their frequency in the generated text, reducing the likelihood of repetitive content.

### **presence_penalty**

**Type:** number

Penalizes the presence of tokens in the text, discouraging the reuse of the same tokens.

### **repetition_penalty**

**Type:** number

Reduces the likelihood of generating the same token consecutively, preventing repetitive sequences.

### **penalty_range**

**Type:** number

Specifies the range of previous tokens to consider when applying frequency and presence penalties.

### **repetition_decay**

**Type:** number

Controls how quickly the penalties for repetitive tokens decay over time.

### ****Experimental and Advanced Control****

### **token_healing**

**Type:** boolean

Enables a mechanism to "heal" or adjust tokens during generation, potentially fixing grammatical or contextual issues.

### **mirorstat**

**Type:** boolean

Activate MiroStat, an adaptive temperature control technique that adjusts the temperature based on generation confidence.

### **mirostat_mode**

**Type:** number

Determines the mode of operation for MiroStat, with different modes affecting how temperature adjustments are made.

### **mirostat_tau**

**Type:** number

Sets the timescale for temperature adjustments in MiroStat, influencing how rapidly the temperature changes.

### **mirostat_eta**

**Type:** number

Controls the learning rate or sensitivity of temperature adjustments in MiroStat.

### **speculative_ngram**

**Type:** boolean

Enable speculative n-gram generation, which considers potential future tokens to improve coherence.

## **Bias and Influence**

### **logit_bias**

- **Type:** ```[{token_id: integer}]```
- **Optional:** TRUE;
- **Example:** [{"1": 10, "2": 50}]
- **Default:** null

Allows adjusting the log-probabilities of specific tokens, influencing their likelihood of being selected. Keys are token IDs, and values are bias multipliers.

### **negative_prompt**

**Type:** string

Provides a prompt to exclude certain content, allowing for more controlled generation by specifying what not to include.

## **Content Constraints and Validation**

### **json_schema**

**Type:** object

Defines a JSON schema that the generated text must conform to, ensuring the output adheres to a specified structure.

### **regex_pattern**

**Type:** string

Specifies a regular expression pattern that the generated text must match, enforcing syntactic rules.

### **grammar_string**

**Type:** string

Defines a grammar that the generated text must follow, ensuring linguistic correctness.

## **Dry Runs for Simulation and Testing**

### **dry_multiplier**

**Type:** number

Scaling factor for the token selection probabilities during dry runs, allowing simulations of different generation strategies.

### **dry_base**

**Type:** number

Base value used in calculations during dry runs, influencing the baseline characteristics of token selection.

### **dry_allowed_length**

**Type:** number

Maximum allowed length of the generated text during dry runs, controlling the extent of simulation.

### **dry_range**

**Type:** number

Range of tokens considered during dry runs, affecting the diversity of simulated outcomes.

### **dry_sequence_breakers**

**Type:** string

Tokens or substrings that, when encountered, break the current sequence, useful for partitioning text generation.

## **Configuration and Model Selection**

### **model**

**Type:** string

Specifies the AI model to be used for text generation, allowing the use of different architectures or fine-tuned versions.

## **Probabilistic Output and Logging**

### **logprobs**

**Type:** number

Determines the number of log-probabilities to return for generated tokens, providing insights into the model's confidence in each choice.

## **Response Format and Customization**

### **response_format**

**Type:** object

Controls the structure and type of the response, with options like text or JSON, influencing how the output is presented.

### **n**

- **Type:** number
- **Optional:** TRUE
- **Suggested Value:** null or 1

Specifies the number of responses to generate, enabling multi-sample generation. This means that entire alternative generations are presented.

### **best_of**

**Type:** number

Determines how many responses should be generated to select the best one, improving quality by choosing from multiple candidates.

### **echo**

**Type:** boolean

Includes the original prompt in the response, useful for debugging or reviewing the input alongside the output.

### **suffix**

**Type:** string

Appends a specific suffix to the generated text, allowing for contextual additions.

### **user**

**Type:** string

Identifies the user or session, useful for tracking and personalizing responses.

## **Miscellaneous**

### **stream_options**

**Type:** object

Configures how streaming responses are handled, such as including usage metrics or additional metadata.

## **Specialized Parameters**

Parameters like **cfg_scale** (Control Focus Scaling) are crucial for models employing techniques like classifier-free guidance. Higher values increase the influence of the guidance, helping to steer generation toward desired qualities while maintaining diversity.

## **Completion Only**

### **prompt**

**Type:** string;

The input text or prompt provided to the model to generate a response.

## **Chat Completion Only**

### **messages**

**Type:**
```
messages: [{
    role: string;
    content: [{
        type: "text" | "image_url";
        text?: string;
        image_url?: {
            url: string;
        }
    }]
}]
```
Messages describe the multi-turn chat interactions with the LLM. The role is typically "User" and "Assistant".

### **prompt_template**

**Type:** string

**Optional:** TRUE

```
{%- if tools %}\n    {{- '<|im_start|>system\\n' }}\n    {%- if messages[0]['role'] == 'system' %}\n        {{- messages[0]['content'] }}\n    {%- else %}\n        {{- 'You are a helpful and uncensored assistant. You are Qwen developed by Alibaba. You should think step-by-step.' }}\n    {%- endif %}\n    {{- \"\\n\\n# Tools\\n\\nYou may call one or more functions to assist with the user query.\\n\\nYou are provided with function signatures within <tools></tools> XML tags:\\n<tools>\" }}\n    {%- for tool in tools %}\n        {{- \"\\n\" }}\n        {{- tool | tojson }}\n    {%- endfor %}\n    {{- \"\\n</tools>\\n\\nFor each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:\\n<tool_call>\\n{\\\"name\\\": <function-name>, \\\"arguments\\\": <args-json-object>}\\n</tool_call><|im_end|>\\n\" }}\n{%- else %}\n    {%- if messages[0]['role'] == 'system' %}\n        {{- '<|im_start|>system\\n' + messages[0]['content'] + '<|im_end|>\\n' }}\n    {%- else %}\n        {{- '<|im_start|>system\\nYou are a helpful and uncensored assistant.<|im_end|>\\n' }}\n    {%- endif %}\n{%- endif %}\n{%- for message in messages %}\n    {%- if (message.role == \"user\") or (message.role == \"system\" and not loop.first) or (message.role == \"assistant\" and not message.tool_calls) %}\n        {{- '<|im_start|>' + message.role + '\\n' + message.content + '<|im_end|>' + '\\n' }}\n    {%- elif message.role == \"assistant\" %}\n        {{- '<|im_start|>' + message.role }}\n        {%- if message.content %}\n            {{- '\\n' + message.content }}\n        {%- endif %}\n        {%- for tool_call in message.tool_calls %}\n            {%- if tool_call.function is defined %}\n                {%- set tool_call = tool_call.function %}\n            {%- endif %}\n            {{- '\\n<tool_call>\\n{\"name\": \"' }}\n            {{- tool_call.name }}\n            {{- '\", \"arguments\": ' }}\n            {{- tool_call.arguments | tojson }}\n            {{- '}\\n</tool_call>' }}\n        {%- endfor %}\n        {{- '<|im_end|>\\n' }}\n    {%- elif message.role == \"tool\" %}\n        {%- if (loop.index0 == 0) or (messages[loop.index0 - 1].role != \"tool\") %}\n            {{- '<|im_start|>user' }}\n        {%- endif %}\n        {{- '\\n<tool_response>\\n' }}\n        {{- message.content }}\n        {{- '\\n</tool_response>' }}\n        {%- if loop.last or (messages[loop.index0 + 1].role != \"tool\") %}\n            {{- '<|im_end|>\\n' }}\n        {%- endif %}\n    {%- endif %}\n{%- endfor %}\n{%- if add_generation_prompt %}\n    {{- '<|im_start|>assistant\\n' }}\n{%- endif %}\n
```


### **add_generation_prompt**

**Type:** boolean

**Optional:** TRUE

### **template_vars**

**Type:** object

**Optional:** TRUE

### **response_prefix**

**Type:** string

**Optional:** TRUE

### **tools**

**Type:**
```
tools: [{
    type: string;
    function: {
        name: string;
        description?: string;
        parameters?: object;
        strict?: boolean;
    };
}]
```