import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import AssistantSettingPopup from '@renderer/components/Popups/AssistantSettingPopup'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { getDefaultTopic } from '@renderer/services/assistant'
import { useAppSelector } from '@renderer/store'
import { Assistant } from '@renderer/types'
import { droppableReorder, uuid } from '@renderer/utils'
import { Dropdown } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { last } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  activeAssistant: Assistant
  setActiveAssistant: (assistant: Assistant) => void
  onCreateAssistant: () => void
}

const Assistants: FC<Props> = ({ activeAssistant, setActiveAssistant, onCreateAssistant }) => {
  const { assistants, removeAssistant, addAssistant, updateAssistants } = useAssistants()
  const { updateAssistant } = useAssistant(activeAssistant.id)
  const generating = useAppSelector((state) => state.runtime.generating)

  const { t } = useTranslation()

  const onDelete = (assistant: Assistant) => {
    const _assistant = last(assistants.filter((a) => a.id !== assistant.id))
    _assistant ? setActiveAssistant(_assistant) : onCreateAssistant()
    removeAssistant(assistant.id)
  }

  const getMenuItems = (assistant: Assistant) =>
    [
      {
        label: t('common.edit'),
        key: 'edit',
        icon: <EditOutlined />,
        async onClick() {
          const _assistant = await AssistantSettingPopup.show({ assistant })
          updateAssistant(_assistant)
        }
      },
      {
        label: t('common.duplicate'),
        key: 'duplicate',
        icon: <CopyOutlined />,
        onClick: async () => {
          const _assistant: Assistant = { ...assistant, id: uuid(), topics: [getDefaultTopic()] }
          addAssistant(_assistant)
          setActiveAssistant(_assistant)
        }
      },
      { type: 'divider' },
      {
        label: t('common.delete'),
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(assistant)
      }
    ] as ItemType[]

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      const reorderAssistants = droppableReorder<Assistant>(assistants, sourceIndex, destIndex)
      updateAssistants(reorderAssistants)
    }
  }

  const onSwitchAssistant = (assistant: Assistant) => {
    if (generating) {
      window.message.warning({ content: t('message.switch.disabled'), key: 'switch-assistant' })
      return
    }
    setActiveAssistant(assistant)
  }

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {assistants.map((assistant, index) => (
                <Draggable key={`draggable_${assistant.id}_${index}`} draggableId={assistant.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <Dropdown key={assistant.id} menu={{ items: getMenuItems(assistant) }} trigger={['contextMenu']}>
                        <AssistantItem
                          onClick={() => onSwitchAssistant(assistant)}
                          className={assistant.id === activeAssistant?.id ? 'active' : ''}>
                          <AssistantName>{assistant.name}</AssistantName>
                        </AssistantItem>
                      </Dropdown>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--assistants-width);
  max-width: var(--assistants-width);
  border-right: 0.5px solid var(--color-border);
  height: calc(100vh - var(--navbar-height));
  padding: 10px;
  overflow-y: auto;
`

const AssistantItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 7px 10px;
  position: relative;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  .anticon {
    display: none;
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon {
      display: block;
      color: var(--color-text-1);
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
  }
`

const AssistantName = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default Assistants
