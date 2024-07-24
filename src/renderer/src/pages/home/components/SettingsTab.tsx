import { Assistant } from '@renderer/types'
import styled from 'styled-components'
import { DEFAULT_CONEXTCOUNT, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { Button, Col, InputNumber, Row, Slider, Switch, Tooltip } from 'antd'
import { debounce } from 'lodash'
import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { SettingDivider, SettingRow, SettingRowTitle, SettingSubtitle } from '@renderer/pages/settings/components'
import { useSettings } from '@renderer/hooks/useSettings'
import { useAppDispatch } from '@renderer/store'
import { setMessageFont, setShowInputEstimatedTokens, setShowMessageDivider } from '@renderer/store/settings'

interface Props {
  assistant: Assistant
}

const SettingsTab: FC<Props> = (props) => {
  const { assistant, updateAssistantSettings, updateAssistant } = useAssistant(props.assistant.id)
  const [temperature, setTemperature] = useState(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [contextCount, setConextCount] = useState(assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const { showMessageDivider, messageFont, showInputEstimatedTokens } = useSettings()

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
      <SettingSubtitle>{t('settings.messages.model.title')}</SettingSubtitle>
      <SettingDivider />
      <Row align="middle">
        <Label>{t('assistant.settings.conext_count')}</Label>
        <Tooltip title={t('assistant.settings.temperature.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={10}>
        <Col span={18}>
          <Slider
            min={0}
            max={1.2}
            onChange={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            marks={{ 0: '0', 0.7: '0.7', 1.2: '1.2' }}
            step={0.1}
          />
        </Col>
        <Col span={6}>
          <InputNumberic
            min={0}
            max={1.2}
            step={0.1}
            value={temperature}
            onChange={onTemperatureChange}
            controls={false}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('assistant.settings.conext_count')}</Label>
        <Tooltip title={t('assistant.settings.conext_count.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={10}>
        <Col span={18}>
          <Slider
            min={0}
            max={20}
            marks={{ 0: '0', 10: '10', 20: t('assistant.settings.max') }}
            onChange={onConextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            step={1}
          />
        </Col>
        <Col span={6}>
          <InputNumberic
            min={0}
            max={20}
            step={1}
            value={contextCount}
            onChange={onConextCountChange}
            controls={false}
          />
        </Col>
      </Row>
      <Button onClick={onReset} style={{ width: '100%' }}>
        {t('assistant.settings.reset')}
      </Button>
      <SettingSubtitle>{t('settings.messages.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.divider')}</SettingRowTitleSmall>
        <Switch checked={showMessageDivider} onChange={(checked) => dispatch(setShowMessageDivider(checked))} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.use_serif_font')}</SettingRowTitleSmall>
        <Switch
          checked={messageFont === 'serif'}
          onChange={(checked) => dispatch(setMessageFont(checked ? 'serif' : 'system'))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingSubtitle style={{ marginTop: 20 }}>{t('settings.messages.input.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.show_estimated_tokens')}</SettingRowTitleSmall>
        <Switch
          checked={showInputEstimatedTokens}
          onChange={(checked) => dispatch(setShowInputEstimatedTokens(checked))}
        />
      </SettingRow>
      <SettingDivider />
    </Container>
  )
}

const Container = styled.div`
  padding: 0 15px;
`

const InputNumberic = styled(InputNumber)`
  width: 45px;
  padding: 0;
  margin-left: 5px;
  text-align: center;
  .ant-input-number-input {
    text-align: center;
  }
`

const Label = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-3);
`

const SettingRowTitleSmall = styled(SettingRowTitle)`
  font-size: 13px;
`

export default SettingsTab
