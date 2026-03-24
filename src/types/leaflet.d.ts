declare module 'leaflet' {
  const L: any;
  export default L;
  export function map(element: HTMLElement, options?: any): any;
  export function tileLayer(urlTemplate: string, options?: any): any;
  export function marker(latlng: [number, number], options?: any): any;
  export function layerGroup(layers?: any[]): any;
  export function icon(options: any): any;
  export function divIcon(options: any): any;
  export const Marker: any;
}
