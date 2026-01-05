import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";

type Listing = {
  item: string;
  quantity: string;
  location: string;
  phone: string;
};

export default function BeejMitra() {
  const [listings, setListings] = useState<Listing[]>([]);

  // 🔁 Real-time fetch
  useEffect(() => {
    const q = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Listing);
      setListings(data);
    });

    return () => unsubscribe();
  }, []);

  // ➕ Add listing
  const addListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const item = (form.elements.namedItem("item") as HTMLInputElement).value;
    const quantity = (form.elements.namedItem("quantity") as HTMLInputElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;

    if (!item || !phone) return;

    await addDoc(collection(db, "listings"), {
      userId: auth.currentUser?.uid,
      item,
      quantity,
      location,
      phone,
      createdAt: serverTimestamp(),
    });

    form.reset();
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>🌾 BeejMitra Exchange</h2>

      <form onSubmit={addListing}>
        <input name="item" placeholder="Item (Seeds / Crop / Tool)" required />
        <input name="quantity" placeholder="Quantity (e.g. 20 kg)" />
        <input name="location" placeholder="Location / Village" />
        <input name="phone" placeholder="Phone (WhatsApp)" required />
        <button style={{ marginTop: 8 }}>Add Listing</button>
      </form>

      <hr />

      {listings.map((l, i) => (
        <div
          key={i}
          style={{ padding: 10, borderBottom: "1px solid #ddd" }}
        >
          <b>{l.item}</b> — {l.quantity}
          <br />
          📍 {l.location}
          <br />
          <a
            href={`https://wa.me/91${l.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            💬 Contact on WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}
      <NavBar />
