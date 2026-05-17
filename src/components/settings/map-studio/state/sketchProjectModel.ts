import type { MapStudioProjectModel } from './mapStudioProjectModel'
import { projectModeLabel, projectModelElementCount } from './mapStudioProjectModel'

export const sketchProjectSubtitle = (model: MapStudioProjectModel) =>
  `${projectModeLabel(model.sourceMode)} · ${model.perimeter.widthM}m x ${model.perimeter.depthM}m · ${projectModelElementCount(model)} elementi · layout attivo protetto`
