import { UrlDatetimePipe } from "../pipes/url-datetime.pipe";
import { BlockJson } from "./block.interface";
import { Block } from "./block.model";
import { mapToOpionalDate } from "./helper.mapper";

export function mapToBlock(block: BlockJson): Block {
  return {
    id: block.block_id,
    text: block.text,
    project: block.project,
    projectName: block.project_name,
    start: new Date(block.start),
    end: mapToOpionalDate(block.end),
    duration: block.duration,
    tags: block.tags,
  };
}

export function mapToBlocks(jsonArray: BlockJson[]): Block[] {
  return jsonArray.map(mapToBlock);
}

export function mapToBlockJson(block: Block): BlockJson {
  const toUrlDate = new UrlDatetimePipe();
  return {
    block_id: block.id,
    text: block.text,
    project: block.project,
    project_name: block.projectName,
    start: toUrlDate.transform(block.start),
    end: toOptionalUrlDate(block.end),
    duration: block.duration,
    tags: block.tags,
  };
}

function toOptionalUrlDate(date: Date | undefined) {
  if (date) {
    const toUrlDate = new UrlDatetimePipe();
    return toUrlDate.transform(date);
  }
  return undefined;
}
