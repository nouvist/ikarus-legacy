import system from "./system.txt?raw";
import retrieve from "./retrieve.txt?raw";
import augment from "./augment.txt?raw";
import cluster from "./cluster.txt?raw";

export default abstract class Prompts {
  static getSystemPropmt() {
    return system;
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
