import axios from "axios";
import { MemoryLine, ShortTermMemory } from "./ShortTermMemory";


/*
  * LongTermMemory is a class that is responsible for saving and retrieving
  * the memory of the bot.
  * 
  * The memory is saved in a remote server that is defined in the endpoint
  * parameter of the constructor.
  * The endpoint can be called on the following paths:
  * - /save
  * - /erase
  * - /remember
  * 
  * @param endpoint The endpoint of the remote server
  */
export class LongTermMemory {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async save({botId, shortTermMemory}: {botId: string, shortTermMemory: ShortTermMemory}): Promise<boolean> {
    return axios(`${this.endpoint}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        botId,
        contextPrompt: shortTermMemory.getContextPrompt(),
        initiatorPrompt: shortTermMemory.getInitiatorPrompt(),
        memoryLines: shortTermMemory.getMemory(),
      },
    }).then((response) => response.status === 200);
  }
  
  async erase({botId}: {botId: string}): Promise<boolean> {
    return axios(`${this.endpoint}/erase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        botId,
      },
    }).then((response) => response.status === 200);
  }

  async remember({botId, trigger}: {botId: string, trigger: MemoryLine}): Promise<string> {
    return axios(`${this.endpoint}/remember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        botId,
        trigger,
      },
    }).then((response) => response.data);
  }
}