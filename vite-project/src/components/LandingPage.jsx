import jug from "../assets/jug.png";
import calculator from "../assets/calculator.png";
import folder from "../assets/folder.png";

function LandingPage() {
  return (
    <div>
      <div className="text-4xl mt-44 italic">
        <h1>Spray Management</h1>
        <h2 className="text-gray-600 text-5xl">made easy</h2>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-22">
        <div class="bg-blue-100 p-4">
          <p className="italic font-bold text-2xl">Step 1.</p>
          <p className="mt-5 mb-5 font-mono text-xl">
            Find a Spray for your specific problem
          </p>
          <img src={jug}></img>
        </div>
        <div class="bg-green-100 p-4">
          <p className="italic font-bold text-2xl">Step 2.</p>
          <p className="mt-5 mb-5 font-mono text-xl">
            Easily calculate how much to use
          </p>
          <img src={calculator}></img>
        </div>
        <div class="bg-red-100 p-4">
          <p className="italic font-bold text-2xl">Step 3.</p>
          <p className="mt-5 mb-5 font-mono text-xl">Log for your records</p>
          <img src={folder}></img>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
