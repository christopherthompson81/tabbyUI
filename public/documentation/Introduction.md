# Welcome to TabbyUI

## Introduction to TabbyUI

TabbyUI is a web-based interface designed to work seamlessly with TabbyAPI, an inference engine that powers local large language models (LLMs). When using local LLMs, the ability to select the most appropriate model for a given task is directly related to achieving the best results. The aim of this software is to make dynamic model switching trivial, a feature that previously required reconfiguration of the inference server.

## Why Use an LLM?

LLMs are powerful tools designed to understand and generate human-like text, enabling a wide range of applications such as chat conversations, text generation, problem-solving, and more. 

While traditional search engines like Google offer a wealth of information, they often fall short in providing precise, context-aware answers, especially for complex or ambiguous queries. This is where LLMs shine. LLMs are trained on vast amounts of text data from various sources, enabling them to understand and generate human-like language. Unlike search engines, which provide a list of links, LLMs can synthesize information from multiple sources to deliver coherent and relevant answers. This makes them particularly useful for questions that require nuanced understanding or context-specific responses.

<ins>**Note:** LLMs are also imperfect and their answers need to be thoroughly double-checked for validity. Be critical of the output any model provides!</ins>

Here’s why someone might choose to use an LLM:

- **Scalability:** LLMs can handle vast amounts of data and complex queries efficiently, making them suitable for a variety of tasks.
- **Flexibility:** They can be adapted to different domains, from general knowledge to specialized fields like healthcare or finance.
- **Multi-turn Conversations:** LLMs are designed to engage in extended, context-aware interactions, allowing users to refine their requests and explore ideas over multiple exchanges.
- **Proactive Responses:** LLMs can anticipate follow-up questions or needs, providing helpful and relevant suggestions during the conversation.

## How to Interact with an LLM in Multi-turn Chat

Engaging with an LLM is an iterative process where you can refine your request and explore ideas over multiple exchanges. Here are some tips for effective interaction:

1. **Start with a Clear Request:** Begin by providing a concise description of what you need. For example, "Explain the benefits of renewable energy."
2. **Provide Additional Context:** If the initial response isn’t exactly what you’re looking for, you can add more context or clarify your request. For example, "Can you focus on solar energy specifically?"
3. **Use Follow-up Questions:** The model can maintain context from previous messages, so you can ask follow-up questions to dive deeper. For example, "What are the main challenges in adopting solar energy?"
4. **Stay Specific:** To get more accurate responses, avoid overly broad or vague requests. Instead of asking, "Tell me about cars," specify, "Compare the fuel efficiency of electric cars versus gasoline cars."
5. **Summarize Before Ending:** If you’re wrapping up a conversation, you can ask the model to summarize the key points for you.

By iterating in this way, you can guide the LLM to provide increasingly useful and precise information.

## Why Choose a Cloud-based LLM?

Cloud-based LLMs offer several advantages, particularly for users seeking convenience, flexibility, and scalability. Here are some reasons why someone might opt for a cloud-based solution:

- **Easy Access and Deployment:** Cloud-based LLMs are typically accessible via the internet, eliminating the need for local hardware installation or configuration.
- **Cost-Effectiveness:** Many cloud providers offer pay-as-you-go pricing, allowing users to scale their usage up or down based on demand without incurring upfront costs.
- **Automatic Scalability:** Cloud platforms can handle increased workloads automatically, ensuring that the model remains performant even during periods of high usage.
- **Global Accessibility:** With cloud-based solutions, users can access the LLM from anywhere in the world, as long as they have an internet connection.
- **Updates and Maintenance:** Cloud providers often handle updates, security patches, and maintenance, ensuring that users always have access to the latest versions of the model with minimal effort.

## Why Choose a Local LLM?

While cloud-based LLMs are popular, there are several compelling reasons to consider running an LLM locally, particularly for scenarios where control, privacy, and customization are critical. Here’s why someone might choose a local deployment:

- **Data Privacy and Control:** Running an LLM locally ensures that sensitive or proprietary data never leaves your device or network, providing an additional layer of security.
- **Customization and Fine-tuning:** With a local deployment, you have the flexibility to fine-tune the model to your specific needs or integrate it with internal tools and workflows.
- **Offline Functionality:** Local LLMs can operate independently of internet connectivity, making them a reliable choice in environments with limited or unreliable access to the web.
- **Cost Efficiency for Heavy Users:** While initial setup may require an investment in hardware, local deployments can be more cost-effective over time for users with consistent, high-volume usage.
- **Compliance with Regulations:** For industries with strict data privacy requirements (e.g., healthcare or finance), running an LLM locally can help ensure compliance with regulations like GDPR or HIPAA.

## Why TabbyUI?

For those seeking a solution that offers privacy, customization, and reliability through offline functionality, local LLMs are the better choice and I think TabbyUI will help you run local models.

Existing interfaces often lacked the capability to switch between models effortlessly. For example, if a user needed to ask a question about an image, but their reasoning model was loaded, users previously would need to reconfigure their inference servers to enable the desired model, a process that was time-consuming and inefficient.

I made TabbyUI to fill that gap. Recognizing the need for a more flexible and user-friendly interface, I decided to create a tool that would allow users to select the best model for their specific task without the hassle of server reconfiguration.

## Key Features

At the heart of TabbyUI is a simple switching component, which is integrated into the chat input interface. This intuitive component simplifies model selection, enabling users to choose the most suitable model with just a single click. The dynamic model switching capability lets users adapt the server to the task effortlessly, enhancing both efficiency and the quality of responses.

In addition, I have also tried to ensure that LLM output is formatted correctly, handling thinking tags, inline and display LaTeX, and syntax highlighting. I also want to make sure that output continues to be well-supported, so I'm interested in hearing about model output that would expand the rendering capabilities.

## Benefits

-   **Efficiency:** With TabbyUI, users can switch between models seamlessly, saving time and streamlining their workflow.
-   **Improved Responses:** By selecting the most appropriate model for each task, users can expect enhanced accuracy and relevance in the responses generated.
-   **Seamless Integration:** TabbyUI's integration with TabbyAPI ensures a smooth and efficient experience, leveraging the full potential of the inference engine.

TabbyUI is particularly well-suited for productivity users who prioritize organization and efficiency. The interface's focus on conversation organization provides an intuitive way to compatmentalize interactions in a way that fits their individual needs. For example, categorizing conversations by client, and timeframe.

## Dark Mode?

I recommend using [Dark Reader](https://darkreader.org/). It's what I use with TabbyUI.

![Dark Reader](data:image/png;base64,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)