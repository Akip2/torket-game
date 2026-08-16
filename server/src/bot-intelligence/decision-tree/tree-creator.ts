import Bot from "../../bodies/Bot";
import EndNode from "./EndNode";
import TreeNode from "./TreeNode";

export function createDecisionTree(bot: Bot): TreeNode {
    return new EndNode();
}