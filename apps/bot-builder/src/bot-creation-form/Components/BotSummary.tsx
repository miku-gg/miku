import "./BotSummary.scss";

interface BotSummaryProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
}

const BotSummary = ({ image, title, description, tags }: BotSummaryProps) => {
  return (
    <div className="SummaryInfo">
      <img className="SummaryInfo__Image" src={image} alt="SummaryInfo Image" />
      <div className="SummaryInfo__InfoContainer">
        <h1 className="SummaryInfo__Title">{title}</h1>
        <div className="SummaryInfo__Description scrollbar">{description}</div>
      </div>
    </div>
  );
};
export default BotSummary;
