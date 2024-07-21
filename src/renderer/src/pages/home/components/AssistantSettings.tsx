import { QuestionCircleOutlined } from '@ant-design/icons'
import { DEFAULT_CONEXTCOUNT, DEFAULT_MAXTOKENS, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { Assistant } from '@renderer/types'
import { Button, Col, InputNumber, Popover, Row, Slider, Tooltip } from 'antd'
import { FC, PropsWithChildren, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
}

const PopoverContent: FC<Props> = ({ assistant }) => {
  const { updateAssistant } = useAssistants()
  const [temperature, setTemperature] = useState(assistant.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [maxTokens, setMaxTokens] = useState(assistant.settings?.maxTokens ?? DEFAULT_MAXTOKENS)
  const [contextCount, setConextCount] = useState(assistant.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
  const { t } = useTranslation()

  const onUpdateAssistantSettings = ({
    _temperature,
    _maxTokens,
    _contextCount
  }: {
    _temperature?: number
    _maxTokens?: number
    _contextCount?: number
  }) => {
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        temperature: _temperature ?? temperature,
        maxTokens: _maxTokens ?? maxTokens,
        contextCount: _contextCount ?? contextCount
      }
    })
  }

  const onTemperatureChange = (value) => {
    if (!isNaN(value as number)) {
      setTemperature(value)
      onUpdateAssistantSettings({ _temperature: value })
    }
  }

  const onMaxTokensChange = (value) => {
    if (!isNaN(value as number)) {
      setMaxTokens(value)
      onUpdateAssistantSettings({ _maxTokens: value })
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
    setMaxTokens(DEFAULT_MAXTOKENS)
    setConextCount(DEFAULT_CONEXTCOUNT)
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        maxTokens: DEFAULT_MAXTOKENS,
        contextCount: DEFAULT_CONEXTCOUNT
      }
    })
  }

  return (
    <Container>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={5}>
          <Row align="middle">
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
        <Col span={4}>
          <InputNumber
            min={0}
            max={1.2}
            style={{ width: 70, marginLeft: 5, textAlign: 'center' }}
            step={0.1}
            value={temperature}
            onChange={onTemperatureChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={5}>
          <Row align="middle">
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
        <Col span={4}>
          <InputNumber
            min={0}
            max={20}
            style={{ width: 70, marginLeft: 5, textAlign: 'center' }}
            step={1}
            value={contextCount}
            onChange={onConextCountChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row align="middle" gutter={20}>
        <Col span={5}>
          <Row align="middle">
            <Label>{t('assistant.settings.max_tokens')}</Label>
            <Tooltip title={t('assistant.settings.max_tokens.tip')}>
              <QuestionIcon />
            </Tooltip>
          </Row>
        </Col>
        <Col span={14}>
          <Slider
            min={0}
            max={5000}
            onChange={onMaxTokensChange}
            value={typeof maxTokens === 'number' ? maxTokens : 0}
            marks={{ 0: '0', 800: '800', 2000: '2000', 3600: '3600', 5000: t('assistant.settings.max') }}
            step={64}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={5000}
            style={{ width: 70, marginLeft: 5, textAlign: 'center' }}
            step={64}
            value={maxTokens}
            onChange={onMaxTokensChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 10 }}>
        <Button onClick={onReset} style={{ marginRight: 10 }}>
          {t('assistant.settings.reset')}
        </Button>
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
  width: 500px;
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
