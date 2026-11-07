import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import "./AdminPortal.css";

const API = import.meta.env.VITE_API_URL;

// Fetch wrapper for admin calls: retries once after refreshing an expired
// access token, and throws a readable error for any non-OK response
async function adminFetch(path, options = {}, retried = false) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401 && !retried) {
    const refreshRes = await fetch(`${API}/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      window.dispatchEvent(
        new CustomEvent("tokenRefreshed", { detail: { user: data.user } }),
      );
      return adminFetch(path, options, true);
    }
    window.dispatchEvent(new CustomEvent("authFailure"));
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${res.status})`,
    );
  }
  return data;
}

const jsonOptions = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const showError = (err) => {
  console.error(err);
  alert(err.message);
};

export default function AdminPortal({ user }) {
  const [activeTab, setActiveTab] = useState("crops");
  const { refreshCatalog } = useCatalog();

  // Reload the public catalog when leaving the portal so edits show up
  useEffect(() => () => refreshCatalog(), [refreshCatalog]);

  if (!user?.isAdmin) {
    return <p className="admin-access-denied">Access denied.</p>;
  }

  return (
    <div className="admin-portal">
      <Link to="/">&larr; Back to site</Link>
      <h1>Admin Portal</h1>
      <div className="admin-tabs">
        <button
          className={activeTab === "crops" ? "active" : ""}
          onClick={() => setActiveTab("crops")}
        >
          Crops
        </button>
        <button
          className={activeTab === "issues" ? "active" : ""}
          onClick={() => setActiveTab("issues")}
        >
          Issues
        </button>
        <button
          className={activeTab === "sprays" ? "active" : ""}
          onClick={() => setActiveTab("sprays")}
        >
          Sprays
        </button>
      </div>
      <div className="admin-card">
        {activeTab === "crops" && <CropsTab />}
        {activeTab === "issues" && <IssuesTab />}
        {activeTab === "sprays" && <SpraysTab />}
      </div>
    </div>
  );
}

