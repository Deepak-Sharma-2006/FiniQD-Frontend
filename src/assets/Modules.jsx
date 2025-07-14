import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modules.css";

function Modules() {
  const navigate = useNavigate();

  const handleViewTopics = (level) => {
    navigate(`/topics/${level.toLowerCase().replace(" ", "-")}`);
  };

  const renderCard = (level, summary, extraInfo) => (
    <div className="module-card-large">
      <h2>{level}</h2>
      <p className="summary">{summary}</p>
      <div className="extra-info">
        {React.Children.map(extraInfo.props.children, (child, idx) => (
          <React.Fragment key={idx}>
            {child}
            {/* Add whitespace between paragraphs except after the last */}
            {idx !== React.Children.count(extraInfo.props.children) - 1 && (
              <div style={{ height: '1em' }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <button onClick={() => handleViewTopics(level)} className="view-btn">
        View Topics
      </button>
    </div>
  );

  return (
    <div className="modules-three-cards">
      {renderCard(
        "Level 1",
        "Gain a clear understanding of how financial markets operate, including basic concepts such as supply and demand, interest rates, inflation, and the role of key financial institutions.",
        <>
          <p>This level is ideal for absolute beginners with little or no background in finance. You’ll learn how money moves through markets, how to interpret financial news, and how foundational economic forces shape investment opportunities.</p>
          <p>By the end of this level, you’ll feel confident discussing financial topics and ready to take the next step in your financial learning journey.</p>
        </>
      )}

      {renderCard(
        "Level 2",
        "Expand your knowledge with a deeper dive into financial instruments, asset allocation, risk management, diversification strategies, and fundamental vs. technical analysis.",
        <>
          <p>At this level, you’ll begin to think like an investor. You’ll explore different investment vehicles including stocks, bonds, mutual funds, and ETFs.</p>
          <p>You’ll learn to evaluate risk versus reward, build balanced portfolios, and interpret performance metrics. Ideal for those who want to move from theory to practical application and start making informed investment decisions.</p>
        </>
      )}

      {renderCard(
        "Level 3",
        "Develop advanced skills in portfolio construction, financial modeling, macroeconomic analysis, and real-time market strategies used by seasoned professionals.",
        <>
          <p>This level is tailored for experienced learners and aspiring financial leaders. You’ll tackle high-level topics like behavioral finance, quantitative risk modeling, tax-efficient strategies, and portfolio rebalancing. You'll also gain insight into global economic indicators and real-world decision-making tools used by hedge funds and institutional investors.</p>
          <p>By the end, you’ll be fully equipped to  navigate volatile markets with precision and confidence.</p>
        </>
      )}
    </div>
  );
}

export default Modules;