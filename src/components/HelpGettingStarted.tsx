//import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const HelpIntroduction = () => {
    return (
        <div className="introduction-container">
            <h1>Setting Up Your Environment</h1>
            <div className="content-section">
                <h2>1. Python Setup</h2>
                <p>
                    Before you begin, ensure that you have Python 3.10 or newer
                    installed on your system. Python is the primary language
                    used for interacting with TabbyAPI, and having the correct
                    version is essential for compatibility.
                </p>
                <h3>Install Python 3.10 or newer</h3>
                <p>
                    You can download Python from the official Python website:
                    <a href="https://www.python.org">https://www.python.org</a>.
                    Follow the installation instructions for your operating
                    system.
                </p>
                <h3>Create a virtual environment (recommended)</h3>
                <p>
                    Using a virtual environment helps isolate your project
                    dependencies and prevents version conflicts. To create a
                    virtual environment:
                </p>
                <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                    python -m venv myenv
                </SyntaxHighlighter>
                <p>Activate the virtual environment:</p>
                <ul>
                    <li>
                        <p>On Windows:</p>
                        <SyntaxHighlighter language="cmd" style={vscDarkPlus}>
                            myenv\Scripts\activate
                        </SyntaxHighlighter>
                    </li>
                    <li>
                        <p>On macOS/Linux:</p>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            source myenv/bin/activate
                        </SyntaxHighlighter>
                    </li>
                </ul>
            </div>

            <div className="content-section">
                <h3>Install required Python packages</h3>
                <p>
                    Once your virtual environment is set up, install the
                    necessary Python packages. You can install them using `pip`:
                </p>
                <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                    pip install -r requirements.txt
                </SyntaxHighlighter>
                <p>
                    Make sure you have a `requirements.txt` file listing all the
                    dependencies for your project.
                </p>
                <h2>2. Install ExLlamaV2</h2>
                <p>
                    ExLlamaV2 is a high-performance library optimized for
                    running large language models on consumer-grade hardware.
                    Follow these steps to install it:
                </p>
                <ul>
                    <li>
                        <strong>Clone the ExLlamaV2 repository</strong>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            {`git clone https://github.com/exllamav2/exllamav2.git\ncd exllamav2`}
                        </SyntaxHighlighter>
                    </li>
                    <li>
                        <strong>Install dependencies</strong>
                        <p>
                            ExLlamaV2 requires several dependencies to be
                            installed. Install them using pip:
                        </p>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            pip install -r requirements.txt
                        </SyntaxHighlighter>
                    </li>
                    <li>
                        <strong>Build the required CUDA extensions</strong>
                        <p>
                            To enable GPU acceleration, you'll need to build the
                            CUDA extensions. Ensure that you have CUDA toolkit
                            installed on your system. Then, run:
                        </p>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            python setup.py install
                        </SyntaxHighlighter>
                        <p>
                            If you encounter any issues during the build
                            process, check that your CUDA version is compatible
                            with the library requirements.
                        </p>
                    </li>
                </ul>
                <h2>3. Install and Configure TabbyAPI</h2>
                <p>
                    Now that ExLlamaV2 is installed, it's time to set up
                    TabbyAPI.
                </p>
                <ul>
                    <li>
                        <h3>Install TabbyAPI using pip</h3>
                        <p>Install TabbyAPI from PyPI:</p>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            pip install tabbyapi
                        </SyntaxHighlighter>
                    </li>
                    <li>
                        <h3>Configure the server settings</h3>
                        <p>
                            After installation, you'll need to configure the
                            server. Create a configuration file (e.g.,
                            `config.json`) with the following settings:
                        </p>
                        <SyntaxHighlighter language="json" style={vscDarkPlus}>
                            {`{\n\t"host": "0.0.0.0",\n\t"port": 8000,\n\t"model_path": "/path/to/your/model",\n\t"gpu": true\n}`}
                        </SyntaxHighlighter>
                        <p>Adjust the settings according to your needs.</p>
                    </li>
                    <li>
                        <h3>Set up API keys and access controls</h3>
                        <p>
                            For security, it's important to set up API keys and
                            access controls. Generate an API key and store it
                            securely. You can configure access controls in your
                            server settings to restrict access to authorized
                            users only.
                        </p>
                    </li>
                </ul>
                <h2>4. Model Management</h2>
                <p>
                    TabbyAPI allows you to manage and optimize models for
                    inference.
                </p>
                <ul>
                    <li>
                        <h3>
                            Download models from Hugging Face using TabbyAPI
                        </h3>
                        <p>
                            You can download models directly from Hugging Face
                            using TabbyAPI's CLI or API interface. For example:
                        </p>
                        <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                            tabbyapi download-model --name "model-name" --repo
                            "username/model"
                        </SyntaxHighlighter>
                    </li>
                    <li>
                        <h3>Configure model parameters</h3>
                        <p>
                            Once a model is downloaded, you can configure its
                            parameters to suit your use case. This includes
                            settings like precision, batch size, and
                            temperature. Refer to the TabbyAPI documentation for
                            a full list of configurable parameters.
                        </p>
                    </li>
                    <li>
                        <h3>Optimize for your hardware</h3>
                        <p>
                            To achieve the best performance, optimize your setup
                            based on your hardware. For example:
                        </p>
                        <ul>
                            <li>Use GPU acceleration if available.</li>
                            <li>
                                Adjust model quantization settings to balance
                                speed and accuracy.
                            </li>
                            <li>
                                Experiment with different batch sizes to find
                                the optimal configuration for your workload.
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <p>
                With these steps completed, you should be ready to start using
                TabbyAPI for inference tasks. If you encounter any issues during
                the setup process, raise an issue on the GitHub page or reach
                out to the community for support.
            </p>
        </div>
    );
};

export default HelpIntroduction;
