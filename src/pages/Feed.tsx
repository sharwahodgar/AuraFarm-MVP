import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

type Post = {
  text: string;
  userName: string;
  village: string;
  createdAt?: any;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔁 Real-time feed
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => doc.data() as Post));
    });
    return () => unsub();
  }, []);

  // ➕ Create post
  const addPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const text = (form.elements.namedItem("post") as HTMLTextAreaElement).value;

    if (!text.trim()) return;

    setLoading(true);

    await addDoc(collection(db, "posts"), {
      text,
      userId: auth.currentUser?.uid,
      userName: auth.currentUser?.email?.split("@")[0] || "Farmer",
      village: "Local Area", // later from profile
      createdAt: serverTimestamp(),
    });

    form.reset();
    setLoading(false);
  };

  return (
    <div>
      {/* Composer */}
      <form
        onSubmit={addPost}
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 12,
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <textarea
          name="post"
          placeholder="What’s happening on your farm today?"
          rows={3}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: 15,
          }}
        />
        <div style={{ textAlign: "right", marginTop: 8 }}>
          <button disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {/* Feed */}
      {posts.map((p, i) => (
        <div
          key={i}
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {p.userName} · <span style={{ color: "#666" }}>{p.village}</span>
          </div>

          <div style={{ margin: "8px 0", fontSize: 15 }}>{p.text}</div>

          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 14,
              color: "#555",
            }}
          >
            <span style={{ cursor: "pointer" }}>❤️ Like</span>
            <span style={{ cursor: "pointer" }}>💬 Reply</span>
          </div>
        </div>
      ))}
    </div>
  );
}
