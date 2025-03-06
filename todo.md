### Now
* Help expansion
    * Add detailed settings parameter explanations.
* Add arbitrary expansion to "Model Preferences" with an Emoji identifier.
    * Model Settings might need to be separate from Model Preferences in some way.

### Soon
* Add a "Completions" interface
    * Tailor this to the Alice in Wonderland example.
    * There should probably be a continue button that is different than the send button. This button will either try to extend the response from the assistant, or, if there is data in the input preview, the user's input. The template is probably needed to convert the messages object to match the template, but unary input from just the user should not be.  
* Help expansion
    * Add instructions for writing a non-canonical chapter of Alice in Wonderland using completion.
* Maybe move services to a reducer?
* Document Analysis (Docling) (backend change)
    * Document type: markdown and images
* Add a PDF to a mixed modality ingestor
* Retrieval solution
* Multi-user
* Keep trying to add functions that TabbyAPI offers, like embeddings

### Stretch
* TTS
    * Speak a selection, inputs, or outputs.
* ASR & Transcription
    * Voice input
    * Document type: audio & text
* Translation
    * Pick a document for translation (convert to markdown first if needed)
* Image generation
    * Flux - need memory management
* Self-extending application
    * Really stretch and unsafe.

### Help Docs
* Common use cases
    * Explain aider process
    * Explain interpreting technical documents
* Conversion is best using docling, but sometimes you need interpretation, and for that a vision model is usually best.

### Feature Testing
* Test LoRA: https://huggingface.co/ETH-LLMSys/Qwen2.5-32B-LoRA/tree/main
    * This should just be loading, unloading, showing info, validating that the LoRA is valid for the model loaded.
* Test Embeddings: https://huggingface.co/intfloat/multilingual-e5-large-instruct
    * The application of embeddings is vector database retrieval, so in escence, it means creating a vector database document processing, and retrieval system to be able to showcase it.
* Tokenization should be regular model stuff, not very obvious from an inferface perspective though.
    * I guess this could be something to tokenize some input and show some stats in a dialog.
* Sampler overrides could be done as a named collection of settings?
    * These are server defined.
* Monitoring GPU: https://pypi.org/project/nvidia-ml-py/; 

Add a mechanism for controlling the reasoning system prompt for inference-time control

Low:
Low Reasoning Effort: You have extremely limited time to think and respond to the user’s query. Every additional second of processing and reasoning incurs a significant resource cost, which could affect efficiency and effectiveness. Your task is to prioritize speed without sacrificing essential clarity or accuracy. Provide the most direct and concise answer possible. Avoid unnecessary steps, reflections, verification, or refinements UNLESS ABSOLUTELY NECESSARY. Your primary goal is to deliver a quick, clear and correct response.

Medium:
Medium Reasoning Effort: You have sufficient time to think and respond to the user’s query, allowing for a more thoughtful and in-depth answer. However, be aware that the longer you take to reason and process, the greater the associated resource costs and potential consequences. While you should not rush, aim to balance the depth of your reasoning with efficiency. Prioritize providing a well-thought-out response, but do not overextend your thinking if the answer can be provided with a reasonable level of analysis. Use your reasoning time wisely, focusing on what is essential for delivering an accurate response without unnecessary delays and overthinking.

High:
High Reasoning Effort: You have unlimited time to think and respond to the user’s question. There is no need to worry about reasoning time or associated costs. Your only goal is to arrive at a reliable, correct final answer. Feel free to explore the problem from multiple angles, and try various methods in your reasoning. This includes reflecting on reasoning by trying different approaches, verifying steps from different aspects, and rethinking your conclusions as needed. You are encouraged to take the time to analyze the problem thoroughly, reflect on your reasoning promptly and test all possible solutions. Only after a deep, comprehensive thought process should you provide the final answer, ensuring it is correct and well-supported by your reasoning. 