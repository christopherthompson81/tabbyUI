//import React from "react";

const HelpIntroduction = () => {
    return (
        <div className="introduction-container">
            <h1>Welcome to TabbyUI</h1>
            <div className="content-section">
                <h2>Introduction to TabbyUI</h2>
                <p>
                    When using local large language models (LLMs), the ability
                    to select the most appropriate model for a given task is
                    crucial for achieving the best results. TabbyUI is a
                    web-based interface designed to work seamlessly with
                    TabbyAPI, an inference engine that powers these models. The
                    aim of it is to make dynamic model switching trivial, a
                    feature that previously required reconfiguration of the
                    inference server.
                </p>
                <h2>Why TabbyUI?</h2>
                <p>
                    Existing interfaces often lacked the capability to switch
                    between models effortlessly. For example, if a user needed
                    to ask a question about an image, but their reasoning model
                    was loaded, users previously would need to reconfigure their
                    inference servers to enable the desired model, a process
                    that was time-consuming and inefficient.
                </p>
                <p>
                    TabbyUI was created to fill this gap. Recognizing the need
                    for a more flexible and user-friendly interface, I decided
                    to create a tool that would allow users to select the best
                    model for their specific task without the hassle of server
                    reconfiguration.
                </p>
            </div>

            <div className="content-section">
                <h2>Key Features</h2>
                <p>
                    At the heart of TabbyUI is a simple switching component,
                    which is integrated into the chat input interface. This
                    intuitive component simplifies model selection, enabling
                    users to choose the most suitable model with just a single
                    click. The dynamic model switching capability ensures that
                    users can adapt to changing requirements effortlessly,
                    enhancing both efficiency and the quality of responses.
                </p>
                <p>
                    In addition, I have also tried to make good effort to ensure
                    that LLM output is formatted correctly, handling thinking
                    tags, inline and display LaTeX, and syntax highlighting. I
                    also want to make sure that output continues to be
                    well-supported so I'm interested in hearing about model
                    output that would expand the rendering capabilities.
                </p>
                <h2>Benefits</h2>
                <ul>
                    <li>
                        <strong>Efficiency:</strong> With TabbyUI, users can
                        switch between models seamlessly, saving time and
                        streamlining their workflow.
                    </li>
                    <li>
                        <strong>Improved Responses:</strong> By selecting the
                        most appropriate model for each task, users can expect
                        enhanced accuracy and relevance in the responses
                        generated.
                    </li>
                    <li>
                        <strong>Seamless Integration:</strong> TabbyUI's
                        integration with TabbyAPI ensures a smooth and efficient
                        experience, leveraging the full potential of the
                        inference engine.
                    </li>
                </ul>
            </div>

            <div className="content-section">
                <h2>Target Audience</h2>
                <p>
                    TabbyUI is ideal for developers and researchers working with
                    language models, offering them a powerful tool to enhance
                    their projects. Its user-friendly design ensures that even
                    those without extensive technical expertise can navigate and
                    benefit from its features.
                </p>

                <p>
                    In addition, TabbyUI is particularly well-suited for
                    productivity users who prioritize organization and
                    efficiency. The interface's focus on conversation
                    organization helps users manage tasks, categorize by
                    clients, and track timeframes, making it a valuable tool for
                    professional workflows.
                </p>
            </div>
        </div>
    );
};

export default HelpIntroduction;
