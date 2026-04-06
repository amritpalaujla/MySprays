import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSprayData } from "../assets/sprayData";
import { useRegion } from "../context/RegionContext";
import { getIssueImage } from "../assets/issuesList";

// Image Carousel Component
function ImageCarousel({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (images.length === 1) {
    return <img src={images[0]} alt={alt} />;
  }

  return (
    <div className="relative w-full h-full group">
      <img
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 hover:text-gray-900 transition-all duration-200 px-1 py-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-700 hover:text-gray-900 transition-all duration-200 px-1 py-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => goToSlide(index, e)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function IssueDropDown({ crop, onBackToCrops }) {
  const navigate = useNavigate();
  const { region } = useRegion();
  const sprayData = getSprayData(region);

  const issues = Object.keys(sprayData[crop]);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sprays = selectedIssue ? sprayData[crop][selectedIssue] : [];

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleBackToIssues = () => {
    setSelectedIssue("");
    setIsTransitioning(false);
  };

  const handleCalculateClick = (spray) => {
    navigate("/calculator", {
      state: {
        chosenSpray: {
          crop: crop,
          issue: selectedIssue,
          name: spray.name,
          rate: spray.rate,
          unit: spray.unit,
          phi: spray.phi,
          pcp: spray.pcp,
        },
      },
    });
  };

  // ── Issue selection screen ──
  if (!selectedIssue || isTransitioning) {
    return (
      <div className="issue-container">
        <div className="mb-6">
          <button
            onClick={onBackToCrops}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Crops
          </button>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Select Issue for {crop}
          </h3>
          <p className="text-gray-600">
            Choose the specific problem you need to address
          </p>
        </div>

        <div className="crop-grid">
          {issues.map((issue) => {
            const issueImages = getIssueImage(crop, issue);
            return (
              <div
                key={issue}
                onClick={() => handleIssueClick(issue)}
                className={`crop-card ${selectedIssue === issue ? "spin" : ""}`}
              >
                <ImageCarousel
                  images={issueImages}
                  alt={`${issue} on ${crop}`}
                />
                <p>{issue}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Build a lookup: sprayName -> list of other issues it appears in for this crop
  const alsoUsedFor = {};
  for (const issue of Object.keys(sprayData[crop])) {
    for (const s of sprayData[crop][issue]) {
      if (!alsoUsedFor[s.name]) alsoUsedFor[s.name] = [];
      if (issue !== selectedIssue) alsoUsedFor[s.name].push(issue);
    }
  }

  // ── Spray cards screen ──
  return (
    <div className="issue-container">
      <div className="mb-6">
        <button
          onClick={handleBackToIssues}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Issues
        </button>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {selectedIssue} Solutions for {crop}
        </h3>
        <p className="text-gray-600">
          Select a spray option to calculate application rates
        </p>
      </div>

      <div className="sprays-grid">
        {sprays.map((spray, index) => {
          const otherIssues = alsoUsedFor[spray.name] || [];
          return (
            <div key={`${spray.name}-${index}`} className="spray-card">
              {/* Content area — flexbox pushes button to bottom */}
              <div className="spray-card-content">
                <h4>{spray.name}</h4>

                {/* Info rows — always show same fields */}
                <div className="spray-info-rows">
                  <div className="spray-info-row">
                    <span className="spray-info-label">Rate:</span>
                    <span className="spray-info-value">
                      {spray.rate} {spray.unit} per acre
                    </span>
                  </div>

                  <div className="spray-info-row">
                    <span className="spray-info-label">PHI:</span>
                    <span className="spray-info-value">{spray.phi || "—"}</span>
                  </div>

                  <div className="spray-info-row">
                    <span className="spray-info-label">PCP #:</span>
                    <span className="spray-info-value">{spray.pcp || "—"}</span>
                  </div>

                  <div className="spray-info-row">
                    <span className="spray-info-label">Stage:</span>
                    <span className="spray-info-value">
                      {spray.stage || "—"}
                    </span>
                  </div>

                  {/* Description only shown if present, in its own styled box */}
                  {spray.description && spray.description.trim() && (
                    <div className="spray-description">
                      <p>{spray.description.trim()}</p>
                    </div>
                  )}

                  {/* Also used for — only shown if spray appears in other issues */}
                  {otherIssues.length > 0 && (
                    <div className="spray-also-used">
                      <span className="spray-also-used-label">Also used for:</span>
                      <div className="spray-also-used-tags">
                        {otherIssues.map((issue) => (
                          <span key={issue} className="spray-also-used-tag">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => handleCalculateClick(spray)}>
                  Calculate Application
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IssueDropDown;
