const handleExport = () => {
  console.log("EXPORT");
};

const handleImport = () => {
  console.log("Import");
};

export const BotSettingsFooter = () => {
  return (
    <>
      <button
        className="button-transparent min-w-[10em] py-1"
        onClick={handleExport}
      >
        Export settings
      </button>
      <label className="button-purple min-w-[10em] flex items-center justify-center cursor-pointer py-1">
        Import settings
        <input
          id="load-history-input"
          className="hidden"
          type="file"
          accept="application/json"
          onChange={handleImport}
        />
      </label>
    </>
  );
};
