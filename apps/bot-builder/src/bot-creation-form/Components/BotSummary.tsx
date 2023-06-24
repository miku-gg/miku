import "./BotSummary.scss";

interface BotSummaryProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
  bytes: number;
}

const BotSummary = ({ image, title, description, tags, bytes }: BotSummaryProps) => {
  let size = '';
  if (bytes < 1048576) {
    size = `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1073741824) {
    size = `${(bytes / 1048576).toFixed(2)} MB`;
  }
  return (
    <div className="SummaryInfo">
      <img className="SummaryInfo__Image" src={image} alt="SummaryInfo Image" />
      <div className="SummaryInfo__InfoContainer">
        <h1 className="SummaryInfo__Title">{title}</h1>
        <div className="SummaryInfo__Description scrollbar">{description}</div>
        <div>
          Bundle size: ~{size}
        </div>
      </div>
    </div>
  );
};
export default BotSummary;
