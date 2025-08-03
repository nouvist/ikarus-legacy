import systemLong from "./system_long.txt?raw";
import systemShort from "./system_short.txt?raw";
import retrieve from "./retrieve.txt?raw";
import augment from "./augment.txt?raw";
import cluster from "./cluster.txt?raw";

export default abstract class Prompts {
  static getSystemPropmt(short = false) {
    return short ? systemShort : systemLong;
  }

  static getClusterPrompt() {
    return cluster;
  }

  static getRetrievePrompt() {
    return retrieve;
  }

  static getAugmentPrompt() {
    return augment;
  }
}
