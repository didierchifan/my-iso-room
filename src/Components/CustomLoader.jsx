import { useEffect, useState } from "react";

export const LoadingScreen = ({ started, onStarted }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3750);
  }, []);

  const welcomeMessages = [
    "Setting the scene",
    "Cleaning the room",
    "Feeding the cat",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) =>
        prevIndex === welcomeMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 1250);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}
      >
        <div
          className={`loadingScreen__board ${
            isLoading ? "loadingScreen__board_blue" : ""
          }`}
        >
          {isLoading ? (
            <>
              <h1 className="loadingScreen__title">
                {welcomeMessages[currentMessageIndex]}
              </h1>
              <div>
                <span class="loader"></span>
              </div>
            </>
          ) : (
            <>
              <h1 className="loadingScreen__title">
                Cat fed, room cleaned, scene set!
              </h1>
              <button
                className="loadingScreen__button"
                disabled={isLoading}
                onClick={onStarted}
              >
                ENTER
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
