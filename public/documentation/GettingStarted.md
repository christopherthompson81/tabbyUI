# Setting Up Your Environment

To get started with TabbyUI interface, you'll need to set up your development environment properly.Primarily, You will need to connect to a TabbyAPI server to use TabbyUI. This will also require additional underlying software:

-   ExLlamaV2 is a high-performance library optimized for running large language models on consumer-grade hardware.

This guide will walk you through the necessary steps to install the required software, configure your environment, and optimize your setup for optimal performance.

---

## 1. Python Setup

Before you begin, ensure that you have Python 3.10 or newer installed on your system. Python is the primary language used for interacting with TabbyAPI, and having the correct version is essential for compatibility.

### Install Python 3.10 or newer

You can download Python from the official Python website: [https://www.python.org](https://www.python.org). Follow the installation instructions for your operating system.

---

## 2. Install TabbyAPI

### Install TabbyAPI

1. Clone the TabbyAPI repository to your machine:

```bash
git clone https://github.com/theroyallab/tabbyAPI
```

2. Navigate to the project directory:

```bash
cd tabbyAPI
```

3. Run the appropriate start script (start.bat for Windows and start.sh for linux).

On Windows:

```cmd
start.bat
```

On macOS/Linux:

```bash
start.sh
```

1. Follow the on-screen instructions and select the correct GPU library.
2. Assuming that the prerequisites are installed and can be located, a virtual environment will be created for you and dependencies will be installed.

3. The API should start with no model loaded

### Configure the server settings

After installation, you'll need to configure the server. A sample config.yml file would have been acquired in the prior step. During setup, that sample config would have been copied over as your new configuration. You can manually do those steps if you want to make changes.

On Windows:

```cmd
copy config_sample.yml config.yml
```

On macOS/Linux:

```bash
cp config_sample.yml config.yml
```

For example if you have an Nvida 3090 with 24 GB of VRAM and and you wanted your coding model loaded by default, you may want to set Qwen2.5-Coder-32B-Instruct in the configuration.
```yaml
network:
    host: 0.0.0.0
    port: 8000
    disable_auth: false
    disable_fetch_requests: false
    send_tracebacks: false
    api_servers: ["OAI"]

logging:
    log_prompt: false
    log_generation_params: false
    log_requests: false

model:
model_dir: models
    inline_model_loading: false
    use_dummy_models: false
    dummy_model_names: ["gpt-3.5-turbo"]
    model_name: "Qwen2.5-Coder-32B-Instruct-exl2-4_25"
    use_as_default: []
    max_seq_len: 32768
    tensor_parallel: false
    gpu_split_auto: true
    autosplit_reserve: [96]
    gpu_split: []
    rope_scale: 1.0
    rope_alpha:
    cache_mode: Q6
    cache_size: 32768
    chunk_size: 2048
    max_batch_size:
    prompt_template:
    vision: False
    num_experts_per_token:

draft_model:
    draft_model_dir: draft_models
    draft_rope_scale: 1.0
    draft_rope_alpha:
    draft_cache_mode: Q6

lora:
    lora_dir: loras
    loras:

embeddings:
    embedding_model_dir: models
    embeddings_device: cpu
    embedding_model_name:

sampling:
    override_preset: None

developer:
    unsafe_launch: false
    disable_request_streaming: false
    cuda_malloc_backend: true
    uvloop: false
    realtime_process_priority: false
```

Adjust the settings according to your needs. The network host may be the most salient item to you.

### Set up API keys and access controls

For security, it's important to set up API keys and access controls. The setup step generated API keys for you in api_tokens.yml. Ensure you keep these keys safe and rotate them if they are exposed. Review the generated keys and have a plan to maintain security.

---

## 4. Model Management

TabbyAPI allows you to manage and optimize models for inference.

### Download models from Hugging Face using TabbyAPI

You can download models directly from Hugging Face using the CLI or API interface. To install huggingface's CLI tooling:
```bash
pip install -U "huggingface_hub[cli]"
```

Using that same model example from before. This would be downloaded using the following commands:

```bash
huggingface-cli download bartowski/Qwen2.5-Coder-32B-Instruct-exl2 --revision 4_25 --local-dir /mnt/data/models/Qwen2.5-Coder-32B-Instruct-exl2/
```

As an optional step, I typically have a storage partition and then link them into my TabbyAPI model folder:
```bash
ln -s /mnt/data/models/Qwen2.5-Coder-32B-Instruct-exl2 ~/Programming/tabbyAPI/models/Qwen2.5-Coder-32B-Instruct-exl2
```

### Configure model generation parameters

Once a model is downloaded, you can configure its parameters to suit your use case. This includes settings like context size, and temperature. Refer to the TabbyAPI documentation for a full list of configurable parameters and access the settings from the main menu in TabbyUI.

Additionally, model preferences can be defined in the "models" item from the main menu. This will let you dynamically load models using the selector component in the chat interface.

---

With these steps completed, you should be ready to start using TabbyAPI for inference tasks. If you encounter any issues during the setup process, refer to the troubleshooting guide or reach out to the community for support.
