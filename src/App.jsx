import axios from "axios";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMsg = () => {
    if (prompt.trim()) {
      setChatMsg(prompt);
      setPrompt("");
      setChatHistory([...chatHistory, { user: chatMsg, bot: response }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMsg();
      generateAnswer();
    }
  };

  const api_key = import.meta.env.VITE_API_KEY;

  async function generateAnswer() {
    setResponse("Thinking...");

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${api_key}`,
      method: "post",
      data: {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    setResponse(
      response["data"]["candidates"][0]["content"]["parts"][0]["text"] ||
        "There is no response from the server"
    );
  }

  return (
    <div className="bg-[#0c0c0c] w-full min-h-screen pt-4">
      <div className="bg-[#505bbdb2] w-fit px-4 m-auto rounded-full flex justify-center items-center mb-6">
        <h1 className="text-4xl text-white text-center p-4">
          Chat With AI
        </h1>
        <img className="w-10" src="/public/ai.png" alt="" />
      </div>
      <div className="h-[83vh] overflow-scroll">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chat-container mt-4 w-1/2 max-sm:w-3/4 m-auto flex flex-col ${
              index === 0 ? "hidden" : ""
            }`}
          >
            <div className="text-white ms-auto bg-[#505bbdb2] text-left text-lg px-6 p-4 rounded-3xl">
              <p>{message.user}</p>
            </div>
            <div className="text-white text-xl mt-5 p-4">
              <ReactMarkdown remarkPlugins={remarkGfm}>
                {message.bot}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {chatHistory.length == 0 ? (
          <div className="mt-52 mb-8 w-1/2 max-lg:w-3/4 m-auto flex flex-col justify-center text-center text-white">
            <h1 className=" text-5xl max-sm:text-4xl">
              Ask AI Anything You Want!
            </h1>
            <div className=" bg-[#3d3d3d] bottom-0 left-0 right-0 w-3/4 max-md:w-full m-auto my-10 p-2 ps-6 rounded-3xl flex">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                type="text"
                className="text-white w-[100%] outline-none pe-2"
                placeholder="Type Something..."
              />
              <button
                className="bg-white p-2 rounded-full"
                onClick={() => {
                  sendMsg();
                  generateAnswer();
                }}
              >
                <img className="w-6" src="/send.png" alt="" />
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-container mt-4 mb-8 w-1/2 max-sm:w-3/4 m-auto flex flex-col">
            <div className="text-white ms-auto bg-[#505bbdb2] text-left text-lg px-6 p-4 rounded-3xl">
              <p>{chatMsg}</p>
            </div>
            <div className="text-white text-xl mt-5 p-4">
              <ReactMarkdown remarkPlugins={remarkGfm}>
                {response}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {chatHistory.length !== 0 && (
        <div className="absolute bg-[#3d3d3d] bottom-0 left-0 right-0 w-1/2 max-sm:w-3/4 m-auto my-10 p-2 ps-6 rounded-3xl flex">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            type="text"
            className="text-white w-[100%] outline-none pe-2"
            placeholder="Type Something..."
          />
          <button
            className="bg-white p-2 rounded-full"
            onClick={() => {
              sendMsg();
              generateAnswer();
            }}
          >
            <img className="w-6" src="/send.png" alt="" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
