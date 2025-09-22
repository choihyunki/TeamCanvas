import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Card {
  id: string;
  name: string;
  status: 'todo' | 'inprogress' | 'done';
}

const initialCards: Card[] = [
  { id: '1', name: '팀원 A', status: 'todo' },
  { id: '2', name: '팀원 B', status: 'todo' },
  { id: '3', name: '팀원 C', status: 'todo' },
];

function Dashboard() {
  const [cards, setCards] = useState<Card[]>(initialCards);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCards = Array.from(cards);
    const [moved] = newCards.splice(result.source.index, 1);
    moved.status =
      result.destination.droppableId === 'todo'
        ? 'todo'
        : result.destination.droppableId === 'inprogress'
        ? 'inprogress'
        : 'done';
    newCards.splice(result.destination.index, 0, moved);

    setCards(newCards);
  };

  const renderDroppable = (id: 'todo' | 'inprogress' | 'done', title: string) => (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          className="w-1/4 min-h-[80vh] p-2 m-2 bg-gray-100 rounded"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="font-bold mb-2">{title}</h2>
          {cards
            .filter((c) => c.status === id)
            .map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided) => (
                  <div
                    className="p-2 mb-2 bg-white rounded shadow cursor-pointer"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {card.name}
                  </div>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen p-4 bg-gray-50">
        {renderDroppable('todo', '작업 전')}
        {renderDroppable('inprogress', '작업 중')}
        {renderDroppable('done', '작업 완료')}
        <div className="w-1/4 min-h-[80vh] p-2 m-2 bg-gray-200 rounded">
          <h2 className="font-bold mb-2">채팅</h2>
          {/* 채팅 컴포넌트 나중에 연결 */}
        </div>
      </div>
    </DragDropContext>
  );
}

export default Dashboard;
