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
* Keep trying to add functions that TabbyAPI offers, like unloading models, embeddings, tokenization, LoRas, prompt templates, and sampler overrides

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

### Feature Testing
* Unloading models should be easy.
* Test LoRa: https://huggingface.co/ETH-LLMSys/Qwen2.5-32B-LoRA/tree/main
* Test Embeddings: https://huggingface.co/intfloat/multilingual-e5-large-instruct
* Tokenization should be regular model stuff, not very obvious from an inferface perspective though.
* Prompt templates need a Jinja2 parser
* Sampler overrides could be done as a named collection of settings?