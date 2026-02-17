export default function OperationDeck({ event, selectedOptions, onToggleOption, onProceed, remainingActions }) {
  return (
    <section className="glass panel">
      <h2>{event.icon} {event.context}</h2>
      <p>{event.prompt}</p>
      <p className="smallInfo">Actions selected: {selectedOptions.length} • Remaining slots: {remainingActions}</p>
      <div className="operations">
        {event.options.map((option) => {
          const selected = selectedOptions.some((item) => item.id === option.id);
          return (
            <button
              key={option.id}
              className={`op ${option.unethical ? 'risk' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => onToggleOption(option)}
            >
              <div className="opHead"><span>{option.icon}</span><strong>{option.title}</strong></div>
              <small>{option.subtitle}</small>
              <p>{option.description}</p>
              <div className="opFoot"><span>Cost {option.operationCost} OP</span><span>{option.unethical ? 'High risk' : 'Stable'}</span></div>
            </button>
          );
        })}
      </div>
      <button className="proceedBtn" onClick={onProceed} disabled={!selectedOptions.length}>Proceed Week ▶</button>
    </section>
  );
}
