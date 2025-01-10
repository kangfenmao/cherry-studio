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
import { useSettings } from '@renderer/hooks/useSettings'
import { useAppDispatch } from '@renderer/store'
import { MinAppIcon, setMiniAppIcons } from '@renderer/store/settings'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

// 添加 reorderLists 函数的接口定义
interface ReorderListsParams {
  sourceList: MinAppIcon[]
  destList: MinAppIcon[]
  sourceIndex: number
  destIndex: number
  isSameList: boolean
}

interface ReorderListsResult {
  sourceList: MinAppIcon[]
  destList: MinAppIcon[]
}

// 添加 reorderLists 函数
const reorderLists = ({
  sourceList,
  destList,
  sourceIndex,
  destIndex,
  isSameList
}: ReorderListsParams): ReorderListsResult => {
  if (isSameList) {
    // 在同一列表内重新排序
    const newList = [...sourceList]
    const [removed] = newList.splice(sourceIndex, 1)
    newList.splice(destIndex, 0, removed)
    return {
      sourceList: newList,
      destList: destList
    }
  } else {
    // 在不同列表间移动
    const newSourceList = [...sourceList]
    const [removed] = newSourceList.splice(sourceIndex, 1)
    const newDestList = [...destList]
    newDestList.splice(destIndex, 0, removed)
    return {
      sourceList: newSourceList,
      destList: newDestList
    }
  }
}

const MiniAppIconsManager: FC<MiniAppManagerProps> = ({
  visibleMiniApps,
  disabledMiniApps,
  setVisibleMiniApps,
  setDisabledMiniApps
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { miniAppIcons } = useSettings()
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
    (newVisible: MinAppIcon[], newDisabled: MinAppIcon[]) => {
      setVisibleMiniApps(newVisible)
      setDisabledMiniApps(newDisabled)

      // 保持 pinned 状态不变
      dispatch(
        setMiniAppIcons({
          visible: newVisible,
          disabled: newDisabled,
          pinned: miniAppIcons.pinned // 保持原有的 pinned 状态
        })
      )
    },
    [dispatch, setVisibleMiniApps, setDisabledMiniApps, miniAppIcons.pinned]
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const { source, destination } = result
      const sourceList = source.droppableId as ListType
      const destList = destination.droppableId as ListType

      // 如果是 pinned 的小程序，不允许拖到 disabled
      if (destList === 'disabled') {
        const draggedApp = sourceList === 'visible' ? visibleMiniApps[source.index] : disabledMiniApps[source.index]

        if (miniAppIcons.pinned.includes(draggedApp)) {
          window.message.error(t('settings.display.minApp.pinnedError'))
          return
        }
      }

      const newLists = reorderLists({
        sourceList: sourceList === 'visible' ? visibleMiniApps : disabledMiniApps,
        destList: destList === 'visible' ? visibleMiniApps : disabledMiniApps,
        sourceIndex: source.index,
        destIndex: destination.index,
        isSameList: sourceList === destList
      })

      handleListUpdate(
        sourceList === 'visible' ? newLists.sourceList : newLists.destList,
        sourceList === 'visible' ? newLists.destList : newLists.sourceList
      )
    },
    [visibleMiniApps, disabledMiniApps, handleListUpdate, miniAppIcons.pinned, t]
  )

  const onMoveMiniApp = useCallback(
    (program: MinAppIcon, fromList: ListType) => {
      // 如果是从可见列表移动到隐藏列表，且程序是 pinned 状态，则阻止移动
      if (fromList === 'visible' && miniAppIcons.pinned.includes(program)) {
        window.message.error(t('settings.display.minApp.pinnedError'))
        return
      }

      const isMovingToVisible = fromList === 'disabled'
      const newVisible = isMovingToVisible
        ? [...visibleMiniApps, program]
        : visibleMiniApps.filter((p) => p !== program)
      const newDisabled = isMovingToVisible
        ? disabledMiniApps.filter((p) => p !== program)
        : [...disabledMiniApps, program]

      handleListUpdate(newVisible, newDisabled)
    },
    [visibleMiniApps, disabledMiniApps, handleListUpdate, miniAppIcons.pinned, t]
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
