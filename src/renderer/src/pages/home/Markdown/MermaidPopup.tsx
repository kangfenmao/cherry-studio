import { TopView } from '@renderer/components/TopView'
import { download } from '@renderer/utils/download'
import { Button, Modal, Space, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ShowParams {
  chart: string
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ resolve, chart }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  const handleDownload = async (format: 'svg' | 'png') => {
    try {
      const element = document.querySelector('.mermaid')
      if (!element) return

      const timestamp = Date.now()

      if (format === 'svg') {
        const svgElement = element.querySelector('svg')
        if (!svgElement) return
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        download(url, `mermaid-diagram-${timestamp}.svg`)
        URL.revokeObjectURL(url)
      } else if (format === 'png') {
        const svgElement = element.querySelector('svg')
        if (!svgElement) return

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || []
        const width = viewBox[2] || svgElement.clientWidth || svgElement.getBoundingClientRect().width
        const height = viewBox[3] || svgElement.clientHeight || svgElement.getBoundingClientRect().height

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          const scale = 3
          canvas.width = width * scale
          canvas.height = height * scale

          if (ctx) {
            ctx.scale(scale, scale)
            ctx.drawImage(img, 0, 0, width, height)
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob)
              download(pngUrl, `mermaid-diagram-${timestamp}.png`)
              URL.revokeObjectURL(pngUrl)
            }
          }, 'image/png')
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  useEffect(() => {
    window?.mermaid?.contentLoaded()
  }, [])

  return (
    <Modal
      title={t('mermaid.title')}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      afterClose={onClose}
      width={1000}
      footer={[
        <Space key="download-buttons">
          <Button onClick={() => handleDownload('svg')}>{t('mermaid.download.svg')}</Button>
          <Button onClick={() => handleDownload('png')}>{t('mermaid.download.png')}</Button>
        </Space>
      ]}>
      <Tabs
        items={[
          {
            key: 'preview',
            label: t('mermaid.tabs.preview'),
            children: (
              <div
                className="mermaid"
                style={{
                  maxHeight: 'calc(80vh - 200px)',
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                {chart}
              </div>
            )
          },
          {
            key: 'source',
            label: t('mermaid.tabs.source'),
            children: (
              <pre
                style={{
                  maxHeight: 'calc(80vh - 200px)',
                  overflowY: 'auto',
                  padding: '16px'
                }}>
                {chart}
              </pre>
            )
          }
        ]}
      />
    </Modal>
  )
}

export default class MermaidPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('MermaidPopup')
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'MermaidPopup'
      )
    })
  }
}
