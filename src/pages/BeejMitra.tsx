import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./BeejMitra.css";

type Listing = {
  id?: string;
  item: string;
  quantity: string;
  location: string;
  phone: string;
  category?: string;
  userId?: string;
  userName?: string;
  village?: string;
  createdAt?: any;
};

export default function BeejMitra() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Items", icon: "📦" },
    { value: "seeds", label: "Seeds", icon: "🌱" },
    { value: "fertilizer", label: "Fertilizer", icon: "🌿" },
    { value: "manure", label: "Manure", icon: "💩" },
    { value: "animals", label: "Animals", icon: "🐄" },
    { value: "tools", label: "Tools", icon: "🔧" },
  ];

  // 🔁 Real-time fetch with user info
  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const listingsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as Listing;
          // Fetch user info if userId exists
          if (data.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", data.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  id: docSnap.id,
                  ...data,
                  userName: userData.name || "Farmer",
                  village: userData.village || data.location || "Unknown",
                };
              }
            } catch (error) {
              console.error("Error fetching user info:", error);
            }
          }
          return { id: docSnap.id, ...data };
        })
      );
      setListings(listingsData);
    });

    return () => unsubscribe();
  }, []);

  // ➕ Add listing
  const addListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    const item = (form.elements.namedItem("item") as HTMLInputElement).value;
    const quantity = (form.elements.namedItem("quantity") as HTMLInputElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;

    if (!item || !phone) {
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "listings"), {
        userId: auth.currentUser?.uid,
        item,
        quantity,
        location,
        phone,
        category: category || "other",
        createdAt: serverTimestamp(),
      });

      form.reset();
      setShowForm(false);
    } catch (error: any) {
      alert(`Failed to create listing: ${error.message}`);
    }

    setLoading(false);
  };

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="beejmitra-container">
      <div className="beejmitra-header">
        <h2>🌾 BeejMitra Exchange</h2>
        <p className="header-subtitle">
          Connect directly with fellow farmers. No middlemen, just farmer-to-farmer trust.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search items, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${selectedCategory === cat.value ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Listing Button */}
      <button
        className="create-listing-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "✕ Cancel" : "+ Create New Listing"}
      </button>

      {/* Create Listing Form */}
      {showForm && (
        <form onSubmit={addListing} className="listing-form">
          <h3>Create Your Listing</h3>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" className="form-input" required>
              <option value="">Select category</option>
              <option value="seeds">🌱 Seeds</option>
              <option value="fertilizer">🌿 Fertilizer</option>
              <option value="manure">🪱 Manure</option>
              <option value="animals">🐄 Animals</option>
              <option value="tools">🔧 Tools</option>
              <option value="other">📦 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="item">Item Name</label>
            <input
              id="item"
              name="item"
              type="text"
              placeholder="e.g., Organic Wheat Seeds"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="text"
              placeholder="e.g., 20 kg, 5 bags, 10 pieces"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location / Village</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Your village or location"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">WhatsApp Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              className="form-input"
              required
              pattern="[0-9]{10}"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </form>
      )}

      {/* Listings Grid */}
      <div className="listings-section">
        <h3 className="listings-title">
          Available Listings ({filteredListings.length})
        </h3>

        {filteredListings.length === 0 ? (
          <div className="empty-listings">
            <span className="empty-icon">📭</span>
            <p>No listings found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredListings.map((listing, i) => (
              <div key={listing.id || i} className="listing-card">
                <div className="listing-category">
                  {categories.find((c) => c.value === listing.category)?.icon || "📦"}{" "}
                  {listing.category || "Other"}
                </div>

                <h4 className="listing-item">{listing.item}</h4>

                {listing.quantity && (
                  <div className="listing-detail">
                    <span className="detail-icon">⚖️</span>
                    <span>{listing.quantity}</span>
                  </div>
                )}

                <div className="listing-farmer">
                  <div className="farmer-info">
                    <span className="farmer-name">👤 {listing.userName || "Farmer"}</span>
                    <span className="farmer-village">📍 {listing.village || listing.location || "Unknown"}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/91${listing.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-btn"
                >
                  <span>💬</span>
                  <span>Contact via WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
