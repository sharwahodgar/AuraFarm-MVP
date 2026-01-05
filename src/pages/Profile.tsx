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

  if (loading) return <p>Loading profile…</p>;
  if (!profile) return <p>Profile error</p>;

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
          {profile.badges.map((b: string, i: number) => (
            <span key={i} style={badgeStyle}>{b}</span>
          ))}

          <br />
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      ) : (
        <>
          <Input
            label="Name"
            value={profile.name}
            onChange={(v: string) =>
              setProfile({ ...profile, name: v })
            }
          />
          <Input
            label="Village"
            value={profile.village}
            onChange={(v: string) =>
              setProfile({ ...profile, village: v })
            }
          />
          <Input
            label="Land Size"
            value={profile.landSize}
            onChange={(v: string) =>
              setProfile({ ...profile, landSize: v })
            }
          />
          <Input
            label="Crops (comma separated)"
            value={profile.crops.join(", ")}
            onChange={(v: string) =>
              setProfile({
                ...profile,
                crops: v.split(",").map((c: string) => c.trim()),
              })
            }
          />
          <Input
            label="Livestock (comma separated)"
            value={profile.livestock.join(", ")}
            onChange={(v: string) =>
              setProfile({
                ...profile,
                livestock: v.split(",").map((l: string) => l.trim()),
              })
            }
          />

          <button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      )}

      <br />
      <button onClick={() => signOut(auth)}>Logout</button>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Row({ label, value }: { label: string; value: string }) {
  return <p><b>{label}:</b> {value || "-"}</p>;
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  background: "#2e7d32",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 8,
  marginRight: 8,
};
