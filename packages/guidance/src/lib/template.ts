import Trie from "./_trie";
import { AbstractTokenizer } from "./tokenizer";
import { AbstractTokenGenerator } from "./token-generator";
import templateParser from "./templateParser";

export enum TEMPLATE_METHODS {
  SEL = "SEL", // select for a group of options
  GEN = "GEN", // generation of a string
}

export class TemplateProcessor {
  private tokenizer: AbstractTokenizer;
  private generator: AbstractTokenGenerator;

  constructor(tokenizer: AbstractTokenizer, generator: AbstractTokenGenerator) {
    this.tokenizer = tokenizer;
    this.generator = generator;
  }

  public setTokenizer(tokenizer: AbstractTokenizer) {
    this.tokenizer = tokenizer;
  }

  public setGenerator(generator: AbstractTokenGenerator) {
    this.generator = generator;
  }

  public async processTemplate(
    template: string,
    variables: Map<string, string | string[]>
  ): Promise<Map<string, string>> {
    let finalResult = new Map<string, string>();
    for await (const partialResult of this.processTemplateStream(
      template,
      variables
    )) {
      finalResult = partialResult;
    }

    return finalResult;
  }

  public async *processTemplateStream(
    template: string,
    variables: Map<string, string | string[]>
  ): AsyncGenerator<Map<string, string>, void> {
    const result = new Map<string, string>();

    // Replace {{val}} in template with variables[val]
    variables.forEach((value, key) => {
      template = template.replace(
        new RegExp(`{{${key}}}`, "g"),
        value.toString()
      );
    });

    // Replace {{method variableName methodArg1=methodArg1Value methodArg2=methodArg2Value}} in template
    const indexes = [
      ...this.findAllIndexes(template, "{{GEN"),
      ...this.findAllIndexes(template, "{{SEL"),
    ].sort((a, b) => a - b);
    let nextTemplateIndexForPrompt = 0;
    let prompt = "";
    for (let i = 0; i < indexes.length; i++) {
      prompt += template.substring(nextTemplateIndexForPrompt, indexes[i]);

      const start = indexes[i];
      const end = template.substring(start).indexOf("}}") + 2 + start;
      const content = template.substring(start, end);
      const {
        type: method,
        name: variableName,
        params: methodArgs,
      } = templateParser(content);
      let completion = "";

      switch (method) {
        case TEMPLATE_METHODS.GEN:
          const stream = this.generator.generateString(prompt, methodArgs);
          for await (const chunk of stream) {
            completion = chunk;
            result.set(variableName, completion);
            yield result;
          }
          break;

        case TEMPLATE_METHODS.SEL:
          const trie = new Trie();

          // Get options from variables
          const options = variables.get(
            String(methodArgs["options"])
          ) as string[];
          if (!options) {
            throw new Error(`${methodArgs["options"]} variable not found`);
          }

          // Add all options to trie
          options.forEach((option) => {
            const prefix = this.tokenizer.encodeString(
              prompt + option + this.tokenizer.getEOS()
            );
            trie.addPrefix(prefix);
          });

          let currentPrefixPrompt = prompt;
          do {
            const currentPrefix = trie.getNextPrefix(
              this.tokenizer.encodeString(currentPrefixPrompt)
            );
            currentPrefixPrompt = this.tokenizer.decodeString(currentPrefix);
            const nextChildren = trie.getNextChildren(currentPrefix);
            if (nextChildren.length < 2) {
              // If there is only one child, we complete
              completion = this.tokenizer
                .decodeString(trie.getWord(currentPrefix))
                .substring(prompt.length)
                .replace(this.tokenizer.getEOS(), "");
              break;
            } else {
              // If there is more than one child, we generate the next token
              const nextToken = await this.generator.generateToken(
                prompt,
                nextChildren.reduce((acc, child) => {
                  acc[child.toString()] = 100;
                  return acc;
                }, {} as Record<string, number>)
              );
              currentPrefixPrompt = currentPrefixPrompt + nextToken;
            }
          } while (!completion);

          result.set(variableName, completion);
          yield result;
          break;
        default:
          throw new Error(`Invalid method ${method} in template`);
      }
      prompt += completion;
      nextTemplateIndexForPrompt = end + 2;
    }
  }

  private findAllIndexes(str: string, substr: string): number[] {
    const indexes: number[] = [];
    let i = -1;
    while ((i = str.indexOf(substr, i + 1)) >= 0) {
      indexes.push(i);
    }
    return indexes;
  }
}
