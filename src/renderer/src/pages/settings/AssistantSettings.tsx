import { QuestionCircleOutlined } from '@ant-design/icons'
import { DEFAULT_CONEXTCOUNT, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { Button, Col, Input, InputNumber, Row, Slider, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { debounce } from 'lodash'
import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingSubtitle, SettingTitle } from './components'

const AssistantSettings: FC = () => {
  const { defaultAssistant, updateDefaultAssistant } = useDefaultAssistant()
  const [temperature, setTemperature] = useState(defaultAssistant.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [contextCount, setConextCount] = useState(defaultAssistant.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)

  const { t } = useTranslation()

  const onUpdateAssistantSettings = useCallback(
    debounce(
      ({ _temperature, _contextCount }: { _temperature?: number; _contextCount?: number }) => {
        updateDefaultAssistant({
          ...defaultAssistant,
          settings: {
            ...defaultAssistant.settings,
            temperature: _temperature ?? temperature,
            contextCount: _contextCount ?? contextCount
          }
        })
      },
      1000,
      { leading: false, trailing: true }
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
    updateDefaultAssistant({
      ...defaultAssistant,
      settings: {
        ...defaultAssistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        contextCount: DEFAULT_CONEXTCOUNT
      }
    })
  }

  return (
    <SettingContainer>
      <SettingTitle>{t('settings.assistant.title')}</SettingTitle>
      <SettingDivider />
      <SettingSubtitle style={{ marginTop: 0 }}>{t('common.name')}</SettingSubtitle>
      <Input
        placeholder={t('common.assistant') + t('common.name')}
        value={defaultAssistant.name}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, name: e.target.value })}
      />
      <SettingSubtitle>{t('common.prompt')}</SettingSubtitle>
      <TextArea
        rows={4}
        placeholder={t('common.assistant') + t('common.prompt')}
        value={defaultAssistant.prompt}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, prompt: e.target.value })}
      />
      <SettingDivider />
      <SettingSubtitle style={{ marginTop: 0 }}>{t('settings.assistant.model_params')}</SettingSubtitle>
      <Row align="middle">
        <Label>{t('assistant.settings.temperature')}</Label>
        <Tooltip title={t('assistant.settings.temperature.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={22}>
          <Slider
            min={0}
            max={1.2}
            onChange={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            marks={{ 0: '0', 0.7: '0.7', 1: '1', 1.2: '1.2' }}
            step={0.1}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={1.2}
            step={0.1}
            value={temperature}
            onChange={onTemperatureChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('assistant.settings.conext_count')}</Label>
        <Tooltip title={t('assistant.settings.conext_count.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={22}>
          <Slider
            min={0}
            max={20}
            marks={{ 0: '0', 5: '5', 10: '10', 15: '15', 20: t('assistant.settings.max') }}
            onChange={onConextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            step={1}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={20}
            step={1}
            value={contextCount}
            onChange={onConextCountChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Button onClick={onReset} style={{ width: 100 }}>
        {t('assistant.settings.reset')}
      </Button>
    </SettingContainer>
  )
}

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
