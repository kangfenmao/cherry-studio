import { UndoOutlined } from '@ant-design/icons'
import { isMac } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { initialState, resetShortcuts, updateShortcut } from '@renderer/store/shortcuts'
import { Button, Input, InputRef, Table as AntTable } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingGroup, SettingTitle } from '.'

interface ShortcutItem {
  key: string
  name: string
  shortcut: string[]
  enabled: boolean
}

const ShortcutSettings: FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const shortcuts = useAppSelector((state) => state.shortcuts.shortcuts)
  const inputRefs = useRef<Record<string, InputRef>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const handleClear = (record: ShortcutItem) => {
    dispatch(
      updateShortcut({
        ...record,
        shortcut: []
      })
    )
  }

  const handleAddShortcut = (record: ShortcutItem) => {
    setEditingKey(record.key)
    setTimeout(() => {
      inputRefs.current[record.key]?.focus()
    }, 0)
  }

  const isShortcutModified = (record: ShortcutItem) => {
    const defaultShortcut = initialState.shortcuts.find((s) => s.key === record.key)
    return defaultShortcut?.shortcut.join('+') !== record.shortcut.join('+')
  }

  const handleResetShortcut = (record: ShortcutItem) => {
    const defaultShortcut = initialState.shortcuts.find((s) => s.key === record.key)
    if (defaultShortcut) {
      dispatch(
        updateShortcut({
          ...record,
          shortcut: defaultShortcut.shortcut
        })
      )
    }
  }

  const isValidShortcut = (keys: string[]): boolean => {
    const hasModifier = keys.some((key) => ['Control', 'Ctrl', 'Command', 'Alt', 'Shift'].includes(key))
    const hasNonModifier = keys.some((key) => !['Control', 'Ctrl', 'Command', 'Alt', 'Shift'].includes(key))
    return hasModifier && hasNonModifier && keys.length >= 2
  }

  const isDuplicateShortcut = (newShortcut: string[], currentKey: string): boolean => {
    return shortcuts.some(
      (s) => s.key !== currentKey && s.shortcut.length > 0 && s.shortcut.join('+') === newShortcut.join('+')
    )
  }

  const formatShortcut = (shortcut: string[]): string => {
    return shortcut
      .map((key) => {
        switch (key) {
          case 'Control':
            return isMac ? '⌃' : 'Ctrl'
          case 'Ctrl':
            return isMac ? '⌃' : 'Ctrl'
          case 'Command':
            return '⌘'
          case 'Alt':
            return isMac ? '⌥' : 'Alt'
          case 'Shift':
            return isMac ? '⇧' : 'Shift'
          case ' ':
            return 'Space'
          default:
            return key.charAt(0).toUpperCase() + key.slice(1)
        }
      })
      .join(' + ')
  }

  const handleKeyDown = (e: React.KeyboardEvent, record: ShortcutItem) => {
    e.preventDefault()

    const keys: string[] = []
    if (e.ctrlKey) keys.push(isMac ? 'Control' : 'Ctrl')
    if (e.metaKey) keys.push('Command')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')

    const key = e.key
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      keys.push(key.toUpperCase())
    }

    if (!isValidShortcut(keys)) {
      return
    }

    if (isDuplicateShortcut(keys, record.key)) {
      return
    }

    dispatch(
      updateShortcut({
        ...record,
        shortcut: keys
      })
    )
    setEditingKey(null)
  }

  const columns: ColumnsType<ShortcutItem> = [
    {
      title: t('settings.shortcuts.action'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('settings.shortcuts.key'),
      dataIndex: 'shortcut',
      key: 'shortcut',
      align: 'right',
      render: (shortcut: string[], record: ShortcutItem) => {
        const isEditing = editingKey === record.key

        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {isEditing ? (
                <Input
                  ref={(el) => el && (inputRefs.current[record.key] = el)}
                  value={formatShortcut(shortcut)}
                  placeholder={t('settings.shortcuts.press_shortcut')}
                  onKeyDown={(e) => handleKeyDown(e, record)}
                  onBlur={(e) => {
                    const isUndoClick = e.relatedTarget?.closest('.shortcut-undo-icon')
                    if (!isUndoClick) {
                      setEditingKey(null)
                    }
                  }}
                  style={{ width: '120px' }}
                  suffix={
                    isShortcutModified(record) && (
                      <UndoOutlined
                        className="shortcut-undo-icon"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          color: '#999'
                        }}
                        onClick={() => {
                          handleResetShortcut(record)
                          setEditingKey(null)
                        }}
                      />
                    )
                  }
                />
              ) : (
                <div style={{ cursor: 'pointer', padding: '4px 11px' }} onClick={() => handleAddShortcut(record)}>
                  {shortcut.length > 0 ? formatShortcut(shortcut) : t('settings.shortcuts.press_shortcut')}
                </div>
              )}
            </div>
            <Button onClick={() => (shortcut ? handleClear(record) : handleAddShortcut(record))}>
              {shortcut ? t('common.clear') : t('common.add')}
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <SettingContainer theme={theme}>
      <SettingGroup theme={theme} style={{ paddingBottom: 0 }}>
        <SettingTitle>{t('settings.shortcuts.title')}</SettingTitle>
        <SettingDivider style={{ marginBottom: 0 }} />
        <Table
          columns={columns as ColumnsType<unknown>}
          dataSource={shortcuts.map((s) => ({ ...s, name: t(s.name) }))}
          pagination={false}
          size="middle"
          showHeader={false}
        />
        <SettingDivider style={{ marginBottom: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 0' }}>
          <Button onClick={() => dispatch(resetShortcuts())}>{t('settings.shortcuts.reset_defaults')}</Button>
        </div>
      </SettingGroup>
    </SettingContainer>
  )
}

const Table = styled(AntTable)`
  .ant-table {
    background: transparent;
  }

  .ant-table-cell {
    padding: 14px 0 !important;
    background: transparent !important;
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
`

export default ShortcutSettings
