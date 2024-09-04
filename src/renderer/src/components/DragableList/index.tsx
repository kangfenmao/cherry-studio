import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { droppableReorder } from '@renderer/utils'
import { FC } from 'react'

interface Props<T> {
  list: T[]
  style?: React.CSSProperties
  children: (item: T, index: number) => React.ReactNode
  onUpdate: (list: T[]) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

const DragableList: FC<Props<any>> = ({ children, list, style, onDragStart, onUpdate, onDragEnd }) => {
  const _onDragEnd = (result: DropResult) => {
    onDragEnd?.()
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      const reorderAgents = droppableReorder(list, sourceIndex, destIndex)
      onUpdate(reorderAgents)
    }
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={_onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {list.map((item, index) => (
              <Draggable key={`draggable_${item.id}_${index}`} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, marginBottom: 8, ...style }}>
                    {children(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragableList
