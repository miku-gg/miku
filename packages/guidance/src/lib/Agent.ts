function replaceTemplate(template: string, key: string, value: string): string {
  let regex = new RegExp(`{{GEN ${key}[^}]*}}`, 'g');
  template = template.replace(regex, value);
  regex = new RegExp(`{{SEL ${key}[^}]*}}`, 'g');
  return template.replace(regex, value);
}

export interface AgentPromptConfiguration<
  // extends type array of constant strings
  AgentInputs extends string[],
  AgentOutputs extends string[],
> {
  instruction: string;
  description: string;
  shotTemplate: {
    input: string;
    output: string;
  };
  shots: {
    inputs: Record<AgentInputs[number], string>;
    outputs: Record<AgentOutputs[number], string>;
  }[];
  instructSettings?: {
    system?: string;
    instruction?: string;
    input?: string;
    output?: string;
  };
}

export class AgentPrompt<AgentInputs extends string[], AgentOutputs extends string[]> {
  private configuration: AgentPromptConfiguration<AgentInputs, AgentOutputs> & {
    instructSettings: {
      system: string;
      instruction: string;
      input: string;
      output: string;
    };
  };

  constructor(configuration: AgentPromptConfiguration<AgentInputs, AgentOutputs>) {
    this.configuration = {
      ...configuration,
      instructSettings: {
        system: '',
        instruction: '\n### Instruction:\n',
        input: '\n### Input:\n',
        output: '\n### Response:\n',
        ...configuration.instructSettings,
      },
    };
  }

  public generatePrompt(inputs: Record<AgentInputs[number], string>): string {
    let prompt = this.configuration.instructSettings.system;
    prompt += this.configuration.description;
    prompt += this.configuration.instructSettings.instruction;
    prompt += this.configuration.instruction;
    this.configuration.shots.forEach((shot) => {
      prompt += this.configuration.instructSettings.input;
      prompt += this.configuration.shotTemplate.input;
      Object.keys(shot.inputs).forEach((key: AgentInputs[number]) => {
        const value = shot.inputs[key];
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });
      prompt += this.configuration.instructSettings.output;
      prompt += this.configuration.shotTemplate.output;
      Object.keys(shot.outputs).forEach((key: AgentInputs[number]) => {
        const value = shot.outputs[key];
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        prompt = replaceTemplate(prompt, key, value as string);
      });
    });
    prompt += this.configuration.instructSettings.input;
    prompt += this.configuration.shotTemplate.input;
    Object.keys(inputs).forEach((key: AgentInputs[number]) => {
      const value = inputs[key];
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    });
    prompt += this.configuration.instructSettings.output;
    prompt += this.configuration.shotTemplate.output;

    return prompt;
  }
}
