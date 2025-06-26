import Chat from "./ui";
export * from "./ui";
import ChatManaged from "./managed";
export * from "./managed";
export * from "./controller";

export default Object.assign(ChatManaged, {
  Raw: Chat,
});
