import { MessageContent, MessageProps } from "../services/tabbyAPI";
import Message from "./Message";

interface MessagesProps {
    messages: MessageProps[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
    onEditMessage: (index: number, newContent: MessageContent[]) => void;
    onDeleteMessage: (index: number) => void;
}

export default function Messages({ 
    messages, 
    messagesEndRef,
    onEditMessage,
    onDeleteMessage 
}: MessagesProps) {
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
