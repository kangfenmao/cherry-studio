import AiAssistantAppLogo from '@renderer/assets/images/apps/360-ai.png'
import AiSearchAppLogo from '@renderer/assets/images/apps/ai-search.png'
import BaiduAiAppLogo from '@renderer/assets/images/apps/baidu-ai.png'
import DevvAppLogo from '@renderer/assets/images/apps/devv.png'
import MetasoAppLogo from '@renderer/assets/images/apps/metaso.webp'
import PerplexityAppLogo from '@renderer/assets/images/apps/perplexity.webp'
import PoeAppLogo from '@renderer/assets/images/apps/poe.webp'
import SensetimeAppLogo from '@renderer/assets/images/apps/sensetime.png'
import SparkDeskAppLogo from '@renderer/assets/images/apps/sparkdesk.png'
import TiangongAiLogo from '@renderer/assets/images/apps/tiangong.png'
import TencentYuanbaoAppLogo from '@renderer/assets/images/apps/yuanbao.png'
import ZhihuAppLogo from '@renderer/assets/images/apps/zhihu.png'
import MinApp from '@renderer/components/MinApp'
import { PROVIDER_CONFIG } from '@renderer/config/provider'
import { MinAppType } from '@renderer/types'

const _apps: MinAppType[] = [
  {
    id: '360-ai-so',
    name: '360AI搜索',
    logo: AiSearchAppLogo,
    url: 'https://so.360.com/'
  },
  {
    id: '360-ai-bot',
    name: 'AI 助手',
    logo: AiAssistantAppLogo,
    url: 'https://bot.360.com/'
  },
  {
    id: 'baidu-ai-chat',
    name: '文心一言',
    logo: BaiduAiAppLogo,
    url: 'https://yiyan.baidu.com/'
  },
  {
    id: 'tencent-yuanbao',
    name: '腾讯元宝',
    logo: TencentYuanbaoAppLogo,
    url: 'https://yuanbao.tencent.com/chat'
  },
  {
    id: 'sensetime-chat',
    name: '商量',
    logo: SensetimeAppLogo,
    url: 'https://chat.sensetime.com/wb/chat'
  },
  {
    id: 'spark-desk',
    name: 'SparkDesk',
    logo: SparkDeskAppLogo,
    url: 'https://xinghuo.xfyun.cn/desk'
  },
  {
    id: 'metaso',
    name: '秘塔AI搜索',
    logo: MetasoAppLogo,
    url: 'https://metaso.cn/'
  },
  {
    id: 'poe',
    name: 'Poe',
    logo: PoeAppLogo,
    url: 'https://poe.com'
  },
  {
    id: 'perplexity',
    name: 'perplexity',
    logo: PerplexityAppLogo,
    url: 'https://www.perplexity.ai/'
  },
  {
    id: 'devv',
    name: 'DEVV_',
    logo: DevvAppLogo,
    url: 'https://devv.ai/'
  },
  {
    id: 'tiangong-ai',
    name: '天工AI',
    logo: TiangongAiLogo,
    url: 'https://www.tiangong.cn/'
  },
  {
    id: 'zhihu-zhiada',
    name: '知乎直答',
    logo: ZhihuAppLogo,
    url: 'https://zhida.zhihu.com/'
  }
]

export function getAllMinApps() {
  const list: MinAppType[] = (Object.entries(PROVIDER_CONFIG) as any[])
    .filter(([, config]) => config.app)
    .map(([key, config]) => ({ id: key, ...config.app }))
    .concat(_apps)
  return list
}

export function startMinAppById(id: string) {
  const app = getAllMinApps().find((app) => app?.id === id)
  app && MinApp.start(app)
}
