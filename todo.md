### Now
* Move Settings and models data to reducers 
    * Separate and expand settings to cover all possibilities in Chat Completion
    * Add enumerated type for Cache Quantization.
* Add conversation organization tool (moving, MC style)
* Mask display of API keys once they're saved.
* Make the current selected conversation have a slightly different background color to show it's selected.
* Help expansion
    * Add "Recommended Settings and Models" tab.
    * Add detailed settings parameter explanations.
* Add arbitrary expansion to "Model Preferences" with an Emoji identifier.
    * Model Settings might need to be separate from Model Preferences in some way.
* Add tooltip to model status to show additional model information

### Soon
* Add a PDF to a mixed modality ingestor
* Retrieval solution
* Multi-user
* Add a "Completions" interface
    * tailor this to the Alice in Wonderland example.
* Help expansion
    * Add instructions for writing a non-canonical chapter of Alice in Wonderland using completion.
* Keep trying to add functions that TabbyAPI offers, like unloading models, embeddings, tokenization, LoRas, prompt templates, and sampler overrides

### Stretch
* TTS
* ASR
* Document Analysis (Docling)
* Transcription 
* Translation
* Image generation
* Self-extending application

### Help Docs
* How to get started with tabbyUI & local LLM
    * Configure model selections
* Common use cases
    * Explain aider process
    * Explain interpreting technical documents