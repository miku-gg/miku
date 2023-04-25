interface botSettingsFooterProps {
  onClick: () => void;
}

const handleExport = () => {
  console.log("EXPORT");
};

const handleImport = () => {
  console.log("Import");
};

export const BotSettingsFooter = ({ onClick }: botSettingsFooterProps) => {
  return (
    <div className="flex gap-4 justify-center">
      <button
        className="button-transparent min-w-[10em]"
        onClick={handleExport}
      >
        Export
      </button>
      <label className="button-purple min-w-[10em] flex items-center justify-center cursor-pointer py-2">
        Import
        <input
          id="load-history-input"
          className="hidden"
          type="file"
          accept="application/json"
          onChange={handleImport}
        />
      </label>
    </div>
  );
};