function CropsTab() {
  const [crops, setCrops] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    adminFetch("/admin/crops").then(setCrops).catch(showError);
  }, []);

  const uploadCropImage = async (cropId, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { url } = await adminFetch("/admin/upload/crop", {
        method: "POST",
        body: formData,
      });
      const updated = await adminFetch(
        `/admin/crops/${cropId}`,
        jsonOptions("PUT", { image: url }),
      );
      setCrops((prev) => prev.map((c) => (c._id === cropId ? updated : c)));
    } catch (err) {
      showError(err);
    }
  };

  const addCrop = async () => {
    if (!newName.trim()) return;
    try {
      const crop = await adminFetch(
        "/admin/crops",
        jsonOptions("POST", { name: newName.trim() }),
      );
      setCrops((prev) => [...prev, crop]);
      if (newImage) await uploadCropImage(crop._id, newImage);
      setNewName("");
      setNewImage(null);
    } catch (err) {
      showError(err);
    }
  };

  const saveCrop = async (id) => {
    try {
      const updated = await adminFetch(
        `/admin/crops/${id}`,
        jsonOptions("PUT", { name: editName }),
      );
      setCrops((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      showError(err);
    }
  };

  const toggleActive = async (crop) => {
    try {
      const updated = await adminFetch(
        `/admin/crops/${crop._id}`,
        jsonOptions("PUT", { active: !crop.active }),
      );
      setCrops((prev) => prev.map((c) => (c._id === crop._id ? updated : c)));
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Crops</h2>
      {crops.map((crop) => (
        <div key={crop._id}>
          {editingId === crop._id ? (
            <div className="admin-row-edit">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <button className="btn-save" onClick={() => saveCrop(crop._id)}>
                Save
              </button>
              <button className="btn-cancel" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="admin-row">
              {crop.image && (
                <img
                  src={crop.image}
                  alt={crop.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{ opacity: crop.active ? 1 : 0.4 }}>
                {crop.name}
              </span>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id={`crop-img-${crop._id}`}
                onChange={(e) => {
                  uploadCropImage(crop._id, e.target.files[0]);
                  e.target.value = "";
                }}
              />
              <label
                htmlFor={`crop-img-${crop._id}`}
                className="btn-edit"
                style={{ cursor: "pointer" }}
              >
                {crop.image ? "Change Image" : "Add Image"}
              </label>

              <div className="admin-row-buttons">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingId(crop._id);
                    setEditName(crop.name);
                  }}
                >
                  Edit
                </button>
                <button
                  className={crop.active ? "btn-deactivate" : "btn-reactivate"}
                  onClick={() => toggleActive(crop)}
                >
                  {crop.active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="admin-add-form">
        <h3>Add Crop</h3>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Crop name"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files[0])}
        />
        <button className="btn-add" onClick={addCrop}>
          Add Crop
        </button>
      </div>
    </div>
  );
}

function IssuesTab() {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [issues, setIssues] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    adminFetch("/admin/crops").then(setCrops).catch(showError);
  }, []);

  useEffect(() => {
    setIssues([]);
    if (!selectedCropId) return;
    adminFetch(`/admin/crops/${selectedCropId}/issues`)
      .then(setIssues)
      .catch(showError);
  }, [selectedCropId]);

  const addIssue = async () => {
    if (!newName.trim()) return;
    try {
      const issue = await adminFetch(
        "/admin/issues",
        jsonOptions("POST", { name: newName.trim(), cropId: selectedCropId }),
      );
      setIssues((prev) => [...prev, issue]);
      setNewName("");
    } catch (err) {
      showError(err);
    }
  };

  const saveIssue = async (id) => {
    try {
      const updated = await adminFetch(
        `/admin/issues/${id}`,
        jsonOptions("PUT", { name: editName }),
      );
      setIssues((prev) => prev.map((i) => (i._id === id ? updated : i)));
      setEditingId(null);
    } catch (err) {
      showError(err);
    }
  };

  const toggleActive = async (issue) => {
    try {
      const updated = await adminFetch(
        `/admin/issues/${issue._id}`,
        jsonOptions("PUT", { active: !issue.active }),
      );
      setIssues((prev) => prev.map((i) => (i._id === issue._id ? updated : i)));
    } catch (err) {
      showError(err);
    }
  };

  const uploadIssueImages = async (issueId, files) => {
    if (!files?.length) return;
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const { urls } = await adminFetch("/admin/upload/issue", {
        method: "POST",
        body: formData,
      });
      const updated = await adminFetch(
        `/admin/issues/${issueId}`,
        jsonOptions("PUT", { images: urls }),
      );
      setIssues((prev) => prev.map((i) => (i._id === issueId ? updated : i)));
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Issues</h2>
      <select
        className="admin-select"
        value={selectedCropId}
        onChange={(e) => setSelectedCropId(e.target.value)}
      >
        <option value="">Select a crop</option>
        {crops.map((crop) => (
          <option key={crop._id} value={crop._id}>
            {crop.name}
          </option>
        ))}
      </select>

      {issues.map((issue) => (
        <div key={issue._id}>
          {editingId === issue._id ? (
            <div className="admin-row-edit">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <button className="btn-save" onClick={() => saveIssue(issue._id)}>
                Save
              </button>
              <button className="btn-cancel" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="admin-row">
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {issue.images?.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                      borderRadius: "0.5rem",
                    }}
                  />
                ))}
              </div>
              <span style={{ opacity: issue.active ? 1 : 0.4 }}>
                {issue.name}
              </span>
              <div className="admin-row-buttons">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  id={`issue-img-${issue._id}`}
                  onChange={(e) => {
                    uploadIssueImages(issue._id, e.target.files);
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor={`issue-img-${issue._id}`}
                  className="btn-edit"
                  style={{ cursor: "pointer" }}
                >
                  {issue.images?.length ? "Change Images" : "Add Images"}
                </label>
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingId(issue._id);
                    setEditName(issue.name);
                  }}
                >
                  Edit
                </button>
                <button
                  className={issue.active ? "btn-deactivate" : "btn-reactivate"}
                  onClick={() => toggleActive(issue)}
                >
                  {issue.active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {selectedCropId && (
        <div className="admin-add-form">
          <h3>Add Issue</h3>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Issue name"
          />
          <button className="btn-add" onClick={addIssue}>
            Add Issue
          </button>
        </div>
      )}
    </div>
  );
}

const emptyForm = {
  name: "",
  phi: "",
  pcp: "",
  stage: "",
  caRate: "",
  caUnit: "",
  caDescription: "",
  usRate: "",
  usUnit: "",
  usDescription: "",
};

function SprayForm({ form, updateForm }) {
  return (
    <div>
      <div className="admin-form-field">
        <label>Name</label>
        <input
          placeholder="e.g. Rimon"
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
        />
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label>PHI</label>
          <input
            placeholder="e.g. 14 days"
            value={form.phi}
            onChange={(e) => updateForm("phi", e.target.value)}
          />
        </div>
        <div className="admin-form-field">
          <label>PCP</label>
          <input
            placeholder="e.g. 28515"
            value={form.pcp}
            onChange={(e) => updateForm("pcp", e.target.value)}
          />
        </div>
        <div className="admin-form-field">
          <label>CA Rate</label>
          <input
            placeholder="e.g. 485-647"
            value={form.caRate}
            onChange={(e) => updateForm("caRate", e.target.value)}
          />
        </div>
        <div className="admin-form-field">
          <label>CA Unit</label>
          <input
            placeholder="e.g. mL"
            value={form.caUnit}
            onChange={(e) => updateForm("caUnit", e.target.value)}
          />
        </div>
        <div className="admin-form-field">
          <label>US Rate</label>
          <input
            placeholder="e.g. 16.40-21.88"
            value={form.usRate}
            onChange={(e) => updateForm("usRate", e.target.value)}
          />
        </div>
        <div className="admin-form-field">
          <label>US Unit</label>
          <input
            placeholder="e.g. fl oz"
            value={form.usUnit}
            onChange={(e) => updateForm("usUnit", e.target.value)}
          />
        </div>
      </div>
      <div className="admin-form-field">
        <label>Stage</label>
        <input
          placeholder="e.g. dormant, pink, petal fall"
          value={form.stage}
          onChange={(e) => updateForm("stage", e.target.value)}
        />
      </div>
      <div className="admin-form-field">
        <label>CA Description</label>
        <input
          placeholder="Optional notes, metric units (e.g. max 261 g/ac)"
          value={form.caDescription}
          onChange={(e) => updateForm("caDescription", e.target.value)}
        />
      </div>
      <div className="admin-form-field">
        <label>US Description</label>
        <input
          placeholder="Optional notes, US units (e.g. max 9.21 oz/ac)"
          value={form.usDescription}
          onChange={(e) => updateForm("usDescription", e.target.value)}
        />
      </div>
    </div>
  );
}

function SpraysTab() {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [sprays, setSprays] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    adminFetch("/admin/crops").then(setCrops).catch(showError);
  }, []);

  useEffect(() => {
    setSelectedIssueId("");
    setIssues([]);
    if (!selectedCropId) return;
    adminFetch(`/admin/crops/${selectedCropId}/issues`)
      .then(setIssues)
      .catch(showError);
  }, [selectedCropId]);

  useEffect(() => {
    setSprays([]);
    setEditingId(null);
    if (!selectedIssueId) return;
    adminFetch(`/admin/issues/${selectedIssueId}/sprays`)
      .then(setSprays)
      .catch(showError);
  }, [selectedIssueId]);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const buildSprayBody = () => ({
    name: form.name,
    issueId: selectedIssueId,
    phi: form.phi,
    pcp: form.pcp,
    stage: form.stage,
    ca: {
      rate: form.caRate,
      unit: form.caUnit,
      description: form.caDescription,
    },
    us: {
      rate: form.usRate,
      unit: form.usUnit,
      description: form.usDescription,
    },
  });

  const addSpray = async () => {
    if (!form.name || !form.phi || !form.pcp || !form.stage || !form.caRate) {
      setFormError("Name, PHI, PCP, Stage, and CA Rate are required.");
      return;
    }
    setFormError("");
    try {
      const spray = await adminFetch(
        "/admin/sprays",
        jsonOptions("POST", buildSprayBody()),
      );
      setSprays((prev) => [...prev, spray]);
      setForm(emptyForm);
    } catch (err) {
      showError(err);
    }
  };

  const saveSpray = async (id) => {
    try {
      const updated = await adminFetch(
        `/admin/sprays/${id}`,
        jsonOptions("PUT", buildSprayBody()),
      );
      setSprays((prev) => prev.map((s) => (s._id === id ? updated : s)));
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      showError(err);
    }
  };

  const deleteSpray = async (id) => {
    if (!window.confirm("Delete this spray? This cannot be undone.")) return;
    try {
      await adminFetch(`/admin/sprays/${id}`, { method: "DELETE" });
      setSprays((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Sprays</h2>
      <select
        className="admin-select"
        value={selectedCropId}
        onChange={(e) => setSelectedCropId(e.target.value)}
      >
        <option value="">Select a crop</option>
        {crops.map((crop) => (
          <option key={crop._id} value={crop._id}>
            {crop.name}
          </option>
        ))}
      </select>

      <select
        className="admin-select"
        value={selectedIssueId}
        onChange={(e) => setSelectedIssueId(e.target.value)}
        disabled={!selectedCropId}
      >
        <option value="">Select an issue</option>
        {issues.map((issue) => (
          <option key={issue._id} value={issue._id}>
            {issue.name}
          </option>
        ))}
      </select>

      {sprays.map((spray) => (
        <div key={spray._id}>
          {editingId === spray._id ? (
            <div
              className="admin-row-edit"
              style={{ flexDirection: "column", alignItems: "stretch" }}
            >
              <SprayForm form={form} updateForm={updateForm} />
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                <button
                  className="btn-save"
                  onClick={() => saveSpray(spray._id)}
                >
                  Save
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-row">
              <span>{spray.name}</span>
              <div className="admin-row-buttons">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingId(spray._id);
                    setForm({
                      name: spray.name,
                      phi: spray.phi,
                      pcp: spray.pcp,
                      stage: spray.stage,
                      caRate: spray.ca?.rate || "",
                      caUnit: spray.ca?.unit || "",
                      caDescription:
                        spray.ca?.description ?? spray.description ?? "",
                      usRate: spray.us?.rate || "",
                      usUnit: spray.us?.unit || "",
                      usDescription:
                        spray.us?.description ?? spray.description ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteSpray(spray._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {selectedIssueId && !editingId && (
        <div className="admin-add-form">
          <h3>Add Spray</h3>
          <SprayForm form={form} updateForm={updateForm} />
          {formError && (
            <p
              style={{
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              {formError}
            </p>
          )}
          <button className="btn-add" onClick={addSpray}>
            Add Spray
          </button>
        </div>
      )}
    </div>
  );
}
