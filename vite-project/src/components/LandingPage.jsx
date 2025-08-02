function LandingPage() {
  return (
    <div>
      <div className="text-4xl mt-44 italic">
        <h1>Spray Management</h1>
        <h2 className="text-gray-600 text-5xl">made easy</h2>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-22">
        <div class="bg-blue-200 p-4">
          <p className="mt-20 mb-20">Find a Spray for your specific problem</p>
        </div>
        <div class="bg-green-200 p-4">
          <p className="mt-20 mb-20">Easily calculate how much to use</p>
        </div>
        <div class="bg-red-200 p-4">
          <p className="mt-20 mb-20">Log for your records</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
