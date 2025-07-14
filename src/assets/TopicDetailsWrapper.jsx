import { useParams } from "react-router-dom";
import TopicDetails from "./TopicDetails";

const TopicDetailsWrapper = () => {
    const { levelId, topicId } = useParams();

    return <TopicDetails key={`${levelId}-${topicId}`} />;
};

export default TopicDetailsWrapper;