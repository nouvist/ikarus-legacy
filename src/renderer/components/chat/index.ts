import Chat from "./view/raw";
import ChatManaged from "./view/managed";

export * from "./controller";
export * from "./controller/structs";
export * from "./view/raw";
export * from "./view/managed";

export default Object.assign(ChatManaged, {
  Raw: Chat,
});
