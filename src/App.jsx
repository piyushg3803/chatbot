import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./index.css"

function App() {
  const [prompt, setPrompt] = useState("");
  const [promptImage, setPromptImage] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);

  const fileSelect = useRef();
  const menuButton = useRef();
  const menuContainer = useRef();

  useEffect(() => {
    const handleMenuClose = (e) => {
      if (
        fileSelect.current &&
        !fileSelect.current.contains(e.target) &&
        menuButton.current &&
        !menuButton.current.contains(e.target) &&
        menuContainer.current &&
        !menuContainer.current.contains(e.target)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleMenuClose);
    return () => document.removeEventListener("mousedown", handleMenuClose);
  });

  const sendMsg = (doGenerate = true) => {
    if (!prompt.trim()) return;

    const userText = prompt;
    const userImage = promptImage;

    // ADD TO CHAT
    setChatHistory((prev) => [
      ...prev,
      { user: userText, bot: "Thinking...", image: userImage, pending: true }
    ]);

    setChatMsg(userText);

    // RESET INPUTS
    setPrompt("");
    setPromptImage(null);

    if (doGenerate) generateAnswer(userText, userImage);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMsg();
      // generateAnswer();
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const addImage = async (e) => {
    const file = e.target.files[0];
    const base = await fileToBase64(file);
    setPromptImage(base);
    setOpenMenu(false)
  };

  const api_key = import.meta.env.VITE_API_KEY;

  const generateAnswer = async (promptText, promptImageData) => {
    setResponse("Thinking...");

    const parts = [{ text: promptText }];

    if (promptImageData) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: promptImage
        }
      });
    }

    const res = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${api_key}`,
      method: "post",
      data: { contents: [{ parts }] }
    });

    const botReply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from server";

    setResponse(botReply);

    // Update last message bot response
    setChatHistory((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          bot: botReply,
          pending: false
        };
      }
      return updated;
    });
  };

  return (
    <div className="bg-[#0c0c0c] w-full min-h-screen pt-4">
      {/* HEADER */}
      <div className="border-2 bg-[#3d3d3d] w-fit px-3 m-auto rounded-3xl flex justify-center items-center mb-6">
        <h1 className="text-4xl text-white text-center p-3">Chat With AI</h1>
        <img className="w-10" src="/ai.png" alt="" />
      </div>

      {/* CHAT AREA */}
      <div className="h-[72vh] overflow-scroll">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chat-container mt-4 w-3/5 max-md:w-5/6  m-auto flex flex-col ${message.pending ? "message-enter" : ""}`}
          >
            <div className="text-white ms-auto bg-[#3d3d3d] px-6 p-2 rounded-2xl">

              {/* SHOW IMAGE OF THIS MESSAGE */}
              {message.image && (
                <img
                  className="w-40 rounded-xl mb-3"
                  src={`data:image/jpeg;base64,${message.image}`}
                />
              )}

              <p className="text-xl">{message.user}</p>
            </div>

            <div className="text-white text-xl mt-5 p-4">
              {message.pending ?
                (
                  <div className="loading-bot">Thinking...</div>
                ) :
                (<ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.bot}
                </ReactMarkdown>)
              }
            </div>
          </div>
        ))}

        {/* EMPTY CHAT STATE */}
        {chatHistory.length === 0 && (
          <div className="mt-52 w-1/2 max-lg:w-3/4 m-auto text-center text-white">

            <h1 className="text-5xl max-sm:text-4xl">
              Ask AI Anything You Want!
            </h1>
          </div>
        )}
      </div>

      {/* INPUT BOX */}
      <div className="text-white absolute bg-[#3d3d3d] bottom-0 left-0 right-0 w-3/5 max-md:w-5/6 m-auto my-10 p-2 ps-4 rounded-2xl">

        {/* PREVIEW IMAGE ABOVE PROMPT */}
        {promptImage && (
          <div className="relative">
            <img
              className="w-40 rounded-xl mb-3"
              src={`data:image/jpeg;base64,${promptImage}`}
            />
            <div className="bg-white p-2 w-7 rounded-full absolute top-0 left-35" onClick={() => setPromptImage(null)}>
              <img className="w-3" src="/x-symbol.svg" alt="remove-image" />
            </div>
          </div>
        )}

        <div className="flex">
          {openMenu && (
            <div
              ref={menuContainer}
              className="bg-[#3d3d3d] list-none absolute bottom-14 left-0 p-4 rounded-2xl message-enter"
            >
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  fileSelect.current.click();
                }}
                className="cursor-pointer"
              >
                Upload an image
              </li>
            </div>
          )}

          <input ref={fileSelect} type="file" className="hidden" onChange={addImage} />

          <div
            ref={menuButton}
            className="text-center me-4 text-white text-3xl cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          >
            +
          </div>

          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            type="text"
            className="text-white w-full outline-none pe-2"
            placeholder="Type Something..."
          />

          <button
            className="bg-white p-2 rounded-xl"
            onClick={() => {
              sendMsg();
              // generateAnswer();
            }}
          >
            <img className="w-6" src="/send.png" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
