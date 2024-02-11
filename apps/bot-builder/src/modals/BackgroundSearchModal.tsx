import ItemSearch from "../components/ItemSearch";
import { closeBackgroundSearchModal } from "../state/slices/inputSlice";
import { useAppDispatch, useAppSelector } from "../state/store";

export default function BackgroundSearchModal() {
  const opened = useAppSelector(
    (state) => state.input.modals.backgroundSearch.opened
  );
  const dispatch = useAppDispatch();

  return (
    <ItemSearch
      title="Search Backgrounds"
      opened={opened}
      pageSize={10}
      onSearch={async (query) => {
        return {
          success: true,
          result: {
            public: [],
            private: [],
          },
        };
      }}
      onSelect={() => {}}
      onClose={() => dispatch(closeBackgroundSearchModal())}
    />
  );
}
