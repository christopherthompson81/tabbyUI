import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Message from '../Message';

interface VirtualizedMessageListProps {
  messages: any[];
  saveConversation: (v: any[]) => void;
}

const VirtualizedMessageList = ({ messages, saveConversation }: VirtualizedMessageListProps) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    return (
      <div style={style}>
        <Message
          role={message.role}
          content={message.content}
          onEdit={(i, newContent) => {
            const updatedMessages = [...messages];
            updatedMessages[i].content = newContent;
            saveConversation(updatedMessages);
          }}
          onDelete={(i) => {
            const updatedMessages = messages.filter((_, idx) => idx !== i);
            saveConversation(updatedMessages);
          }}
          index={index}
        />
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={messages.length}
          itemSize={200} // Adjust based on average message height
          overscanCount={5}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};

export default VirtualizedMessageList;
