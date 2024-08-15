import { Button, CheckBox, Input, Loader, Modal } from '@mikugg/ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import './ItemSearch.scss';

export interface ItemResult<T> {
  id: string;
  name: string;
  description: string;
  tags: string[];
  previewAssetUrl: string;
  value: T;
}

const isAudioFile = (name: string) => {
  const audioFormats = ['.mp3', '.wav', '.ogg', '.flac', '.mpeg', '.m4a'];
  return audioFormats.some((format) => name.endsWith(format));
};

export default function ItemSearch<T>(props: {
  opened: boolean;
  pageSize: number;
  onSearch: (query: { text: string; skip: number; take: number; onlyPrivate: boolean }) => Promise<{
    success: boolean;
    result: {
      public: ItemResult<T>[];
      private: ItemResult<T>[];
    };
  }>;
  onSelect: (value: T) => void;
  onClose: () => void;
  onError?: (error: string) => void;
  title: string;
}) {
  const [query, setQuery] = useState<string>('');
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<ItemResult<T>[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const search = useCallback(
    debounce(async (text: string, onlyPrivate = false, take = 0, skip = 0) => {
      setLoading(true);
      try {
        const { success, result } = await props.onSearch({
          text,
          skip,
          take,
          onlyPrivate,
        });
        setLoading(false);
        if (!success) {
          props.onError && props.onError('Error searching');
          return;
        }
        setResults((existingResults) => [...existingResults, ...result.private, ...result.public]);
        setHasMore(result.private.length + result.public.length === take);
      } catch (e) {
        setLoading(false);
        props.onError && props.onError('Error searching');
      }
    }, 500),
    [props.onSearch],
  );

  const handleLoadMore = () => {
    setLoading(true);
    search(query, onlyPrivate, props.pageSize, results.length);
  };

  useEffect(() => {
    if (props.opened) {
      setHasMore(true);
      setResults([]);
      setLoading(true);
      search(query, onlyPrivate, props.pageSize, 0);
    }
  }, [query, search, onlyPrivate, props.pageSize, props.opened]);

  return (
    <Modal
      opened={props.opened}
      onCloseModal={props.onClose}
      title={props.title}
      className="ItemSearch__modal"
      overlayClassName="scrollbar"
    >
      <div className="ItemSearch">
        <div className="ItemSearch__input">
          <div className="ItemSearch__input-text">
            <Input placeHolder={`Search...`} value={query} onChange={(e) => setQuery(e.target.value)} />
            {loading ? <Loader /> : null}
          </div>
        </div>
        {/* <div className="ItemSearch__input-checkbox">
          <CheckBox
            label="Only mine"
            value={onlyPrivate}
            onChange={(e) => setOnlyPrivate(e.target.checked)}
          />
        </div> */}
        <div className="ItemSearch__list">
          {results.map((result) => (
            <div key={result.id} className="ItemSearch__item" tabIndex={0} onClick={() => props.onSelect(result.value)}>
              {isAudioFile(result.previewAssetUrl) ? (
                <audio src={result.previewAssetUrl} controls preload="none" />
              ) : (
                <img src={result.previewAssetUrl} alt={result.name} />
              )}
              <div className="ItemSearch__item__content">
                <div className="ItemSearch__item__title">{result.name}</div>
                <div className="ItemSearch__item__description scrollbar">{result.description}</div>
                {/* <div className="ItemSearch__item__tags">
                  {result.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </div> */}
              </div>
            </div>
          ))}
        </div>
        <div className="ItemSearch__footer">
          {hasMore && !loading ? (
            <Button theme="secondary" onClick={handleLoadMore}>
              Load more
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
