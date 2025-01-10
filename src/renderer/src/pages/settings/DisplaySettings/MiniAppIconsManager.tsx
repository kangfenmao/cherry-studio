import { CloseOutlined } from '@ant-design/icons'
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult
} from '@hello-pangea/dnd'
import { getAllMinApps } from '@renderer/config/minapps'
import { useAppDispatch } from '@renderer/store'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { MinAppIcon, setMiniAppIcons } from '../../../store/settings'

interface MiniAppManagerProps {
  visibleMiniApps: MinAppIcon[]
  disabledMiniApps: MinAppIcon[]
  setVisibleMiniApps: (programs: MinAppIcon[]) => void
  setDisabledMiniApps: (programs: MinAppIcon[]) => void
}

// 将可复用的类型和常量提取出来
type ListType = 'visible' | 'disabled'
interface AppInfo {
  name: string
  logo?: string
}

const MiniAppIconsManager: FC<MiniAppManagerProps> = ({
  visibleMiniApps,
  disabledMiniApps,
  setVisibleMiniApps,
  setDisabledMiniApps
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const allApps = useMemo(() => getAllMinApps(), [])

  // 创建 app 信息的 Map 缓存
  const appInfoMap = useMemo(() => {
    return allApps.reduce(
      (acc, app) => {
        acc[String(app.id)] = { name: app.name, logo: app.logo }
        return acc
      },
      {} as Record<string, AppInfo>
    )
  }, [allApps])

  const getAppInfo = useCallback(
    (id: MinAppIcon) => {
      return appInfoMap[String(id)] || { name: id, logo: '' }
    },
    [appInfoMap]
  )

  const handleListUpdate = useCallback(
    (visible: MinAppIcon[], disabled: MinAppIcon[]) => {
      setVisibleMiniApps(visible)
      setDisabledMiniApps(disabled)
      dispatch(setMiniAppIcons({ visible, disabled, pinned: [] }))
    },
    [dispatch, setVisibleMiniApps, setDisabledMiniApps]
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result
      if (!destination) return

      const sourceList = source.droppableId === 'visible' ? visibleMiniApps : disabledMiniApps
      const destList = destination.droppableId === 'visible' ? visibleMiniApps : disabledMiniApps

      if (source.droppableId === destination.droppableId) {
        const newList = [...sourceList]
        const [removed] = newList.splice(source.index, 1)
        newList.splice(destination.index, 0, removed)

        handleListUpdate(
          source.droppableId === 'visible' ? newList : visibleMiniApps,
          source.droppableId === 'disabled' ? newList : disabledMiniApps
        )
      } else {
        const sourceNewList = [...sourceList]
        const [removed] = sourceNewList.splice(source.index, 1)
        const destNewList = [...destList]
        destNewList.splice(destination.index, 0, removed)

        handleListUpdate(
          destination.droppableId === 'visible' ? destNewList : sourceNewList,
          destination.droppableId === 'disabled' ? destNewList : sourceNewList
        )
      }
    },
    [visibleMiniApps, disabledMiniApps, handleListUpdate]
  )

  const onMoveMiniApp = useCallback(
    (program: MinAppIcon, fromList: ListType) => {
      const isMovingToVisible = fromList === 'disabled'
      const newVisible = isMovingToVisible
        ? [...visibleMiniApps, program]
        : visibleMiniApps.filter((p) => p !== program)
      const newDisabled = isMovingToVisible
        ? disabledMiniApps.filter((p) => p !== program)
        : [...disabledMiniApps, program]

      handleListUpdate(newVisible, newDisabled)
    },
    [visibleMiniApps, disabledMiniApps, handleListUpdate]
  )

  const renderProgramItem = (program: MinAppIcon, provided: DraggableProvided, listType: ListType) => {
    const { name, logo } = getAppInfo(program)

    return (
      <ProgramItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        <ProgramContent>
          <AppLogo src={logo} alt={name} />
          <span>{name}</span>
        </ProgramContent>
        <CloseButton onClick={() => onMoveMiniApp(program, listType)}>
          <CloseOutlined />
        </CloseButton>
      </ProgramItem>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ProgramSection>
        {(['visible', 'disabled'] as const).map((listType) => (
          <ProgramColumn key={listType}>
            <h4>{t(`settings.display.minApp.${listType}`)}</h4>
            <Droppable droppableId={listType}>
              {(provided: DroppableProvided) => (
                <ProgramList ref={provided.innerRef} {...provided.droppableProps}>
                  <ScrollContainer>
                    {(listType === 'visible' ? visibleMiniApps : disabledMiniApps).map((program, index) => (
                      <Draggable key={program} draggableId={String(program)} index={index}>
                        {(provided: DraggableProvided) => renderProgramItem(program, provided, listType)}
                      </Draggable>
                    ))}
                    {disabledMiniApps.length === 0 && listType === 'disabled' && (
                      <EmptyPlaceholder>{t('settings.display.minApp.empty')}</EmptyPlaceholder>
                    )}
                    {provided.placeholder}
                  </ScrollContainer>
                </ProgramList>
              )}
            </Droppable>
          </ProgramColumn>
        ))}
      </ProgramSection>
    </DragDropContext>
  )
}

const AppLogo = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  object-fit: contain;
`

const ScrollContainer = styled.div`
  overflow-y: auto;
  height: 100%;
`

const ProgramSection = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  background: var(--color-background);
`

const ProgramColumn = styled.div`
  flex: 1;

  h4 {
    margin-bottom: 10px;
    color: var(--color-text);
    font-weight: normal;
  }
`

const ProgramList = styled.div`
  height: 365px;
  min-height: 365px;
  padding: 10px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
`

const ProgramItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: move;
`

const ProgramContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .iconfont {
    font-size: 16px;
    color: var(--color-text);
  }

  span {
    color: var(--color-text);
  }
`

const CloseButton = styled.div`
  cursor: pointer;
  color: var(--color-text-2);
  opacity: 0;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text);
  }

  ${ProgramItem}:hover & {
    opacity: 1;
  }
`

const EmptyPlaceholder = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  text-align: center;
  padding: 20px;
  font-size: 14px;
`

export default MiniAppIconsManager
