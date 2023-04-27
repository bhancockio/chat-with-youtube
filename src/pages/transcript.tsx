import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

function Transcript() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProcessButtonClick = () => {
    setLoading(true);
    axios
      .post("/api/pinecone", { text: transcript })
      .then(() => {
        toast.success(
          "Successfully saved to Pinecone. Time to start chatting.",
          { position: "bottom-right" }
        );
      })
      .catch(() => {
        toast.error("Error saving to Pinecone. Try again.", {
          position: "bottom-right",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Transcript Page</h1>
      <button
        className="mb-4 rounded bg-red-500 px-4 py-2 text-white"
        onClick={handleProcessButtonClick}
      >
        {loading ? "Processing..." : "Process"}
      </button>
      <textarea
        className="h-96 w-full rounded border p-2"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Enter transcript here..."
      />
    </div>
  );
}

export default Transcript;
