import { Model, models } from "../data/models";
import { Voice, voiceServicesColorMap, voices } from "../data/voices";

import { Tag } from "@mikugg/ui-kit";

import "./ModelTag.scss";

export type Colors =
  | "#FF0000"
  | "#4BBA2D"
  | "#2F80ED"
  | "#FF4E67"
  | "#9747FF"
  | "#56CCF2"
  | "#828282";
export type ValidServices = Voice | Model;
export interface ModelTagProps {
  modelName: ValidServices;
}

const ModelTag = ({ modelName }: ModelTagProps) => {
  const backgroundColor: Colors =
    voiceServicesColorMap.get(voices[modelName]?.service) ||
    models[modelName]?.color;

  const tagText: string = voices[modelName]?.label || models[modelName]?.label;

  return (
    <Tag
      isSquircle
      text={tagText}
      backgroundColor={backgroundColor}
      className="modelTag"
    />
  );
};
export default ModelTag;
