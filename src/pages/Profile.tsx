import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Profile.css";

type ProfileData = {
  name: string;
  village: string;
  landSize: string;
  crops: string[];
  livestock: string[];
  badges: string[];
};

export default function Profile() {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [stats, setStats] = useState({ posts: 0, listings: 0 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data() as ProfileData);
      } else {
        const newProfile: ProfileData = {
          name: "",
          village: "",
          landSize: "",
          crops: [],
          livestock: [],
          badges: ["New Farmer"],
        };
        await setDoc(ref, newProfile);
        setProfile(newProfile);
      }

      // Load activity stats
      try {
        const postsQuery = query(collection(db, "posts"), where("userId", "==", uid));
        const listingsQuery = query(collection(db, "listings"), where("userId", "==", uid));

        const [postsSnapshot, listingsSnapshot] = await Promise.all([
          getDocs(postsQuery),
          getDocs(listingsQuery),
        ]);

        setStats({
          posts: postsSnapshot.size,
          listings: listingsSnapshot.size,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }

      setLoading(false);
    };

    loadProfile();
  }, [uid]);

  const saveProfile = async () => {
    if (!uid || !profile) return;
    setSaving(true);
    await updateDoc(doc(db, "users", uid), profile);
    setSaving(false);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile…</p>
      </div>
    );
  }
  
  if (!profile) return <div className="profile-error">Profile error</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon">👨‍🌾</span>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{profile.name || "Farmer"}</h2>
          <p className="profile-location">📍 {profile.village || "Not set"}</p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.posts}</div>
            <div className="stat-label">Posts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <div className="stat-value">{stats.listings}</div>
            <div className="stat-label">Listings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏅</div>
          <div className="stat-content">
            <div className="stat-value">{profile.badges.length}</div>
            <div className="stat-label">Badges</div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="badges-section">
          <h3 className="section-title">
            <span className="title-icon">🏅</span>
            Badges & Recognition
          </h3>
          <div className="badges-grid">
            {profile.badges.map((badge: string, i: number) => (
              <div key={i} className="badge-card">
                <span className="badge-icon">
                  {getBadgeIcon(badge)}
                </span>
                <span className="badge-name">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="details-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="title-icon">📋</span>
            Profile Details
          </h3>
          {!editMode && (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              ✏️ Edit
            </button>
          )}
        </div>

        {!editMode ? (
          <div className="profile-details">
            <DetailRow icon="👤" label="Name" value={profile.name || "Not set"} />
            <DetailRow icon="🏘️" label="Village" value={profile.village || "Not set"} />
            <DetailRow icon="📏" label="Land Size" value={profile.landSize || "Not set"} />
            <DetailRow 
              icon="🌾" 
              label="Crops" 
              value={profile.crops.length > 0 ? profile.crops.join(", ") : "Not set"} 
            />
            <DetailRow 
              icon="🐄" 
              label="Livestock" 
              value={profile.livestock.length > 0 ? profile.livestock.join(", ") : "Not set"} 
            />
          </div>
        ) : (
          <form className="edit-form" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
            <FormInput
              label="Name"
              icon="👤"
              value={profile.name}
              onChange={(v: string) => setProfile({ ...profile, name: v })}
            />
            <FormInput
              label="Village"
              icon="🏘️"
              value={profile.village}
              onChange={(v: string) => setProfile({ ...profile, village: v })}
            />
            <FormInput
              label="Land Size"
              icon="📏"
              value={profile.landSize}
              onChange={(v: string) => setProfile({ ...profile, landSize: v })}
            />
            <FormInput
              label="Crops (comma separated)"
              icon="🌾"
              value={profile.crops.join(", ")}
              onChange={(v: string) =>
                setProfile({
                  ...profile,
                  crops: v.split(",").map((c: string) => c.trim()).filter(Boolean),
                })
              }
            />
            <FormInput
              label="Livestock (comma separated)"
              icon="🐄"
              value={profile.livestock.join(", ")}
              onChange={(v: string) =>
                setProfile({
                  ...profile,
                  livestock: v.split(",").map((l: string) => l.trim()).filter(Boolean),
                })
              }
            />

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="logout-section">
        <button className="logout-btn" onClick={() => signOut(auth)}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

function getBadgeIcon(badge: string): string {
  const badgeIcons: { [key: string]: string } = {
    "New Farmer": "🌱",
    "Active Farmer": "👨‍🌾",
    "Community Helper": "🤝",
    "Expert": "⭐",
    "Top Contributor": "🏆",
  };
  return badgeIcons[badge] || "🏅";
}

/* ---------- Helper Components ---------- */

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="detail-row">
      <div className="detail-icon">{icon}</div>
      <div className="detail-content">
        <div className="detail-label">{label}</div>
        <div className="detail-value">{value}</div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="form-input-group">
      <label className="form-label">
        <span className="form-icon">{icon}</span>
        {label}
      </label>
      <input
        className="form-input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
