import { WEB_DOMAIN, get, getStream, post } from "./request";
import { HeatmapReqType, TemplateType } from "./type";

// export function getMeasureStream(req: any): Promise<ReadableStream> {
//   const uri = `/pipeline/measure`;
//   return getStream(uri, { question: req });
// }

export const getHeatmapURL = `${WEB_DOMAIN}/pipeline/getHeatMap`;

export function getSalientAreas(payload: HeatmapReqType): Promise<any> {
  const uri = `/pipeline/salientArea`;
  return get(uri, payload);
}

export function getDistrictArea(payload: HeatmapReqType): Promise<any> {
  const uri = `/pipeline/districtArea`;
  return get(uri, payload);
}

export function getTreeStep(uid: string): Promise<TemplateType> {
  const uri = `/pipeline/getTreeStep`;
  return get(uri, { uid: uid });
}

export function postSelectCircle(req: any): Promise<any> {
  const uri = `/pipeline/selectCircle`;
  return post(uri, req);
}

export function postReGenerate(req: any): Promise<any> {
  const uri = `/pipeline/reGenerate`;
  return post(uri, req);
}
