import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import "./Feed.css";

type Post = {
  text: string;
  userName: string;
  village: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: "image" | "video";
  createdAt?: any;
};

type MediaPreview = {
  file: File;
  preview: string;
  type: "image" | "video";
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postText, setPostText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);


  // 🔁 Real-time feed
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post & { id: string })));
    });
    return () => unsub();
  }, []);

  // 📸 Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size is too large. Max size: ${type === "image" ? "10MB" : "50MB"}`);
      return;
    }

    // Validate file type
    if (type === "image" && !file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      alert("Please select a valid video file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        file,
        preview: reader.result as string,
        type,
      });
    };

    if (type === "image") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // 🗑️ Remove media preview
  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // ➕ Create post
  const addPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const text = postText.trim();

    if (!text && !mediaPreview) return;

    setLoading(true);
    setUploadProgress(0);

    // 🔍 Fetch user profile fresh right before creating post
    let farmerName = auth.currentUser?.email?.split("@")[0] || "Farmer";
    let villageName = "Unknown Village";
    
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Use actual values from profile, ensuring they're not empty
          if (data.name && typeof data.name === 'string' && data.name.trim()) {
            farmerName = data.name.trim();
          }
          if (data.village && typeof data.village === 'string' && data.village.trim()) {
            villageName = data.village.trim();
          }
          
          console.log("Using farmer profile:", { name: farmerName, village: villageName });
        } else {
          console.warn("User profile not found in database");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    let imageUrl = "";
    let videoUrl = "";
    let mediaType: "image" | "video" | undefined = undefined;

    // Upload media if exists
    if (mediaPreview) {
      try {
        const timestamp = Date.now();
        const fileName = `${auth.currentUser?.uid}_${timestamp}_${mediaPreview.file.name}`;
        const storageRef = ref(storage, `posts/${fileName}`);

        setUploadProgress(50);
        await uploadBytes(storageRef, mediaPreview.file);
        
        const url = await getDownloadURL(storageRef);
        setUploadProgress(100);

        if (mediaPreview.type === "image") {
          imageUrl = url;
          mediaType = "image";
        } else {
          videoUrl = url;
          mediaType = "video";
        }
      } catch (error: any) {
        alert(`Failed to upload media: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    // Create post
    try {
      await addDoc(collection(db, "posts"), {
        text: text,
        userId: auth.currentUser?.uid,
        userName: farmerName,
        village: villageName,
        ...(imageUrl && { imageUrl }),
        ...(videoUrl && { videoUrl }),
        ...(mediaType && { mediaType }),
        createdAt: serverTimestamp(),
      });

      form.reset();
      setPostText("");
      setMediaPreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error: any) {
      alert(`Failed to create post: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="feed-container">
      {/* Composer */}
      <form onSubmit={addPost} className="post-composer">
        <textarea
          name="post"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's happening on your farm today?"
          rows={3}
          className="post-textarea"
          disabled={loading}
        />

        {/* Media Preview */}
        {mediaPreview && (
          <div className="media-preview-container">
            {mediaPreview.type === "image" ? (
              <div className="image-preview">
                <img src={mediaPreview.preview} alt="Preview" />
                <button
                  type="button"
                  onClick={removeMedia}
                  className="remove-media-btn"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="video-preview">
                <video src={mediaPreview.preview} controls />
                <button
                  type="button"
                  onClick={removeMedia}
                  className="remove-media-btn"
                  aria-label="Remove video"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">Uploading... {uploadProgress}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <div className="media-buttons">
            <label htmlFor="image-upload" className="media-button image-button">
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "image")}
                disabled={loading || !!mediaPreview}
                style={{ display: "none" }}
              />
              <span className="button-icon">📷</span>
              <span>Photo</span>
            </label>

            <label htmlFor="video-upload" className="media-button video-button">
              <input
                id="video-upload"
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "video")}
                disabled={loading || !!mediaPreview}
                style={{ display: "none" }}
              />
              <span className="button-icon">🎥</span>
              <span>Video</span>
            </label>
          </div>

          <button
            type="submit"
            className="post-submit-button"
            disabled={loading || (!mediaPreview && !postText.trim())}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {uploadProgress > 0 ? "Uploading..." : "Posting..."}
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="posts-feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((p, i) => (
            <div key={i} className="post-card">
              <div className="post-header">
                <span className="post-author">{p.userName}</span>
                <span className="post-location"> · {p.village}</span>
              </div>

              {p.text && (
                <div className="post-text">{p.text}</div>
              )}

              {/* Display Media */}
              {p.imageUrl && (
                <div className="post-media">
                  <img src={p.imageUrl} alt="Post content" />
                </div>
              )}

              {p.videoUrl && (
                <div className="post-media">
                  <video src={p.videoUrl} controls />
                </div>
              )}

              <div className="post-footer">
                <span className="post-action">❤️ Like</span>
                <span className="post-action">💬 Reply</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
