export default function AnalystBubble({ tip }) {
  return (
    <div className="analystBubble" role="status" aria-live="polite">
      <span className="avatar">🧠</span>
      <div>
        <strong>Campaign Analyst</strong>
        <p>{tip}</p>
      </div>
    </div>
  );
}
