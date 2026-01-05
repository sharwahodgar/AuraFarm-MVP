import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔑 Wait for auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔑 Load or FIX profile
  useEffect(() => {
    if (!uid) return;

    const loadOrCreateProfile = async () => {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data() as ProfileData);
      } else {
        // 🔥 AUTO-FIX: create missing profile
        const newProfile: ProfileData = {
          name: auth.currentUser?.displayName || "Farmer",
          village: "",
          landSize: "",
          crops: [],
          livestock: [],
          badges: ["New Farmer"],
        };

        await setDoc(ref, newProfile);
        setProfile(newProfile);
      }

      setLoading(false);
    };

    loadOrCreateProfile();
  }, [uid]);

  const saveProfile = async () => {
    if (!uid || !profile) return;
    setSaving(true);
    await updateDoc(doc(db, "users", uid), profile);
    setSaving(false);
    setEditMode(false);
  };

  if (loading) return <p>Loading profile…</p>;
  if (!profile) return <p>Profile error. Please reload.</p>;

  return (
    <div>
      <h3>👤 Farmer Profile</h3>

      {!editMode ? (
        <>
          <Row label="Name" value={profile.name} />
          <Row label="Village" value={profile.village} />
          <Row label="Land Size" value={profile.landSize} />
          <Row label="Crops" value={profile.crops.join(", ")} />
          <Row label="Livestock" value={profile.livestock.join(", ")} />

          <h4>🏅 Badges</h4>
          {profile.badges.map((b, i) => (
            <span key={i} style={badgeStyle}>{b}</span>
          ))}

          <br /><br />
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      ) : (
        <>
          <Input label="Name" value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })} />
          <Input label="Village" value={profile.village}
            onChange={(v) => setProfile({ ...profile, village: v })} />
          <Input label="Land Size" value={profile.landSize}
            onChange={(v) => setProfile({ ...profile, landSize: v })} />
          <Input label="Crops"
            value={profile.crops.join(", ")}
            onChange={(v) =>
              setProfile({ ...profile, crops: v.split(",").map(c => c.trim()) })
            } />
          <Input label="Livestock"
            value={profile.livestock.join(", ")}
            onChange={(v) =>
              setProfile({ ...profile, livestock: v.split(",").map(l => l.trim()) })
            } />

          <button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      )}

      <br /><br />
      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  );
}

/* helpers */
function Row({ label, value }: { label: string; value: string }) {
  return <p><b>{label}:</b> {value || "-"}</p>;
}

function Input({ label, value, onChange }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const badgeStyle = {
  background: "#2e7d32",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 8,
  marginRight: 8,
};
