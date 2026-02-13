export default function OperationDeck({ event, onPick }) {
  return (
    <section className="glass panel">
      <h2>{event.icon} {event.context}</h2>
      <p>{event.prompt}</p>
      <div className="operations">
        {event.options.map((option) => (
          <button key={option.id} className={`op ${option.unethical ? 'risk' : ''}`} onClick={() => onPick(option)}>
            <div className="opHead"><span>{option.icon}</span><strong>{option.title}</strong></div>
            <small>{option.subtitle}</small>
            <p>{option.description}</p>
            <div className="opFoot"><span>Cost {option.operationCost} OP</span><span>{option.unethical ? 'High risk' : 'Stable'}</span></div>
          </button>
        ))}
      </div>
    </section>
  );
}
