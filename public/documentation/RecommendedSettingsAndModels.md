# Recommended Settings and Models.

A very common question is about what models to run. I'll share my setup and maybe it will help you pick.

I have an Nvidia 3090 (24 GB VRAM). This is both a pricey piece of hardware, and not sufficient to run state-of-the-art models. To be able to balance cost and proficiency, we compress models using quantization. The compression comes at a cost, namely an increase in "perplexity". A low perplexity means the model is more adept at predicting the correct sequence of tokens, and inversely an increase in perplexity means it is weakening that ability.The settings listed below will fit into 24 GB VRAM and provide good experiences with each model.

| Task Type | Model Name and Link                                                                                                      | Quantization  | Cache Mode | Context Size | Download Command                                                                                                                                                                         |
|-----------|--------------------------------------------------------------------------------------------------------------------------|---------------|------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Assistant | [Phi-4-14B](https://huggingface.co/TheMelonGod/phi-4-exl2)                                                               | 6.5  BPW EXL2 | Q8         | 16384        | ```huggingface-cli download TheMelonGod/phi-4-exl2 --revision 8hb-6.5bpw --local-dir /mnt/data/models/Phi-4-14B-exl2-6_5bpw/```                                                          |
| Vision    | [Qwen2.5-VL-7B-Instruct](https://huggingface.co/turboderp/Qwen2.5-VL-7B-Instruct-exl2)                                   | 8.0  BPW EXL2 | FP16       | 32768        | ```huggingface-cli download turboderp/Qwen2.5-VL-7B-Instruct-exl2 --revision 8.0bpw --local-dir /mnt/data/models/Qwen2.5-VL-7B-Instruct-exl2-8_0bpw/```                                  |
| Coding    | [Qwen2.5-Coder-32B-Instruct](https://huggingface.co/bartowski/Qwen2.5-Coder-32B-Instruct-exl2)                           | 4.25 BPW EXL2 | Q6         | 32768        | ```huggingface-cli download bartowski/Qwen2.5-Coder-32B-Instruct-exl2 --revision 4_25 --local-dir /mnt/data/models/Qwen2.5-Coder-32B-Instruct-exl2-4_25bpw/```                           |
| Reasoning | [FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview](https://huggingface.co/bartowski/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview-exl2) | 4.25 BPW EXL2 | Q6         | 32768        | ```huggingface-cli download bartowski/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview-exl2 --revision 4_25 --local-dir /mnt/data/models/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview-exl2-4_25bpw/``` |

To configure your models for their context size (allowing the model to work with more input and give more output), you will need to set:
* A "Max Tokens" value in the Settings dialog.
* The "Max Sequence Lenth" and "Cache Size" in the "Models" dialog.
* The "Cache Mode" to ensure that the context is also compressed, like the weights are, to save on VRAM use.

Not every model is capable of long context sizes. These will be defined in the "max_position_embeddings" value from each model's config.json file. For example, Phi-4 is only capable of handling 16K tokens in its context. Others that have longer context may go beyond your computer's and GPU's capabilities.