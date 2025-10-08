import jug from "../assets/jug.png";
import calculator from "../assets/calculator.png";
import folder from "../assets/folder.png";
import SprayFinder from "./SprayFinder";
import { useEffect, useRef } from "react";

function LandingPage({ setTab }) {
  const hasShownAlert = useRef(false);
  //notice to users
  useEffect(() => {
    if (!hasShownAlert.current) {
      alert(
        "This application is in testing phase. The accuracy of any information is not verified, and should not be trusted blindly. Feel free to test/explore the application, and kindly provide feedback to the author in areas you believe can be improved. Thank you!"
      );
      hasShownAlert.current = true;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Spray Management
        </h1>
        <h2 className="text-3xl md:text-5xl font-light text-gray-600 italic mb-6">
          made easy
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Streamline your agricultural spray management with our comprehensive
          platform
        </p>
      </div>

      {/* Three Steps Grid */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            onClick={() => setTab("Spray Finder")}
          >
            <div className="text-blue-600 font-bold text-xl mb-4">Step 1</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Find Your Spray
            </h3>
            <p className="text-gray-700 mb-6">
              Find a spray for your specific problem
            </p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <img src={jug} alt="Spray jug" className="w-16 h-16 mx-auto" />
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            onClick={() => setTab("Spray Calculator")}
          >
            <div className="text-green-600 font-bold text-xl mb-4">Step 2</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Calculate Precisely
            </h3>
            <p className="text-gray-700 mb-6">
              Easily calculate how much to use
            </p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <img
                src={calculator}
                alt="Calculator"
                className="w-16 h-16 mx-auto"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            onClick={() => setTab("Tracking")}
          >
            <div className="text-purple-600 font-bold text-xl mb-4">Step 3</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Track & Record
            </h3>
            <p className="text-gray-700 mb-6">Log for your records</p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <img src={folder} alt="Folder" className="w-16 h-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Stats */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Spray Options</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div className="text-2xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Access</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
            <div className="text-2xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-8">
            Join farmers who have simplified their spray management process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              onClick={() => setTab("Spray Finder")}
            >
              Find Sprays
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
