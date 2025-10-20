import { useEffect, useState } from "react";
import { useContact } from "../../context/contact/contactContext";
import { useAsyncStatus } from "../../hooks/useAsyncStatus";
import { useUser } from "../../context/user/userContext";
import { CapitalizeFirstLetter } from "../../helpers/capitalized";
import { BadgeCheck, CheckCheck, CircleX, Trash, Users, Clock, UserPlus, Plus } from "lucide-react";
import { useAuth } from "../../context/auth/authContext";

const ContactPanel = () => {
  const { user } = useAuth();
  const { handleGetAll, handleRemove, handleCreate, handleUpdate } = useContact();
  const { handleGetById, handleGetAllFiltered } = useUser();
  const [contacts, setContacts] = useState([]);
  const { loading, error, runAsync, resetStatus } = useAsyncStatus();
  const [activeTab, setActiveTab] = useState("contacts");
  const [newContactId, setNewContactId] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchContacts = async () => {
      resetStatus();

      try {
        const res = await runAsync(async () => {
          const r = await handleGetAll();
          if (!r || !r.ok) throw new Error((r && r.error) || "Failed to fetch contacts");
          return Array.isArray(r.data) ? r.data : [];
        });

        if (!mounted) return;

        if (!res || !res.ok) {
          if (mounted) setContacts([]);
          return;
        }

        const contactsData = res.result || [];

        // only show contacts where the current user is involved
        const visibleContacts = (contactsData || []).filter((c) => c?.user_id === user?.id || c?.contact_id === user?.id);

        const users = await Promise.all(
          visibleContacts.map(async (c) => {
            try {
              const [targetRes, creatorRes] = await Promise.allSettled([handleGetById(c.contact_id), handleGetById(c.user_id)]);

              const target = targetRes.status === "fulfilled" && targetRes.value && targetRes.value.ok ? targetRes.value.data : null;
              const creator = creatorRes.status === "fulfilled" && creatorRes.value && creatorRes.value.ok ? creatorRes.value.data : null;

              return {
                ...c,
                user: target,
                creator: creator,
              };
            } catch (err) {
              console.error("Gagal ambil user:", err);
              return { ...c, user: null, creator: null };
            }
          })
        );

        if (mounted) setContacts(users);
      } catch (err) {
        console.error("fetchContacts error:", err);
        if (mounted) setContacts([]);
      }
    };

    fetchContacts();

    return () => {
      mounted = false;
      resetStatus();
    };
  }, [handleGetAll, handleGetById, runAsync, resetStatus, user?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kontak ini?")) return;

    const res = await handleRemove(id);
    if (res && res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Gagal menghapus kontak!");
    }
  };

  const handleAddContact = async (e) => {
    e?.preventDefault();
    if (!newContactId) return alert("Masukkan contact_id");

    if (typeof handleCreate !== "function") {
      alert("Fitur tambah kontak belum tersedia");
      return;
    }

    const username = newContactId?.trim();
    if (!username) return alert("Masukkan username");

    const res = await runAsync(async () => {
      const usersRes = await handleGetAllFiltered({ username }, { username: "=" });
      if (!usersRes || !usersRes.ok) throw new Error((usersRes && usersRes.error) || "Failed to fetch user");
      const found = Array.isArray(usersRes.data) && usersRes.data.length > 0 ? usersRes.data[0] : null;
      if (!found) throw new Error("User not found");

      const createRes = await handleCreate({ user_id: user.id, contact_id: found.id });
      if (!createRes || !createRes.ok) throw new Error((createRes && createRes.error) || "Failed to create contact");

      return { created: createRes.data || createRes.result || null, user: found };
    });

    if (res && res.ok) {
      const created = res.result?.created;
      const foundUser = res.result?.user;
      const item = { ...(created || {}), user: foundUser || null };
      setContacts((prev) => [item, ...prev]);
      setNewContactId("");
      setActiveTab("pending");
    } else {
      alert(res && res.error ? res.error : "Gagal menambahkan kontak");
    }
  };

  const acceptRequest = async (id) => {
    const res = await runAsync(async () => {
      const r = await handleUpdate(id, { status: "accepted" });
      if (!r || !r.ok) throw new Error((r && r.error) || "Failed to accept request");
      return r.data || r.result || null;
    });

    if (res && res.ok) {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "accepted" } : c)));
    } else {
      alert("Gagal menerima permintaan");
    }
  };

  const declineRequest = async (id) => {
    if (!window.confirm("Yakin ingin menolak permintaan ini?")) return;
    const res = await handleRemove(id);
    if (res && res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Gagal menolak permintaan");
    }
  };

  const isAccepted = (c) => {
    if (!c) return false;
    const status = c.status || c.state || null;
    if (typeof status === "string") {
      const s = status.toLowerCase();
      return s === "accepted" || s === "approved";
    }
    return false;
  };

  const accepted = contacts.filter(isAccepted);
  const pendingAll = contacts.filter((c) => !isAccepted(c));
  const pendingOutgoing = pendingAll.filter((c) => c.user_id === user?.id);
  const pendingIncoming = pendingAll.filter((c) => c.contact_id === user?.id);

  return (
    <div>
      <div>
        <h5 className="mb-3 fw-bold">Contacts</h5>

        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <UserPlus size={18} className="text-muted" />
            </span>
            <input
              className="form-control border-start-0 ps-0"
              placeholder="Add contact by username"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              aria-label="username"
            />
            <button type="button" className="btn btn-dark" onClick={handleAddContact}>
              <Plus size={17} />
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs border-0" role="tablist">
          <li className="nav-item flex-fill text-center" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "contacts" ? "active" : ""
              } border-0 position-relative w-100 d-flex align-items-center justify-content-center`}
              onClick={() => setActiveTab("contacts")}
              style={{
                color: activeTab === "contacts" ? "#000" : "#6c757d",
                borderBottom: activeTab === "contacts" ? "2px solid #000" : "2px solid transparent",
                background: "none",
                fontWeight: activeTab === "contacts" ? "600" : "400",
                whiteSpace: "nowrap",
              }}
            >
              <Users size={16} className="me-2" />
              Contacts
              {accepted.length > 0 && <span className="badge bg-primary rounded-pill ms-2">{accepted.length}</span>}
            </button>
          </li>
          <li className="nav-item flex-fill text-center" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "pending" ? "active" : ""
              } border-0 position-relative w-100 d-flex align-items-center justify-content-center`}
              onClick={() => setActiveTab("pending")}
              style={{
                color: activeTab === "pending" ? "#000" : "#6c757d",
                borderBottom: activeTab === "pending" ? "2px solid #000" : "2px solid transparent",
                background: "none",
                fontWeight: activeTab === "pending" ? "600" : "400",
                whiteSpace: "nowrap",
              }}
            >
              <Clock size={16} className="me-2" />
              Pending
              {pendingOutgoing.length > 0 && <span className="badge bg-warning rounded-pill ms-2">{pendingOutgoing.length}</span>}
            </button>
          </li>
          <li className="nav-item flex-fill text-center" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "requests" ? "active" : ""
              } border-0 position-relative w-100 d-flex align-items-center justify-content-center`}
              onClick={() => setActiveTab("requests")}
              style={{
                color: activeTab === "requests" ? "#000" : "#6c757d",
                borderBottom: activeTab === "requests" ? "2px solid #000" : "2px solid transparent",
                background: "none",
                fontWeight: activeTab === "requests" ? "600" : "400",
                whiteSpace: "nowrap",
              }}
            >
              <BadgeCheck size={16} className="me-2" />
              Requests
              {pendingIncoming.length > 0 && <span className="badge bg-danger rounded-pill ms-2">{pendingIncoming.length}</span>}
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === "contacts" && (
              <div className="tab-pane fade show active">
                {accepted.length === 0 ? (
                  <div className="text-center py-5">
                    <Users size={48} className="text-muted mb-3" />
                    <p className="text-muted">No contacts yet. Add your first contact above!</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {accepted.map((contact) => (
                      <li key={contact.id || contact.email} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div>
                              {(() => {
                                const other = contact.contact_id === user?.id ? contact.creator : contact.user;
                                return (
                                  <>
                                    <strong className="d-block">
                                      {other && other.name ? CapitalizeFirstLetter(other.name) : `User #${contact.contact_id}`}
                                    </strong>
                                    <small className="text-muted">@{other?.username || "unknown"}</small>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div style={{ cursor: "pointer", color: "blue" }} onClick={() => handleDelete(contact.id)} title="Delete">
                            <Trash size={16} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "pending" && (
              <div className="tab-pane fade show active">
                {pendingOutgoing.length === 0 ? (
                  <div className="text-center py-5">
                    <Clock size={48} className="text-muted mb-3" />
                    <p className="text-muted">No pending requests.</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {pendingOutgoing.map((contact) => (
                      <li key={contact.id || contact.email} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div>
                              <strong className="d-block">
                                {contact.user && contact.user.name ? CapitalizeFirstLetter(contact.user.name) : `User #${contact.contact_id}`}
                              </strong>
                              <small className="text-muted">@{contact.user?.username || "unknown"}</small>
                            </div>
                          </div>
                          <div style={{ cursor: "pointer", color: "blue" }} onClick={() => handleDelete(contact.id)} title="Cancel request">
                            <CircleX size={16} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="tab-pane fade show active">
                {pendingIncoming.length === 0 ? (
                  <div className="text-center py-5">
                    <BadgeCheck size={48} className="text-muted mb-3" />
                    <p className="text-muted">No incoming requests.</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {pendingIncoming.map((contact) => (
                      <li key={contact.id || contact.email} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div>
                              <strong className="d-block">
                                {contact.creator && contact.creator.name
                                  ? CapitalizeFirstLetter(contact.creator.name)
                                  : contact.user && contact.user.name
                                  ? CapitalizeFirstLetter(contact.user.name)
                                  : `User #${contact.contact_id}`}
                              </strong>
                              <small className="text-muted">@{contact.creator?.username || contact.user?.username || "unknown"}</small>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <div style={{ cursor: "pointer", color: "blue" }} onClick={() => acceptRequest(contact.id)} title="Accept">
                              <BadgeCheck size={25} />
                            </div>
                            <div style={{ cursor: "pointer", color: "red" }} onClick={() => declineRequest(contact.id)} title="Decline">
                              <CircleX size={25} />
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPanel;
