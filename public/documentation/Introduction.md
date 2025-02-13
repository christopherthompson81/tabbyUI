# Welcome to TabbyUI

## Introduction to TabbyUI

TabbyUI is a web-based interface designed to work seamlessly with TabbyAPI, an inference engine that powers local large language models (LLMs). When using local large language models (LLMs), the ability to select the most appropriate model for a given task is directly related to achieving the best results. The aim of this software is to make dynamic model switching trivial, a feature that previously required reconfiguration of the inference server.

## Why Use an LLM?

LLMs are powerful tools designed to understand and generate human-like text, enabling a wide range of applications such as chat conversations, text generation, problem-solving, and more. 

While traditional search engines like Google offer a wealth of information, they often fall short in providing precise, context-aware answers, especially for complex or ambiguous queries. This is where Language Learning Models (LLMs) shine. LLMs are trained on vast amounts of text data from various sources, enabling them to understand and generate human-like language. Unlike search engines, which provide a list of links, LLMs can synthesize information from multiple sources to deliver coherent and relevant answers. This makes them particularly useful for questions that require nuanced understanding or context-specific responses.

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