### Now
* Add conversation organization tool (moving, MC style)
* Help expansion
    * Add detailed settings parameter explanations.
* Add arbitrary expansion to "Model Preferences" with an Emoji identifier.
    * Model Settings might need to be separate from Model Preferences in some way.

### Soon
* Add a PDF to a mixed modality ingestor
* Retrieval solution
* Multi-user
* Add a "Completions" interface
    * Tailor this to the Alice in Wonderland example.
    * There should probably be a continue button that is different than the send button. This button will either try to extend the response from the assistant, or, if there is data in the input preview, the user's input. The template is probably needed to convert the messages object to match the template, but unary input from just the user should not be.  
* Help expansion
    * Add instructions for writing a non-canonical chapter of Alice in Wonderland using completion.
* Keep trying to add functions that TabbyAPI offers, like unloading models, embeddings, tokenization, LoRas, prompt templates, and sampler overrides

### Stretch
* TTS
    * Speak a selection, inputs, or outputs.
* ASR & Transcription
    * Voice input
    * Document type: audio & text
* Document Analysis (Docling)
    * Document type: markdown and images
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