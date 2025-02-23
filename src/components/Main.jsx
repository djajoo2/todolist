import React, { useEffect, useState } from 'react';
import {  Edit2, Trash2 } from 'react-feather';
import CardAdd from './CardAdd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const API_URL = "https://dummyjson.com/todos";
const statuses = ["Pending", "In Progress", "Completed"];

const Main = () => {
    const [lanes, setLanes] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                const updatedTodos = data.todos.map((todo, index) => ({
                    ...todo,
                    id: String(todo.id), // Ensure id is a string
                    status: index % 3 
                }));

                const formattedLanes = statuses.map((status, index) => ({
                    id: String(index), 
                    title: status,
                    items: updatedTodos.filter(todo => todo.status === index)
                }));
                setLanes(formattedLanes);
            });
    }, []);

    const onDragEnd = (res) => {
        if (!res.destination) return;

        const sourceIndex = parseInt(res.source.droppableId);
        const destinationIndex = parseInt(res.destination.droppableId);
        const newLanes = [...lanes];

        const [movedItem] = newLanes[sourceIndex].items.splice(res.source.index, 1);
        newLanes[destinationIndex].items.splice(res.destination.index, 0, movedItem);

        setLanes(newLanes);
    };

    const addCard = (text, laneIndex) => {
        // add api 
        fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              todo: text,
              completed: false,
              status:0,
              userId: 5,
            })
          })
          .then(res => res.json())
          .then(data =>{
            const newLanes = [...lanes];
            newLanes[laneIndex].items.push({
                id: data.id, // Ensure id is a string
                todo: text
            });
            setLanes(newLanes);
          });
    };

    // delete todo from list
    const deleteCard = (laneIndex, itemIndex,id) => {
        const newLanes = [...lanes];
        newLanes[laneIndex].items.splice(itemIndex, 1);
        setLanes(newLanes);

        fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
          })
    };

    // edit todo from list
    const editCard = (laneIndex, itemIndex, text) => {
        setEditingTask({ laneIndex, itemIndex });
        setEditText(text);
    };

    const saveEdit = (id) => {
        if (editingTask) {
            console.log(editingTask,"editingTask");
            
            const { laneIndex, itemIndex } = editingTask;
            const newLanes = [...lanes];
            newLanes[laneIndex].items[itemIndex].todo = editText;
            setLanes(newLanes);
            setEditingTask(null);
            setEditText("");
        }

       /* updating completed status of todo with id  */
       fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                todo: editText
            })
         })
    };

    return (
        <div className='flex flex-col w-full'>
            <div className='p-3 bg-black flex justify-between w-full bg-opacity-50'>
                <h2 className='text-lg'>Todo Board</h2>
            </div>
            <div className='flex flex-grow gap-8 justify-center overflow-x-auto p-3'>
                <DragDropContext onDragEnd={onDragEnd}>
                    {lanes.map((lane, laneIndex) => (
                        <div key={lane.id} className='mr-3 w-120 bg-black rounded-md p-2 flex-shrink-0'>
                            <div className='flex justify-between p-1'>
                                <span>{lane.title}</span>
                            </div>
                            <Droppable droppableId={lane.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className='py-1'
                                        style={{ backgroundColor: snapshot.isDraggingOver ? '#222' : 'transparent' }}
                                    >
                                        {lane.items.map((item, itemIndex) => (
                                            <Draggable key={item.id} draggableId={String(item.id)} index={itemIndex}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className='item flex justify-between items-center bg-zinc-700 p-1 cursor-pointer rounded-md border-2 border-zinc-900 hover:border-gray-500'
                                                    >
                                                        {editingTask && editingTask.laneIndex === laneIndex && editingTask.itemIndex === itemIndex ? (
                                                            <input
                                                                type='text'
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                onBlur={()=>saveEdit(item.id)}
                                                                autoFocus
                                                                className='bg-gray-800 text-white p-1 rounded-md w-full'
                                                            />
                                                        ) : (
                                                            <span>{item.todo}</span>
                                                        )}
                                                        <div className='flex'>
                                                            <button className='hover:bg-gray-600 p-1 rounded-sm' onClick={() => editCard(laneIndex, itemIndex, item.todo)}>
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button className='hover:bg-red-600 p-1 rounded-sm' onClick={() => deleteCard(laneIndex, itemIndex,item.id)}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            {laneIndex === 0 && <CardAdd getcard={(text) => addCard(text, laneIndex)} />}
                        </div>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
};

export default Main;
