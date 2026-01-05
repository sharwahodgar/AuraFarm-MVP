import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;

    const name = (f.elements.namedItem("name") as HTMLInputElement).value;
    const village = (f.elements.namedItem("village") as HTMLInputElement).value;
    const landSize = (f.elements.namedItem("landSize") as HTMLInputElement).value;
    const crops = (f.elements.namedItem("crops") as HTMLInputElement).value;
    const livestock = (f.elements.namedItem("livestock") as HTMLInputElement).value;
    const email = (f.elements.namedItem("email") as HTMLInputElement).value;
    const password = (f.elements.namedItem("password") as HTMLInputElement).value;

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name,
      village,
      landSize,
      crops: crops.split(",").map(c => c.trim()),
      livestock: livestock.split(",").map(l => l.trim()),
      badges: ["New Farmer"],
      createdAt: serverTimestamp(),
    });

    navigate("/feed");
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>

      <input name="name" placeholder="Full Name" required />
      <input name="village" placeholder="Village" required />
      <input name="landSize" placeholder="Land size (e.g. 3 acres)" />
      <input name="crops" placeholder="Crops (comma separated)" />
      <input name="livestock" placeholder="Livestock (comma separated)" />

      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button>Create Account</button>
    </form>
  );
}
