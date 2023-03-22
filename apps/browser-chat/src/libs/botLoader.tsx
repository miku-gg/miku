import { BotConfig } from "@mikugg/bot-validator";
import React, { useCallback, useContext, useEffect, useState } from "react";
import botFactory from './botFactory';
import queryString from "query-string";

const BOT_DIRECTORY_ENDPOINT = import.meta.env.VITE_BOT_DIRECTORY_ENDPOINT || 'http://localhost:8585/bot';

export function loadBotConfig(botHash: string): Promise<{
  success: boolean,
  bot?: BotConfig,
  hash: string,
}> {
  return fetch(`${BOT_DIRECTORY_ENDPOINT}/${botHash}`)
    .then((res) => res.json())
    .then((bot) => {
      return {
        success: true,
        bot,
        hash: botHash,
      };
    }).catch((err) => {
      console.warn(err);
      return {
        success: false,
        bot: undefined,
        hash: botHash,
      };
    });
}

export function getBotHashFromUrl(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('bot') || '';
}

export const BotLoaderContext = React.createContext<{
  botHash: string,
  botConfig: BotConfig | undefined,
  loading: boolean,
  error: boolean,
  setBotHash: (bot: string) => void,
  setBotConfig: (botConfig: BotConfig) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void,
}>({
  botHash: '',
  botConfig: undefined,
  loading: true,
  error: false,
  setBotHash: () => {},
  setBotConfig: () => {},
  setLoading: () => {},
  setError: () => {},
});


export const BotLoaderProvider = ({ children }: {children: JSX.Element}): JSX.Element => {
  const [botHash, setBotHash] = useState<string>('');
  const [botConfig, setBotConfig] = useState<BotConfig | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  

  return (
    <BotLoaderContext.Provider value={{ botConfig, loading, error, botHash, setBotConfig, setLoading, setError, setBotHash }}>
      {children}
    </BotLoaderContext.Provider>
  );
};

export function useBot(): {
  botHash: string,
  botConfig: BotConfig | undefined,
  loading: boolean,
  error: boolean,
  setBotHash: (botHash: string) => void,
} {
  const {
    botConfig, setBotConfig, loading, setLoading, error, setError, botHash, setBotHash,
  } = useContext(BotLoaderContext)

  const _botLoadCallback = useCallback((_hash: string = getBotHashFromUrl()) =>{
    setLoading(true);
    setBotHash(_hash);
    loadBotConfig(_hash).then((res) => {
      if (res.success && res.bot) {
        const searchParams = queryString.parse(location.search);
        const newSearchParams = {...searchParams, bot: _hash};
        const newSearchString = queryString.stringify(newSearchParams);
        window.history.replaceState({}, 'bot', `/?${newSearchString}`);
        botFactory.updateInstance(res.bot);
        setBotConfig(res.bot);
        setBotHash(res.hash);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [setBotConfig, setError, setLoading, setBotHash]);

  return {
    botHash,
    botConfig,
    loading,
    error,
    setBotHash: (_hash?: string) => _botLoadCallback(_hash),
  };
}