import { QuestionCircleOutlined } from '@ant-design/icons'
import { DEFAULT_CONEXTCOUNT, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { Assistant } from '@renderer/types'
import { Button, Col, InputNumber, Popover, Row, Slider, Tooltip } from 'antd'
import { debounce } from 'lodash'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
}

const PopoverContent: FC<Props> = (props) => {
  const { assistant, updateAssistantSettings, updateAssistant } = useAssistant(props.assistant.id)
  const [temperature, setTemperature] = useState(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [contextCount, setConextCount] = useState(assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
  const { t } = useTranslation()

  const onUpdateAssistantSettings = useCallback(
    debounce(
      ({ _temperature, _contextCount }: { _temperature?: number; _contextCount?: number }) => {
        updateAssistantSettings({
          ...assistant.settings,
          temperature: _temperature ?? temperature,
          contextCount: _contextCount ?? contextCount
        })
      },
      1000,
      {
        leading: false,
        trailing: true
      }
    ),
    []
  )

  const onTemperatureChange = (value) => {
    if (!isNaN(value as number)) {
      setTemperature(value)
      onUpdateAssistantSettings({ _temperature: value })
    }
  }

  const onConextCountChange = (value) => {
    if (!isNaN(value as number)) {
      setConextCount(value)
      onUpdateAssistantSettings({ _contextCount: value })
    }
  }

  const onReset = () => {
    setTemperature(DEFAULT_TEMPERATURE)
    setConextCount(DEFAULT_CONEXTCOUNT)
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        contextCount: DEFAULT_CONEXTCOUNT
      }
    })
  }

  useEffect(() => {
    setTemperature(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
    setConextCount(assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
  }, [assistant])

  return (
    <Container>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={6}>
          <Row align="middle" justify="end">
            <Label>{t('assistant.settings.temperature')}</Label>
            <Tooltip title={t('assistant.settings.temperature.tip')}>
              <QuestionIcon />
            </Tooltip>
          </Row>
        </Col>
        <Col span={14}>
          <Slider
            min={0}
            max={1.2}
            onChange={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            marks={{ 0: '0', 0.7: '0.7', 1: '1', 1.2: '1.2' }}
            step={0.1}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            min={0}
            max={1.2}
            style={{ width: 50, marginLeft: 5, textAlign: 'center' }}
            step={0.1}
            value={temperature}
            onChange={onTemperatureChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={6}>
          <Row align="middle" justify="end">
            <Label>{t('assistant.settings.conext_count')}</Label>
            <Tooltip title={t('assistant.settings.conext_count.tip')}>
              <QuestionIcon />
            </Tooltip>
          </Row>
        </Col>
        <Col span={14}>
          <Slider
            min={0}
            max={20}
            marks={{ 0: '0', 5: '5', 10: '10', 15: '15', 20: t('assistant.settings.max') }}
            onChange={onConextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            step={1}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            min={0}
            max={20}
            style={{ width: 50, marginLeft: 5, textAlign: 'center' }}
            step={1}
            value={contextCount}
            onChange={onConextCountChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row justify="center">
        <Button onClick={onReset}>{t('assistant.settings.reset')}</Button>
      </Row>
    </Container>
  )
}

const AssistantSettings: FC<Props & PropsWithChildren> = ({ children, assistant }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Popover content={<PopoverContent assistant={assistant} />} trigger="click" onOpenChange={setOpen}>
      {open ? (
        children
      ) : (
        <Tooltip placement="top" title={t('assistant.input.settings')} arrow>
          {children}
        </Tooltip>
      )}
    </Popover>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  width: 420px;
  padding: 5px;
`

const Label = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text-3);
`

export default AssistantSettings
