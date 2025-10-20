import { useEffect, useState, useCallback } from "react";
import { useGroup } from "../../context/group/groupContext";
import { useGroupParticipant } from "../../context/groupParticipant/groupParticipantContext";
import contactService from "../../services/contactService";
import { useContact } from "../../context/contact/contactContext";
import { useUser } from "../../context/user/userContext";
import { useAuth } from "../../context/auth/authContext";
import { Users, UserPlus, Link2, Plus, X, Copy, CheckCircle, Crown, RemoveFormatting, DeleteIcon, Delete, CrossIcon, CircleX } from "lucide-react";

const GroupPanel = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [memberGroupIds, setMemberGroupIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("groups");

  const [name, setName] = useState("");
  const [radiusArea, setRadiusArea] = useState(""); // optional JSON

  const [inviteModal, setInviteModal] = useState({ open: false, groupId: null });
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [membersModal, setMembersModal] = useState({ open: false, group: null, members: [], owner: null });
  const [memberActionLoading, setMemberActionLoading] = useState(new Set());
  const [linkModal, setLinkModal] = useState({ open: false, token: null, groupId: null });
  const [copied, setCopied] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  const groupCtx = useGroup();
  const participantCtx = useGroupParticipant();

  const createGroup = groupCtx?.handleCreate;
  const getAllGroups = groupCtx?.handleGetAll;
  const createParticipant = participantCtx?.handleCreate;

  const getAllParticipants = participantCtx?.handleGetAll;
  const { handleGetById } = useUser();
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getAllGroups) {
        setError("Group provider not available. Wrap app with GroupProvider.");
        setGroups([]);
        return;
      }
      const res = await getAllGroups();
      if (!res || !res.ok) throw new Error((res && res.error) || "Failed to fetch groups");
      const data = Array.isArray(res.data) ? res.data : res.data || res;

      // attempt to enrich groups with owner profile when possible
      if (handleGetById && Array.isArray(data) && data.length > 0) {
        const enriched = await Promise.all(
          data.map(async (g) => {
            try {
              const ownerId = g.owner_id || g.ownerID;
              if (!ownerId) return { ...g, owner: null };
              const o = await handleGetById(ownerId);
              const owner = o && o.ok ? o.data : null;
              return { ...g, owner };
            } catch {
              return { ...g, owner: null };
            }
          })
        );
        setGroups(enriched || []);
      } else {
        setGroups(data || []);
      }

      // fetch participants and compute which group ids the current user belongs to
      if (getAllParticipants && user?.id) {
        try {
          const pr = await getAllParticipants();
          const participantData = Array.isArray(pr.data) ? pr.data : pr.data || pr;
          const ids = new Set(
            (participantData || [])
              .filter((p) => p && (p.user_id || p.userId || p.user?.id))
              .filter((p) => String(p.user_id || p.userId || (p.user && p.user.id)) === String(user.id))
              .map((p) => String(p.group_id || p.groupId || p.group))
          );
          setMemberGroupIds(ids);
        } catch (pe) {
          console.warn("Failed to fetch participants:", pe);
          setMemberGroupIds(new Set());
        }
      } else {
        // no participant provider or no user -> clear
        setMemberGroupIds(new Set());
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, [getAllGroups, handleGetById, getAllParticipants, user?.id]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // read authUser from localStorage (stored as JSON string)
      let owner_id = undefined;
      try {
        const raw = localStorage.getItem("authUser");
        const authUser = raw ? JSON.parse(raw) : null;
        owner_id = authUser?.id || undefined;
      } catch {
        owner_id = undefined;
      }

      const payload = {
        name,
        owner_id: owner_id,
      };

      // radiusArea is optional — only include when provided and valid JSON
      if (radiusArea && radiusArea.trim() !== "") {
        try {
          const parsed = JSON.parse(radiusArea);
          // backend expects JSON for radius_area (json.RawMessage on server)
          // include as object so when payload is JSON.stringified it becomes proper nested JSON
          payload.radius_area = parsed;
        } catch {
          setError('Radius area must be valid JSON (e.g. {"radius":200,...})');
          return;
        }
      }
      if (!createGroup) {
        setError("Group provider not available. Cannot create group.");
        return;
      }
      const cr = await createGroup(payload);
      if (!cr || !cr.ok) throw new Error((cr && cr.error) || "Failed to create group");
      // created group result may be in cr.data
      const createdGroup = cr.data || cr.result || cr;

      // after creating a group, automatically add the creator as a participant
      try {
        const groupIdCreated = createdGroup && (createdGroup.id || createdGroup.group_id || createdGroup.ID);
        const ownerToAdd = owner_id || user?.id;
        if (groupIdCreated && ownerToAdd && typeof createParticipant === "function") {
          try {
            const p = await createParticipant({ group_id: groupIdCreated, user_id: ownerToAdd });
            if (!p || !p.ok) console.warn("Failed to add group creator as participant:", p);
          } catch (pe) {
            console.warn("Error while adding creator as participant:", pe);
          }
        }
      } catch (iner) {
        console.warn("Unexpected error in post-create participant flow:", iner);
      }

      setName("");
      setRadiusArea("");
      await fetchGroups();
    } catch (err) {
      setError(String(err.message || err));
    }
  };

  const { handleGetAll: getAllContacts } = useContact();

  const openInvite = async (groupId) => {
    setInviteModal({ open: true, groupId });
    try {
      let contactsData = [];
      // helper to normalize various response shapes into array
      const normalizeList = (res) => {
        if (!res) return [];
        // if provider wrapper { ok: true, data: ... }
        if (res.ok && res.data !== undefined) {
          if (Array.isArray(res.data)) return res.data;
          // sometimes data could be paginated { data: [...] }
          if (res.data.data && Array.isArray(res.data.data)) return res.data.data;
          return Array.isArray(res.data) ? res.data : [];
        }
        // if service returned direct body: could be array or { data: [...] }
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
        return [];
      };

      if (getAllContacts) {
        const res = await getAllContacts();
        if (!res || !res.ok) throw new Error((res && res.error) || "Failed to fetch contacts");
        contactsData = normalizeList(res);
      } else {
        // fallback to direct service
        const res = await contactService.getAll();
        contactsData = normalizeList(res);
      }

      console.debug("openInvite: raw contactsData:", contactsData);

      // normalize and enrich contacts with inviteUserId (and fetch user/creator when available)
      const enriched = await Promise.all(
        (contactsData || []).map(async (c) => {
          try {
            const contactId = c.contact_id || c.contactId || c.id;
            const userRefId = c.user_id || c.userId || c.user?.id || c.creator_id;

            let target = null;
            let creator = null;
            if (handleGetById) {
              const [tRes, crRes] = await Promise.allSettled([
                contactId ? handleGetById(contactId) : Promise.resolve(null),
                userRefId ? handleGetById(userRefId) : Promise.resolve(null),
              ]);
              target = tRes && tRes.status === "fulfilled" && tRes.value && tRes.value.ok ? tRes.value.data : null;
              creator = crRes && crRes.status === "fulfilled" && crRes.value && crRes.value.ok ? crRes.value.data : null;
            }

            // determine the id to invite: pick the "other" user in the contact relative to the current auth user
            const currentUserId = user?.id;
            const targetId = (target && target.id) || c.contact_id || c.contactId || null;
            const creatorId = (creator && creator.id) || c.user_id || c.userId || null;

            let inviteUserId = null;
            if (currentUserId) {
              if (targetId && String(targetId) !== String(currentUserId)) inviteUserId = targetId;
              else if (creatorId && String(creatorId) !== String(currentUserId)) inviteUserId = creatorId;
            }
            // fallback order: target, creator, contact.id
            inviteUserId = inviteUserId || targetId || creatorId || c.id || null;

            return { ...c, user: target, creator, inviteUserId };
          } catch (err) {
            console.error("Failed to enrich contact:", err);
            const inviteUserId = c.user?.id || c.user_id || c.contact_id || c.id;
            return { ...c, user: null, creator: null, inviteUserId };
          }
        })
      );

      // If we can fetch participants for the group, exclude existing members from the list
      if (getAllParticipants) {
        try {
          const pr = await getAllParticipants();
          const participantData = Array.isArray(pr.data) ? pr.data : pr.data || pr;
          // only consider participants for the selected group
          const groupParticipants = (participantData || []).filter((p) => p && String(p.group_id || p.groupId || p.group) === String(groupId));
          const existing = new Set((groupParticipants || []).map((p) => p && (p.user_id || p.userId || p.user?.id)).filter(Boolean));
          const filtered = (enriched || []).filter((u) => !existing.has(u.inviteUserId));
          setContacts(filtered || []);
        } catch {
          // participant fetch failed — show enriched list
          setContacts(enriched || []);
        }
      } else {
        setContacts(enriched || []);
      }
      setSelectedContacts(new Set());
    } catch (err) {
      setError(String(err.message || err));
    }
  };

  const closeMembers = () => setMembersModal({ open: false, group: null, members: [], owner: null });

  const openMembers = async (group) => {
    setMembersModal((s) => ({ ...s, open: true, group }));
    try {
      const token = localStorage.getItem("authToken");
      const url = `${API_BASE}/api/group_participant/?filter[group_id]=${group.id}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      const bodyText = await res.text();
      const body = bodyText ? JSON.parse(bodyText) : null;
      const list = body && (body.data || body) ? (Array.isArray(body.data) ? body.data : body.data || (Array.isArray(body) ? body : [])) : [];

      // enrich members with user profiles
      const members = await Promise.all(
        (list || []).map(async (p) => {
          const userId = p.user_id || p.userId || (p.UserID ? p.UserID : null) || p.user?.id || p.UserID || p.UserId;
          if (!userId) return { ...p, user: null };
          try {
            const u = await handleGetById(userId);
            return { ...p, user: u && u.ok ? u.data : null };
          } catch (err) {
            console.log(err);
            return { ...p, user: null };
          }
        })
      );

      // owner info
      let owner = null;
      try {
        if (group.owner_id) {
          const o = await handleGetById(group.owner_id);
          owner = o && o.ok ? o.data : null;
        } else if (group.ownerID) {
          const o = await handleGetById(group.ownerID);
          owner = o && o.ok ? o.data : null;
        }
      } catch (err) {
        console.log(err);
        owner = null;
      }

      setMembersModal({ open: true, group, members, owner });
    } catch (err) {
      setError(String(err.message || err));
      setMembersModal({ open: true, group, members: [], owner: null });
    }
  };

  const kickMember = async (member) => {
    if (!window.confirm(`Kick ${member.user?.name || member.user?.email || "this user"} from the group?`)) return;
    if (!participantCtx || typeof participantCtx.handleRemove !== "function") {
      setError("GroupParticipant provider not available. Cannot remove member.");
      return;
    }
    // mark loading for this member
    setMemberActionLoading((prev) => {
      const next = new Set(prev);
      next.add(member.id);
      return next;
    });
    try {
      const res = await participantCtx.handleRemove(member.id);
      if (!res || !res.ok) throw new Error((res && res.error) || "Failed to remove participant");
      // remove from modal list
      setMembersModal((prev) => ({ ...prev, members: (prev.members || []).filter((m) => m.id !== member.id) }));
      // refresh groups/participants state
      await fetchGroups();
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setMemberActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const leaveGroup = async (member) => {
    if (!window.confirm(`Leave group ${membersModal.group?.name || ""}?`)) return;
    if (!participantCtx || typeof participantCtx.handleRemove !== "function") {
      setError("GroupParticipant provider not available. Cannot leave group.");
      return;
    }
    // mark loading for this member
    setMemberActionLoading((prev) => {
      const next = new Set(prev);
      next.add(member.id);
      return next;
    });
    try {
      const res = await participantCtx.handleRemove(member.id);
      if (!res || !res.ok) throw new Error((res && res.error) || "Failed to leave group");
      // remove from modal list
      setMembersModal((prev) => ({ ...prev, members: (prev.members || []).filter((m) => m.id !== member.id) }));
      // refresh groups/participants state
      await fetchGroups();
      // close modal if the current user left
      if (member.user && String(member.user.id) === String(user?.id)) {
        setMembersModal({ open: false, group: null, members: [], owner: null });
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setMemberActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const closeLinkModal = () => {
    setLinkModal({ open: false, token: null, groupId: null });
    setCopied(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateInviteLink = async (groupId) => {
    try {
      // owner check
      const g = groups.find((x) => String(x.id) === String(groupId));
      const ownerId = g && (g.owner?.id || g.owner_id || g.ownerID);
      if (!ownerId || String(ownerId) !== String(user?.id)) {
        setError("Only group owner can generate invite link.");
        setLinkModal({ open: true, token: null, groupId });
        return;
      }

      const token = localStorage.getItem("authToken");
      const url = `${API_BASE}/api/group/${groupId}/invite`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      const bodyText = await res.text();
      const body = bodyText ? JSON.parse(bodyText) : null;
      // token may be in body.data.invite_token or body.invite_token
      const inviteToken =
        (body && body.data && body.data.invite_token) || (body && body.invite_token) || (body && body.data && body.data.token) || null;
      setLinkModal({ open: true, token: inviteToken, groupId });
    } catch (err) {
      setError(String(err.message || err));
      setLinkModal({ open: true, token: null, groupId });
    }
  };

  const closeInvite = () => setInviteModal({ open: false, groupId: null });

  const toggleContact = (id) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendInvites = async () => {
    setError(null);
    try {
      const { groupId } = inviteModal;
      // verify ownership: only owner can invite
      const g = groups.find((x) => String(x.id) === String(groupId));
      const ownerId = g && (g.owner?.id || g.owner_id || g.ownerID);
      if (!ownerId || String(ownerId) !== String(user?.id)) {
        setError("Only group owner can send invites.");
        return;
      }
      // Backend expects group_participant create per user. We'll call for each selected contact.
      if (!createParticipant) {
        setError("GroupParticipant provider not available. Cannot send invites.");
        return;
      }
      for (const userId of Array.from(selectedContacts)) {
        const p = await createParticipant({ group_id: groupId, user_id: userId });
        if (!p || !p.ok) throw new Error((p && p.error) || "Failed to add participant");
      }

      closeInvite();
      await fetchGroups();
    } catch (err) {
      setError(String(err.message || err));
    }
  };

  // Filter groups by ownership with defensive guard to avoid render-time crashes
  let renderErrorMessage = null;
  let myGroups = [];
  let memberGroups = [];
  let displayedGroups = [];
  try {
    myGroups = Array.isArray(groups) ? groups.filter((g) => (g.owner_id || g.ownerID) === user?.id) : [];
    // memberGroups should be groups where user is a participant (based on memberGroupIds)
    memberGroups = Array.isArray(groups)
      ? groups.filter((g) => {
          const isParticipant = memberGroupIds && memberGroupIds.size > 0 && memberGroupIds.has(String(g.id));
          const ownerId = g.owner?.id || g.owner_id || g.ownerID;
          const isOwner = ownerId && String(ownerId) === String(user?.id);
          return isParticipant && !isOwner;
        })
      : [];
    displayedGroups = activeTab === "mygroups" ? myGroups : memberGroups;
  } catch (err) {
    // Avoid throwing during render — show a friendly message instead of a white screen
    // Log to console to help debugging in devtools
    console.error("GroupPanel render error:", err);
    renderErrorMessage = String(err || "Unexpected render error");
    myGroups = [];
    memberGroups = [];
    displayedGroups = [];
  }

  return (
    <div>
      <h5 className="mb-3 fw-bold">Groups</h5>

      <form onSubmit={handleCreate} className="mb-4">
        <div className="mb-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Users size={18} className="text-muted" />
            </span>
            <input
              className="form-control border-start-0 ps-0"
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder='Optional: {"radius":200,"center_lat":-6.2,"center_lon":106.8}'
            value={radiusArea}
            onChange={(e) => setRadiusArea(e.target.value)}
            rows={2}
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <div className="d-grid">
          <button className="btn btn-dark d-flex align-items-center justify-content-center" type="submit">
            <Plus size={18} className="me-2" />
            Create Group
          </button>
        </div>
      </form>

      {/* Tabs */}
      <ul className="nav nav-tabs border-0 mb-3" role="tablist">
        <li className="nav-item flex-fill text-center" role="presentation">
          <button
            className={`nav-link ${
              activeTab === "groups" ? "active" : ""
            } border-0 position-relative w-100 d-flex align-items-center justify-content-center`}
            onClick={() => setActiveTab("groups")}
            style={{
              color: activeTab === "groups" ? "#000" : "#6c757d",
              borderBottom: activeTab === "groups" ? "2px solid #000" : "2px solid transparent",
              background: "none",
              fontWeight: activeTab === "groups" ? "600" : "400",
              whiteSpace: "nowrap",
            }}
          >
            <Users size={16} className="me-2" />
            Groups
            {memberGroups.length > 0 && <span className="badge bg-primary rounded-pill ms-2">{memberGroups.length}</span>}
          </button>
        </li>
        <li className="nav-item flex-fill text-center" role="presentation">
          <button
            className={`nav-link ${
              activeTab === "mygroups" ? "active" : ""
            } border-0 position-relative w-100 d-flex align-items-center justify-content-center`}
            onClick={() => setActiveTab("mygroups")}
            style={{
              color: activeTab === "mygroups" ? "#000" : "#6c757d",
              borderBottom: activeTab === "mygroups" ? "2px solid #000" : "2px solid transparent",
              background: "none",
              fontWeight: activeTab === "mygroups" ? "600" : "400",
              whiteSpace: "nowrap",
            }}
          >
            <Crown size={16} className="me-2" />
            My Groups
            {myGroups.length > 0 && <span className="badge bg-success rounded-pill ms-2">{myGroups.length}</span>}
          </button>
        </li>
      </ul>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading groups...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {renderErrorMessage && (
        <div className="alert alert-warning" role="alert">
          <strong>Rendering issue:</strong> {renderErrorMessage}
        </div>
      )}

      {!loading && displayedGroups.length === 0 && (
        <div className="text-center py-5">
          <Users size={48} className="text-muted mb-3" />
          <p className="text-muted">{activeTab === "mygroups" ? "You haven't created any groups yet." : "You're not a member of any groups yet."}</p>
        </div>
      )}

      {!loading && displayedGroups.length > 0 && (
        <ul className="list-group list-group-flush mb-3">
          {displayedGroups.map((g) => {
            const ownerId = g.owner?.id || g.owner_id || g.ownerID;
            const isOwner = ownerId && String(ownerId) === String(user?.id);
            return (
              <li key={g.id} className="list-group-item border-0 px-0 py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <strong className="d-block mb-1">{g.name}</strong>
                    <small className="text-muted">Owner: {g.owner?.name || g.owner?.email || g.owner_id || g.ownerID}</small>
                  </div>
                  <div className="d-flex gap-2">
                    {isOwner && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openInvite(g.id)} title="Invite contacts">
                        <UserPlus size={16} />
                      </button>
                    )}
                    {isOwner && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => generateInviteLink(g.id)} title="Generate invite link">
                        <Link2 size={16} />
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-info" onClick={() => openMembers(g)} title="View members">
                      <Users size={16} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {inviteModal.open && (
        <div className="card border-0 shadow-sm p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">
              <UserPlus size={20} className="me-2" />
              Invite Contacts to Group
            </h6>
            <button className="btn btn-sm btn-light" onClick={closeInvite} title="Close">
              <X size={18} />
            </button>
          </div>
          <div style={{ maxHeight: 300, overflow: "auto" }} className="mb-3">
            {contacts.length === 0 ? (
              <div className="text-center py-4">
                <UserPlus size={40} className="text-muted mb-2" />
                <p className="text-muted mb-0">No contacts available</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {contacts.map((c) => {
                  const uid = c.inviteUserId || c.id || c.email;
                  return (
                    <li key={uid} className="list-group-item border-0 px-0 py-2">
                      <label className="d-flex align-items-center" style={{ cursor: "pointer" }}>
                        <input
                          className="form-check-input me-3"
                          type="checkbox"
                          checked={selectedContacts.has(uid)}
                          onChange={() => toggleContact(uid)}
                        />
                        <div>
                          <div className="fw-semibold">{c.name || c.email || (c.user && c.user.name)}</div>
                          <small className="text-muted">{c.phone || c.email || (c.user && c.user.email)}</small>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-light" onClick={closeInvite}>
              Cancel
            </button>
            <button className="btn btn-primary d-flex align-items-center" onClick={sendInvites} disabled={selectedContacts.size === 0}>
              <CheckCircle size={16} className="me-2" />
              Send Invites ({selectedContacts.size})
            </button>
          </div>
        </div>
      )}

      {membersModal.open && (
        <div className="card border-0 shadow-sm p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">
              <Users size={20} className="me-2" />
              Members of {membersModal.group?.name}
            </h6>
            <button className="btn btn-sm btn-light" onClick={closeMembers} title="Close">
              <X size={18} />
            </button>
          </div>
          <div className="mb-3 p-3 bg-light rounded">
            <small className="text-muted d-block mb-1">Owner</small>
            <strong>{membersModal.owner ? membersModal.owner.name || membersModal.owner.email : "Unknown"}</strong>
          </div>
          <div>
            <small className="text-muted d-block mb-2">Members ({membersModal.members.length})</small>
            {membersModal.members.length === 0 ? (
              <div className="text-center py-4">
                <Users size={40} className="text-muted mb-2" />
                <p className="text-muted mb-0">No members yet</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {membersModal.members.map((m) => (
                  <li key={m.id || (m.user && m.user.id)} className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: 36, height: 36, fontSize: 14, fontWeight: 600 }}
                      >
                        {m.user ? (m.user.name || m.user.email || "?").charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="fw-semibold">{m.user ? m.user.name || m.user.email : "Unknown"}</div>
                        <small className="text-muted">@{m.user?.username || "unknown"}</small>
                      </div>
                      <div className="ms-auto d-flex align-items-center gap-2">
                        {/* show kick button only if current user is owner and this member is not the owner */}
                        {membersModal.owner &&
                          String(membersModal.owner.id) === String(user?.id) &&
                          String(m.user?.id) !== String(membersModal.owner.id) && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => kickMember(m)}
                              title="Kick member"
                              disabled={memberActionLoading.has(m.id)}
                            >
                              <CircleX size={15} />
                            </button>
                          )}

                        {/* show leave button for the current user (if not the owner) */}
                        {m.user && String(m.user.id) === String(user?.id) && String(membersModal.owner?.id) !== String(user?.id) && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => leaveGroup(m)}
                            title="Leave group"
                            disabled={memberActionLoading.has(m.id)}
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {linkModal.open && (
        <div className="card border-0 shadow-sm p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">
              <Link2 size={20} className="me-2" />
              Invite Link
            </h6>
            <button className="btn btn-sm btn-light" onClick={closeLinkModal} title="Close">
              <X size={18} />
            </button>
          </div>
          <div>
            {linkModal.token ? (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-2">Token</label>
                  <div className="input-group">
                    <input type="text" className="form-control bg-light" value={linkModal.token} readOnly style={{ fontSize: "0.875rem" }} />
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => copyToClipboard(linkModal.token)}
                      title="Copy token"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label fw-semibold mb-2">Invite Link</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={`${API_BASE}/invite?token=${linkModal.token}`}
                      readOnly
                      style={{ fontSize: "0.875rem" }}
                    />
                    <button
                      className="btn btn-primary d-flex align-items-center"
                      onClick={() => copyToClipboard(`${API_BASE}/invite?token=${linkModal.token}`)}
                      title="Copy link"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <small className="text-muted mt-2 d-block">Share this link to invite users to the group</small>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Link2 size={40} className="text-muted mb-2" />
                <p className="text-muted mb-0">Failed to generate invite link</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPanel;
