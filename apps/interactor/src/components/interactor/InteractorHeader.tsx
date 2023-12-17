import './InteractorHeader.scss'

const InteractorHeader = () => {
  return (
    <div className="InteractorHeader">
      <div className="InteractorHeader__left">
        <div
          className="w-8 h-8 bg-cover rounded-full"
          style={{
            backgroundImage: profileImage
              ? `url(${assetLinkLoader(profileImage, '480p')})`
              : '',
          }}
        />
        <div className="BotDisplay__header-name">{card?.data.name}</div>
        {botConfigSettings.promptCompleterEndpoint.type !==
        PromptCompleterEndpointType.APHRODITE ? (
          <div className="inline-flex">
            <button className="rounded-full" onClick={displayBotDetails}>
              <img src={infoIcon} />
            </button>
          </div>
        ) : null}
        <div className="inline-flex">
          {(card?.data?.extensions?.mikugg?.scenarios?.length || 0) > 1 &&
          (responsesGenerated.length ||
            currentScenarioId !==
              card?.data.extensions.mikugg.start_scenario) ? (
            <ScenarioSelector
              value={currentScenarioId || ''}
              onChange={updateScenario}
            />
          ) : null}
        </div>
      </div>
      <div className="InteractorHeader__right">
        {config.productionMode ? (
          <div className={`inline-flex ${isSmart ? 'brain-activated' : ''}`}>
            <Tooltip
              title={
                isSmart
                  ? 'Deactivate 70B'
                  : 'Activate 70B model. Free for a limited time.'
              }
              placement="left"
            >
              <button onClick={toggleBrain}>
                <Brain />
              </button>
            </Tooltip>
          </div>
        ) : null}
        {music ? <MusicPlayer src={assetLinkLoader(music, 'audio')} /> : null}
        <div className="inline-flex transition-colors hover:text-[#A78BFA]">
          <button
            className="rounded-full"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen()
                setFullscreen(false)
              } else {
                document.documentElement.requestFullscreen()
                setFullscreen(true)
              }
            }}
          >
            {fullscreen ? (
              <ScreenNormalIcon size={24} />
            ) : (
              <ScreenFullIcon size={24} />
            )}
          </button>
        </div>
        <div className="inline-flex transition-colors hover:text-[#A78BFA]">
          <button className="rounded-full" onClick={handleHistoryButtonClick}>
            <HistoryIcon size={24} />
          </button>
        </div>
        <div className="inline-flex transition-colors hover:text-[#A78BFA]">
          <button className="rounded-full" onClick={handleSettingsButtonClick}>
            <GearIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InteractorHeader
