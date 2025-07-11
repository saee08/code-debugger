import  { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Confetti from "react-confetti";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [correctedCode, setCorrectedCode] = useState("");
  const [explanation, setExplanation] = useState("");

  const [language, setLanguage] = useState("python");
  const [darkMode, setDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
  try {
    const response = await axios.post("http://localhost:8000/debug/", {
      code: userInput,
      language,
    });

    setCorrectedCode(response.data.corrected_code);
    setExplanation(response.data.explanation);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  } catch (error) {
    console.error("❌", error);
    toast.error("Debugging failed!");
    setCorrectedCode("");
    setExplanation("⚠️ An error occurred while debugging.");
  }
};


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".py") || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = () => setUserInput(reader.result);
      reader.readAsText(file);
    } else {
      toast.warning("Only .py and .txt files are supported!");
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6 md:p-12 transition-all">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">                     🐞 CodeFixer AI</h1>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-105 transition"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
          </div>

          <textarea
            rows={10}
            className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition mb-6"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Paste your ${language} code here or upload a file...`}
          />

          <div className="flex flex-wrap gap-4 mb-6">
            <select
              className="p-3 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md transition"
              onClick={handleSubmit}
            >
              🛠 Debug Code
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.py"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md transition"
              onClick={() => fileInputRef.current.click()}
            >
              📄 Upload File
            </button>
          </div>

          {(correctedCode || explanation) && (
  <div className="mt-6">
    <h2 className="text-xl font-bold mb-2">✅ Corrected Code</h2>
    <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded whitespace-pre-wrap">
      {correctedCode}
    </pre>
    <button
      onClick={() => {
        navigator.clipboard.writeText(correctedCode);
        toast.success("✅ Corrected code copied!");
      }}
      className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded"
    >
      📋 Copy Corrected Code
    </button>

    <h2 className="text-xl font-bold mt-6 mb-2">📋 Error Explanation</h2>
    <pre className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded whitespace-pre-wrap text-black dark:text-white">
      {explanation}
    </pre>
  </div>
)}


          {showConfetti && <Confetti />}
          <ToastContainer position="bottom-right" autoClose={2500} theme={darkMode ? "dark" : "light"} />
        </div>
      </div>
    </div>
  );
}

export default App;
