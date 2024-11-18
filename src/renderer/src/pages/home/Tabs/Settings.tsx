import { CheckOutlined } from '@ant-design/icons'
import Scrollbar from '@renderer/components/Scrollbar'
import { codeThemes } from '@renderer/context/SyntaxHighlighterProvider'
import { useSettings } from '@renderer/hooks/useSettings'
import { SettingDivider, SettingRow, SettingRowTitle, SettingSubtitle } from '@renderer/pages/settings'
import { useAppDispatch } from '@renderer/store'
import {
  setClickAssistantToShowTopic,
  setCodeCollapsible,
  setCodeShowLineNumbers,
  setCodeStyle,
  setFontSize,
  setMathEngine,
  setMessageFont,
  setMessageStyle,
  setPasteLongTextAsFile,
  setRenderInputMessageAsMarkdown,
  setShowInputEstimatedTokens,
  setShowMessageDivider,
  setShowTopicTime
} from '@renderer/store/settings'
import { Col, Row, Select, Slider, Switch } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const SettingsTab: FC = () => {
  const { messageStyle, codeStyle, fontSize } = useSettings()
  const [fontSizeValue, setFontSizeValue] = useState(fontSize)
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const {
    showMessageDivider,
    messageFont,
    showInputEstimatedTokens,
    sendMessageShortcut,
    setSendMessageShortcut,
    pasteLongTextAsFile,
    renderInputMessageAsMarkdown,
    codeShowLineNumbers,
    codeCollapsible,
    mathEngine,
    topicPosition,
    showTopicTime,
    clickAssistantToShowTopic,
    setTopicPosition
  } = useSettings()

  useEffect(() => {
    setFontSizeValue(fontSize)
  }, [fontSize])

  return (
    <Container>
      <SettingSubtitle>{t('settings.messages.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.divider')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={showMessageDivider}
          onChange={(checked) => dispatch(setShowMessageDivider(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.use_serif_font')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={messageFont === 'serif'}
          onChange={(checked) => dispatch(setMessageFont(checked ? 'serif' : 'system'))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('chat.settings.show_line_numbers')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={codeShowLineNumbers}
          onChange={(checked) => dispatch(setCodeShowLineNumbers(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('chat.settings.code_collapsible')}</SettingRowTitleSmall>
        <Switch size="small" checked={codeCollapsible} onChange={(checked) => dispatch(setCodeCollapsible(checked))} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('message.message.style')}</SettingRowTitleSmall>
        <Select
          value={messageStyle}
          onChange={(value) => dispatch(setMessageStyle(value))}
          style={{ width: 135 }}
          size="small">
          <Select.Option value="plain">{t('message.message.style.plain')}</Select.Option>
          <Select.Option value="bubble">{t('message.message.style.bubble')}</Select.Option>
        </Select>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('message.message.code_style')}</SettingRowTitleSmall>
        <Select
          value={codeStyle}
          onChange={(value) => dispatch(setCodeStyle(value))}
          style={{ width: 135 }}
          size="small">
          {codeThemes.map((theme) => (
            <Select.Option key={theme} value={theme}>
              {theme}
            </Select.Option>
          ))}
        </Select>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.math_engine')}</SettingRowTitleSmall>
        <Select
          value={mathEngine}
          onChange={(value) => dispatch(setMathEngine(value))}
          style={{ width: 135 }}
          size="small">
          <Select.Option value="KaTeX">KaTeX</Select.Option>
          <Select.Option value="MathJax">MathJax</Select.Option>
        </Select>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.font_size.title')}</SettingRowTitleSmall>
      </SettingRow>
      <Row align="middle" gutter={10}>
        <Col span={24}>
          <Slider
            value={fontSizeValue}
            onChange={(value) => setFontSizeValue(value)}
            onChangeComplete={(value) => dispatch(setFontSize(value))}
            min={12}
            max={22}
            step={1}
            marks={{
              12: <span style={{ fontSize: '12px' }}>A</span>,
              14: <span style={{ fontSize: '14px' }}>{t('common.default')}</span>,
              22: <span style={{ fontSize: '18px' }}>A</span>
            }}
          />
        </Col>
      </Row>
      <SettingSubtitle>{t('settings.messages.input.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.show_estimated_tokens')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={showInputEstimatedTokens}
          onChange={(checked) => dispatch(setShowInputEstimatedTokens(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.paste_long_text_as_file')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={pasteLongTextAsFile}
          onChange={(checked) => dispatch(setPasteLongTextAsFile(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.markdown_rendering_input_message')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={renderInputMessageAsMarkdown}
          onChange={(checked) => dispatch(setRenderInputMessageAsMarkdown(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.send_shortcuts')}</SettingRowTitleSmall>
        <Select
          size="small"
          value={sendMessageShortcut}
          menuItemSelectedIcon={<CheckOutlined />}
          options={[
            { value: 'Enter', label: 'Enter' },
            { value: 'Shift+Enter', label: `Shift + Enter` }
          ]}
          onChange={(value) => setSendMessageShortcut(value)}
          style={{ width: 135 }}
        />
      </SettingRow>
      <SettingDivider />
      <SettingSubtitle>{t('settings.display.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>{t('settings.topic.position')}</SettingRowTitle>
        <Select
          defaultValue={topicPosition || 'right'}
          style={{ width: 135 }}
          onChange={setTopicPosition}
          size="small"
          options={[
            { value: 'left', label: t('settings.topic.position.left') },
            { value: 'right', label: t('settings.topic.position.right') }
          ]}
        />
      </SettingRow>
      <SettingDivider />
      {topicPosition === 'left' && (
        <>
          <SettingRow>
            <SettingRowTitle>{t('settings.advanced.auto_switch_to_topics')}</SettingRowTitle>
            <Switch
              size="small"
              checked={clickAssistantToShowTopic}
              onChange={(checked) => dispatch(setClickAssistantToShowTopic(checked))}
            />
          </SettingRow>
          <SettingDivider />
        </>
      )}
      <SettingRow>
        <SettingRowTitle>{t('settings.topic.show.time')}</SettingRowTitle>
        <Switch size="small" checked={showTopicTime} onChange={(checked) => dispatch(setShowTopicTime(checked))} />
      </SettingRow>
      <SettingDivider />
    </Container>
  )
}

const Container = styled(Scrollbar)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-bottom: 10px;
  padding: 10px 15px;
  margin-bottom: 10px;
  padding-top: 0;
`

const SettingRowTitleSmall = styled(SettingRowTitle)`
  font-size: 13px;
`

export default SettingsTab
