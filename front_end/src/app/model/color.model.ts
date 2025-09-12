export type Color = {
  id: number;
  hexValue: string;
};

export interface ColorJson {
  color_id: number;
  hex_value: string;
}

export function mapToColor(color: ColorJson): Color {
  return {
    id: color.color_id,
    hexValue: color.hex_value,
  };
}

export function mapToColors(jsonArray: ColorJson[]): Color[] {
  return jsonArray.map(mapToColor);
}
