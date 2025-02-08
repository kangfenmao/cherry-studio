export const EMBEDDING_MODELS = [
  {
    id: 'BAAI/bge-m3',
    max_context: 8000
  },
  {
    id: 'Pro/BAAI/bge-m3',
    max_context: 8000
  },
  {
    id: 'BAAI/bge-large-zh-v1.5',
    max_context: 512
  },
  {
    id: 'BAAI/bge-large-en-v1.5',
    max_context: 512
  },
  {
    id: 'netease-youdao/bce-embedding-base_v1',
    max_context: 512
  },
  {
    id: 'tao-8k',
    max_context: 8192
  },
  {
    id: 'embedding-v1',
    max_context: 384
  },
  {
    id: 'bge-large-zh',
    max_context: 512
  },
  {
    id: 'bge-large-en',
    max_context: 512
  }
]

export function getEmbeddingMaxContext(id: string) {
  const model = EMBEDDING_MODELS.find((m) => m.id === id)

  if (model) {
    return model.max_context
  }

  if (id.includes('bge-large')) {
    return 512
  }

  if (id.includes('bge-m3')) {
    return 8000
  }

  return undefined
}
