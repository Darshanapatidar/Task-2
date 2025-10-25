import React, { useEffect, useState } from "react";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api";

export default function Comments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBody, setNewBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState("");

  // Fetch comments when component loads
  useEffect(() => {
    setLoading(true);
    fetchComments(taskId)
      .then((data) => setComments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  // Add a new comment
  async function handleAdd() {
    if (!newBody.trim()) return alert("Please write something!");
    try {
      const created = await createComment(taskId, newBody, "You");
      setComments((prev) => [...prev, created]);
      setNewBody("");
    } catch (e) {
      alert(e.message);
    }
  }

  // Start editing
  function startEdit(comment) {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  }

  // Save edit
  async function saveEdit() {
    try {
      const updated = await updateComment(taskId, editingId, editingBody, undefined);
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingId(null);
      setEditingBody("");
    } catch (e) {
      alert(e.message);
    }
  }

  // Delete a comment
  async function handleDelete(id) {
    if (!window.confirm("Delete comment?")) return;
    try {
      await deleteComment(taskId, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="p-4 rounded shadow bg-white">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>

      <ul>
        {comments.map((c) => (
          <li key={c.id} className="border-b py-2">
            {editingId === c.id ? (
              <div>
                <textarea
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  rows="2"
                  className="w-full border p-1"
                />
                <button
                  onClick={saveEdit}
                  className="bg-blue-500 text-white px-2 py-1 mt-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-300 text-black px-2 py-1 mt-1 ml-2 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600">
                  {c.author || "Anonymous"} —{" "}
                  <em>{new Date(c.created_at).toLocaleString()}</em>
                </div>
                <p className="my-1">{c.body}</p>
                <button
                  onClick={() => startEdit(c)}
                  className="text-blue-600 text-sm mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <textarea
          placeholder="Write a comment..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          rows="2"
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleAdd}
          className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}
