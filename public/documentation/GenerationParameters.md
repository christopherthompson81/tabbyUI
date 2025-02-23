# Generation Parameters

## **General Parameters**

### max_tokens

**Type:** number

Specifies the maximum number of tokens to generate in the response. This controls the length of the output text.

### min_tokens

**Type:** number

Determines the minimum number of tokens required in the response. If generation stops before reaching this, the result might be trimmed or return an error.

### generate_window

**Type:** number

Defines the window size for the context used during token generation. Larger windows consider more previous tokens.

### prompt

**Type:** string

Completion Only

The input text or prompt provided to the model to generate a response.

### stream

**Type:** boolean

Enables or disables streaming of the response, allowing partial results to be sent as they are generated.

## **Stopping and Control Mechanisms**

### stop

string

A specific token or substring that, when generated, will stop the generation process immediately.

### banned_strings

string

Strings that are prohibited from appearing in the generated text.

### allowed_tokens

array of numbers

Tokens that are explicitly permitted for generation, ensuring that only these can be used.

### banned_tokens

array of numbers

Tokens that are forbidden from being generated, preventing specific words or tokens.

### add_bos_token

boolean

Determines whether to add a beginning-of-sentence token at the start of the prompt.

### ban_eos_token

boolean

Prevents the generation of the end-of-sentence token.

### skip_special_tokens

boolean

Skips generating special tokens, focusing only on standard text generation.

## **Sampling and Diversification**

### temperature

number

Controls randomness in generation. Higher values produce more diverse and random results, while lower values favor more deterministic and conservative outputs.

14. **temperature_last (boolean)**: Applies temperature only to the last generated token, influencing the unpredictability of the final choice.

15. **smoothing_factor (number)**: Adjusts the probability distribution of tokens, making it smoother and reducing the dominance of high-probability tokens.

16. **top_k (number)**: Limits the selection to the top k most probable tokens. A negative value (-1) disables this feature.

17. **top_p (number)**: Selects tokens based on cumulative probability exceeding a certain threshold (p). This encourages diverse token selection, akin to nucleus sampling.

18. **top_a (number)**: An alternative sampling technique that includes tokens with probability above a certain threshold (a), aiming to balance diversity and quality.

19. **min_p (number)**: Ensures that all tokens have a minimum probability, preventing extremely rare tokens from being chosen.

20. **tfs (number)**: Temporarily increases the temperature for less frequent tokens, promoting diversity in generation.

21. **typical (number)**: Filters tokens based on their typicality or how conformant they are to expected patterns.

22. **skew (number)**: Adjusts the probability distribution, skewing towards or away from certain tokens.

23. **xtc_probability (number)**: Probability threshold for experimental token control, potentially enabling or disabling certain experimental behaviors.

24. **xtc_threshold (number)**: Threshold for experimental token selection, possibly influencing token diversity based on experimental criteria.

### **Penalties and Decay**

25. **frequency_penalty (number)**: Penalizes tokens based on their frequency in the generated text, reducing the likelihood of repetitive content.

26. **presence_penalty (number)**: Penalizes the presence of tokens in the text, discouraging the reuse of the same tokens.

27. **repetition_penalty (number)**: Reduces the likelihood of generating the same token consecutively, preventing repetitive sequences.

28. **penalty_range (number)**: Specifies the range of previous tokens to consider when applying frequency and presence penalties.

29. **repetition_decay (number)**: Controls how quickly the penalties for repetitive tokens decay over time.

### **Experimental and Advanced Control**

30. **token_healing (boolean)**: Enables a mechanism to "heal" or adjust tokens during generation, potentially fixing grammatical or contextual issues.

31. **mirorstat (boolean)**: Activate MiroStat, an adaptive temperature control technique that adjusts the temperature based on generation confidence.

32. **mirostat_mode (number)**: Determines the mode of operation for MiroStat, with different modes affecting how temperature adjustments are made.

33. **mirostat_tau (number)**: Sets the timescale for temperature adjustments in MiroStat, influencing how rapidly the temperature changes.

34. **mirostat_eta (number)**: Controls the learning rate or sensitivity of temperature adjustments in MiroStat.

35. **speculative_ngram (boolean)**: Enable speculative n-gram generation, which considers potential future tokens to improve coherence.

## **Bias and Influence**

36. **logit_bias (object)**: Allows adjusting the log-probabilities of specific tokens, influencing their likelihood of being selected. Keys are token IDs, and values are bias multipliers.

37. **negative_prompt (string)**: Provides a prompt to exclude certain content, allowing for more controlled generation by specifying what not to include.

## **Content Constraints and Validation**

38. **json_schema (object)**: Defines a JSON schema that the generated text must conform to, ensuring the output adheres to a specified structure.

39. **regex_pattern (string)**: Specifies a regular expression pattern that the generated text must match, enforcing syntactic rules.

40. **grammar_string (string)**: Defines a grammar that the generated text must follow, ensuring linguistic correctness.

## **Dry Runs for Simulation and Testing**

41. **dry_multiplier (number)**: Scaling factor for the token selection probabilities during dry runs, allowing simulations of different generation strategies.

42. **dry_base (number)**: Base value used in calculations during dry runs, influencing the baseline characteristics of token selection.

43. **dry_allowed_length (number)**: Maximum allowed length of the generated text during dry runs, controlling the extent of simulation.

44. **dry_range (number)**: Range of tokens considered during dry runs, affecting the diversity of simulated outcomes.

45. **dry_sequence_breakers (string)**: Tokens or substrings that, when encountered, break the current sequence, useful for partitioning text generation.

## **Configuration and Model Selection**

46. **model (string)**: Specifies the AI model to be used for text generation, allowing the use of different architectures or fine-tuned versions.

## **Probabilistic Output and Logging**

47. **logprobs (number)**: Determines the number of log-probabilities to return for generated tokens, providing insights into the model's confidence in each choice.

## **Response Format and Customization**

48. **response_format (object)**: Controls the structure and type of the response, with options like text or JSON, influencing how the output is presented.

49. **n (number)**: Specifies the number of responses to generate, enabling multi-sample generation.

50. **best_of (number)**: Determines how many responses should be generated to select the best one, improving quality by choosing from multiple candidates.

51. **echo (boolean)**: Includes the original prompt in the response, useful for debugging or reviewing the input alongside the output.

52. **suffix (string)**: Appends a specific suffix to the generated text, allowing for contextual additions.

53. **user (string)**: Identifies the user or session, useful for tracking and personalizing responses.

## **Miscellaneous**

54. **stream_options (object)**: Configures how streaming responses are handled, such as including usage metrics or additional metadata.

## **Specialized Parameters**

Parameters like **cfg_scale** (Control Focus Scaling) are crucial for models employing techniques like classifier-free guidance. Higher values increase the influence of the guidance, helping to steer generation toward desired qualities while maintaining diversity.

