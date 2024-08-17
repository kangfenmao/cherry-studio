import { TEXT_TO_IMAGES_MODELS } from '@renderer/config/models'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { addPainting, removePainting, updatePainting, updatePaintings } from '@renderer/store/paintings'
import { Painting } from '@renderer/types'
import { uuid } from '@renderer/utils'

export function usePaintings() {
  const paintings = useAppSelector((state) => state.paintings.paintings)
  const dispatch = useAppDispatch()

  return {
    paintings,
    addPainting: () => {
      const newPainting: Painting = {
        id: uuid(),
        urls: [],
        files: [],
        prompt: '',
        negativePrompt: '',
        imageSize: '1024x1024',
        numImages: 1,
        seed: '',
        steps: 25,
        guidanceScale: 4.5,
        model: TEXT_TO_IMAGES_MODELS[0].id
      }
      dispatch(addPainting(newPainting))
      return newPainting
    },
    removePainting: (painting: Painting) => {
      dispatch(removePainting(painting))
    },
    updatePainting: (painting: Painting) => {
      dispatch(updatePainting(painting))
    },
    updatePaintings: (paintings: Painting[]) => {
      dispatch(updatePaintings(paintings))
    }
  }
}
