import { Collapse } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

const LanguageModelsSettings: FC = () => {
  return (
    <Container>
      <Collapse style={{ width: '100%', marginBottom: 10 }}>
        <Collapse.Panel header="OpenAI" key="openai">
          <p>OpenAI</p>
        </Collapse.Panel>
      </Collapse>
      <Collapse style={{ width: '100%', marginBottom: 10 }}>
        <Collapse.Panel header="Silicon" key="silicon">
          <p>Silicon</p>
        </Collapse.Panel>
      </Collapse>
      <Collapse style={{ width: '100%', marginBottom: 10 }}>
        <Collapse.Panel header="deepseek" key="deepseek">
          <p>deepseek</p>
        </Collapse.Panel>
      </Collapse>
      <Collapse style={{ width: '100%', marginBottom: 10 }}>
        <Collapse.Panel header="Groq" key="groq">
          <p>Groq</p>
        </Collapse.Panel>
      </Collapse>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

export default LanguageModelsSettings
