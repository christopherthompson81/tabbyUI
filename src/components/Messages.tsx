import { useReducerContext } from "../reducers/ReducerContext";
import { MessageContent } from "../services/tabbyAPI";
//components
import Message from "./Message";

interface MessagesProps {
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function Messages({ messagesEndRef }: MessagesProps) {
    const { currentConversationId, messages, dispatch } = useReducerContext();

    const onEditMessage = (index: number, newContent: MessageContent[]) => {
        const updatedMessages = [...messages];
        updatedMessages[index].content = newContent;
        if (currentConversationId !== null) {
            dispatch({
                type: "UPDATE_CONVERSATION",
                id: currentConversationId,
                messages: updatedMessages,
            });
        }
    };

    const onDeleteMessage = (index: number) => {
        const updatedMessages = messages.filter((_, idx) => idx !== index);
        if (currentConversationId !== null) {
            dispatch({
                type: "UPDATE_CONVERSATION",
                id: currentConversationId,
                messages: updatedMessages,
            });
        }
    };

    return (
        <div className="main-content">
            {messages.map((message, index) => (
                <Message
                    key={index}
                    role={message.role}
                    content={message.content}
                    onEdit={(i, newContent) => onEditMessage(i, newContent)}
                    onDelete={(i) => onDeleteMessage(i)}
                    index={index}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
